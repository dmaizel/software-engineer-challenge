# Distributed Log Analysis System — Design

## 1. Overview

A single-process ASP.NET Core app that ingests logs, parses and enriches them, persists to a queryable store, exposes a query API, and runs background alerting. The internal boundaries (`Api → Service → Storage`) mirror the service split a production deployment would use.

**Demo input:** `src/apache_log.txt` is loaded on startup and replayed through the pipeline. This is the path used for the presentation.

**Production input:** the same pipeline would be fed by a `POST /logs` HTTP endpoint (or a Kafka consumer).
---

## 2. Architecture

```
                                                                            
   src/apache_log.txt ──┐                                                   
                        ▼                                                   
                  ┌────────────┐    ┌──────────┐    ┌──────────────┐        
   [POST /logs]──>│ Ingestion  │───>│  Log     │───>│  Pipeline    │        
   (prod, off)    │  Service   │    │ Channel  │    │  Worker      │        
                  │ ILogParser │    │ (bound)  │    │ enrich+store │        
                  └────────────┘    └──────────┘    └──────┬───────┘        
                                                          │                
                                                          ▼                
                                                   ┌─────────────┐         
                                                   │   SQLite    │         
                                                   │  + indexes  │         
                                                   └──────┬──────┘         
                                                          │                
                            ┌─────────────────────────────┼──────────────┐ 
                            ▼                             ▼              │ 
                     ┌────────────┐                ┌──────────────┐      │ 
                     │ Query API  │                │ Alert Worker │──────┘ 
                     │ GET /logs  │                │ rolling win  │        
                     │ GET /agg   │                └──────┬───────┘        
                     └─────┬──────┘                       │                
                           ▼                              ▼                
                      HTTP clients                   alerts.log            
```

**Flow:**
1. **Ingestion** reads lines (from file for demo, from HTTP/Kafka in production), runs each line through the first matching `ILogParser`, and pushes a `LogEntry` to a bounded in-memory channel.
2. **Channel** decouples ingestion from storage — writes return immediately; the consumer runs independently.
3. **Pipeline worker** drains the channel, normalizes/enriches each entry (UTC timestamp, level enum, message bounds), and batch-writes to SQLite.
4. **Query API** reads SQLite directly with filtered/aggregated queries.
5. **Alert worker** polls SQLite on a fixed cadence, evaluates threshold and pattern rules over a rolling window, writes notifications to `alerts.log` and console.

---

## 3. Layers

The project is structured such that each folder maps to one concern.

### `Api/` — HTTP boundary
- **`GET /logs?startTime&endTime&level&service&limit&cursor`** — filtered, paginated, ordered by `ts DESC`.
- **`GET /logs/aggregate?startTime&endTime&groupBy=level|service`** — count by group over the window.
- **`POST /logs`** *(production path, commented out)* — accepts a JSON `LogEntry`, returns `202 Accepted`, writes to the same channel as file ingestion. Off by default; the demo uses file replay.

### `Service/` — application logic
- **`Ingestion/`**
  - `ILogParser` — `bool CanParse(string)` + `LogEntry? Parse(string)`. Tried in registration order, first match wins.
  - `ApacheLogParser` — Apache Combined Log Format. Derives `level` from HTTP status (5xx → Error, 4xx → Warn, 2xx/3xx → Info).
  - `FileIngestionService` — demo source. Reads the configured file path on startup, dispatches each parsed line to the channel.
- **`Pipeline/`**
  - `LogChannel` — wraps `System.Threading.Channels.Channel<LogEntry>`, bounded capacity, `DropOldest` on full, single reader.
  - `PipelineWorker : BackgroundService` — `await foreach` over the channel, enriches, batches inserts.
- **`Alerting/`**
  - `AlertWorker : BackgroundService` — periodic SQL query for threshold/pattern rules, cooldown per rule, writes to `alerts.log`.
  - Rules loaded from `appsettings.json`.

### `Storage/` — persistence
- `LogRepository` — schema initialization, batch insert, filtered/aggregated reads. All SQL parameterized. Hides the SQLite client from upper layers so the engine can be swapped.
- SQLite, WAL journal mode, single file.

### `Domain/` — shared types
- `LogEntry(DateTimeOffset Timestamp, LogLevel Level, string Service, string Message)`
- `LogLevel` enum: `Debug, Info, Warn, Error, Fatal`

---

## 4. Demo vs. Production: how each part changes?

The demo runs everything in one process. Production splits the same boundaries across separately deployable services. Each row below is one of those boundaries — *the folder layout today is the deployment layout tomorrow.*

| Layer (folder) | Demo (single process) | Production (separate services) |
|---|---|---|
| **Ingestion** (`Ingestion/`) | `FileIngestionSource` reads `apache_log.txt` at startup; `ApacheLogParser` turns each line into a `LogEntry` and hands it to `IngestionPipeline`. | A fleet of stateless HTTP ingestion pods behind a load balancer accepting `POST /logs`; **or** a Kafka consumer group reading from a `raw-logs` topic. The same `ILogParser` implementations run in both — only the source changes. |
| **Transport** (`Pipeline/LogChannel`) | In-process bounded `Channel<LogEntry>` with drop-oldest on overflow. Dies with the process. | Kafka (or equivalent broker) partitioned by `service` or hashed key. Durable, replayable, survives crashes, decouples producer and consumer deployment. |
| **Pipeline worker** (`Pipeline/PipelineWorker`) | One `BackgroundService` draining the channel and batch-writing to SQLite. | A pool of stateless worker pods, one or more per Kafka partition. Horizontal scale = add pods. Idempotent writes via deterministic id let any pod resume any partition. |
| **Storage** (`Storage/`) | `SqliteLogRepository`: single SQLite file, WAL mode, three composite indexes. | A distributed engine chosen by access pattern — OpenSearch for text search, ClickHouse for aggregates, S3 + Parquet for cold storage — tiered hot/warm/cold by age. Same `ILogRepository` interface; only the implementation swaps. |
| **Query API** (`Api/QueryEndpoints`) | Minimal-API endpoints in the same process, reading from the same SQLite file. | A separate read-only service, scaled independently of ingestion. Talks to read replicas (hot) and the OLAP engine (warm); object-storage scan for cold queries. |
| **Alerting** (`Alerting/AlertWorker`) | One `BackgroundService` polling SQLite on a cadence, evaluating in-process `IAlertRule` instances, writing to `alerts.log` via `FileAlertSink`. | Dedicated alert worker pods. Rules partitioned by service. Last-fired / cooldown state in Redis (or the storage tier) so restarts don't re-fire. Sinks fan out to Slack/PagerDuty/email implementations of `IAlertSink`. |

**The migration:** extracting any layer to its own service is mostly a wire-up change — `LogChannel` becomes a Kafka producer/consumer, `SqliteLogRepository` becomes an OpenSearch client. The seams (`ILogParser`, `IIngestionSource`, `ILogRepository`, `IAlertRule`, `IAlertSink`) don't move; the implementations behind them do. Producers and consumers never see the transport change.

---

## 5. Key Abstractions

| Abstraction | Purpose | Why it's an abstraction |
|---|---|---|
| `ILogParser` | Parse one line of one format into `LogEntry` | New log formats = one new class + one DI registration. Open/closed. |
| `LogChannel` | Producer/consumer decoupling | Single seam between ingestion and processing — swappable for a broker without touching producers or consumers. |
| `LogRepository` | Read/write logs | Swappable storage (SQLite → OpenSearch/ClickHouse) without touching pipeline or query code. |
| `IHostedService` (built-in) | Run pipeline and alert workers | Standard ASP.NET Core lifecycle, graceful shutdown. |

---

## 6. Extensibility

- **New log format** — add `ILogParser` implementation, register in DI. No other code changes.
- **New ingestion source** — file/HTTP/Kafka all write `LogEntry` to the same `LogChannel`. Everything downstream is source-agnostic.
- **New query filter** — extend the SQL builder in `LogRepository` and the endpoint parameter binding. Schema already indexed for the common shapes.
- **New alert rule type** — add a rule class with an `Evaluate(IReadOnlyList<LogEntry>)` method; register in `appsettings.json`. Existing threshold/pattern rules follow the same pattern.
- **New output sink** — alerting and query results both go through narrow seams (a writer interface for alerts, a response DTO for queries) — adding email/Slack/webhook output is a new sink implementation, not a rewrite.

---

## 7. Technology Choices

| Choice | Rationale |
|---|---|
| **ASP.NET Core Minimal API** | Standard, idiomatic .NET, minimal ceremony, built-in DI/hosting/logging. |
| **`System.Threading.Channels`** | Standard library. The closest in-process analogue to a broker — bounded buffer, async push/pull, backpressure policy. No NuGet. |
| **SQLite via `Microsoft.Data.Sqlite`** | Only external NuGet. Zero setup, ACID, ships with .NET, ships in-process, supports the indexes we need. Enough to demonstrate schema design and query patterns. |
| **`BackgroundService`** | Standard library. Pipeline and alert worker are textbook background services. |
| **No mocks** | Real SQLite file, real file I/O, real channel — per CLAUDE.md guidance. |

---

## 8. Storage Schema

```sql
CREATE TABLE logs(
  id          INTEGER PRIMARY KEY,
  ts_unix_ms  INTEGER NOT NULL,   -- UTC milliseconds since epoch
  level       INTEGER NOT NULL,   -- enum value
  service     TEXT    NOT NULL,
  message     TEXT    NOT NULL
);
CREATE INDEX idx_logs_ts         ON logs(ts_unix_ms);
CREATE INDEX idx_logs_level_ts   ON logs(level, ts_unix_ms);
CREATE INDEX idx_logs_service_ts ON logs(service, ts_unix_ms);
```

- **Integer timestamps** — faster compare/sort, smaller index pages, native range scans. ISO 8601 stays at the API boundary only.
- **Composite indexes** lead with the filter column and end with `ts_unix_ms` so the index covers the common query shape: "logs of level X in service Y between T1 and T2".
- **WAL mode** — readers don't block the writer and vice versa. Important because the pipeline writes continuously while query and alert workers read.

---

## 9. Trade-offs & Assumptions

### Single process, not microservices
The README describes a distributed system. This implementation is a single process. The boundary between `Ingestion → Pipeline → Storage → Query` is the same boundary a production system would split across services. The namespaces are organized so that extraction is mechanical — replace `LogChannel` with a Kafka client and each layer becomes its own deployable.

### File ingestion, not HTTP
The presentation replays `src/apache_log.txt`. The `POST /logs` endpoint is scaffolded but commented out. **Why:** demonstrating the pipeline doesn't require a load generator, and the parser/channel/pipeline are identical regardless of source. The endpoint is one method away from being live.

### SQLite, not a distributed store
Demonstrates schema, indexing, and query patterns. SQLite is a single-writer engine and would bottleneck above a few thousand writes/sec in production. Real choice depends on access pattern (OpenSearch for text search; ClickHouse for aggregates; S3+Parquet for cold storage).

### Drop-oldest backpressure
The channel uses `BoundedChannelFullMode.DropOldest`. **Why:** a logging system must never push backpressure to the producer (a payments service should not slow down because logs are slow). Among lossy options, dropping the oldest keeps the most recent — typically the most useful — entries when something is going wrong. Trade-off: silent loss; mitigated in production with a drop counter and alert.

### Apache log timestamps are historical (from 2015)
Alert rules over "now − 5 minutes" won't fire on the demo data. For presentation, we can either (a) note this verbally and run an aggregate query instead, or (b) add a replay-as-now flag that rewrites timestamps to the current window. (b) is a one-liner if needed.

---

## 10. Scalability

| Tier | Current bottleneck | How it scales out |
|---|---|---|
| Ingestion | One process | Stateless behind a load balancer; many pods. |
| Transport | In-process channel | Kafka, partitioned by `service` or hashed key. |
| Pipeline | Single SQLite writer | Stateless workers per partition; idempotent writes via deterministic id. |
| Storage | One SQLite file | Distributed engine (OpenSearch / ClickHouse); tier hot/warm/cold by age. |
| Query | Same SQLite file | Read replicas (hot) + OLAP engine (warm) + object-storage scan (cold). |
| Alerting | Rolling window in process | Partition rules by service; shared state in Redis if rules cross partitions. |

Principles applied:
- **Decouple writes from reads** — ingestion never waits on storage.
- **Decouple by service/tenant** — partitioning enables linear scale-out for transport and storage.
- **Tier by access frequency** — recent data is hot and fast; old data is cold and cheap.

---

## 11. Failure Points

| Failure | Current behavior | Production mitigation |
|---|---|---|
| Process crash | In-flight channel contents lost | Durable broker (Kafka); at-least-once delivery + idempotent writes. |
| Burst load | Channel drops oldest silently | Counter + alert on drops; broker absorbs burst. |
| SQLite write fails | Pipeline logs + drops | Bounded retry + dead-letter queue; disk monitoring. |
| SQLite corruption | Service down until file replaced | Replicated storage; snapshots; PITR. |
| Slow query | Other queries queue | Query timeouts, per-caller rate limits, dedicated read replicas. |
| Source clock skew | Misaligned windows | Store server receipt time as a second column; reject far-future stamps. |
| Alert re-fires on restart | Possible duplicate | Persist last-fired per rule; dedupe on `(rule, window)`. |
| Unsafe regex in rule config | Pipeline lags | Compile once + per-match timeout; reject unsafe patterns at load. |

---

## 12. What I'd Do Differently With More Time

- **`POST /logs` live** instead of commented out, with a small load-generator harness.
- **Retention / archival** — delete or archive logs older than N days to object storage.
- **Pre-computed rollups** — per-minute counts by `(service, level)` for dashboard queries.
- **Live tail** — WebSocket/SSE endpoint streaming new entries to subscribers.
- **Structured payloads** — accept arbitrary key/value fields; index `trace_id` / `request_id` for cross-service correlation.
- **Observability of the observability system** — OpenTelemetry traces through the pipeline, metrics for queue depth, drop count, write latency, query p50/p95/p99.
- **Tests** — load test on ingestion, property tests on query filters, integration test replaying the Apache log against a fresh SQLite and asserting end-to-end counts.
