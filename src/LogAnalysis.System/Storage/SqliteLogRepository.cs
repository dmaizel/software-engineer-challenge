using System.Text;
using Microsoft.Data.Sqlite;
using LogAnalysis.System.Domain;
using LogLevel = LogAnalysis.System.Domain.LogLevel;

namespace LogAnalysis.System.Storage;

public sealed class SqliteLogRepository(
    IConfiguration                  config,
    ILogger<SqliteLogRepository>    logger) : ILogRepository
{
    private readonly string _connectionString = config["Storage:ConnectionString"]
        ?? throw new InvalidOperationException("Storage:ConnectionString missing");

    public void Initialize()
    {
        using var conn = Open();
        using var cmd  = conn.CreateCommand();
        cmd.CommandText = """
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous  = NORMAL;
            CREATE TABLE IF NOT EXISTS logs(
              id          INTEGER PRIMARY KEY,
              ts_unix_ms  INTEGER NOT NULL,
              level       INTEGER NOT NULL,
              service     TEXT    NOT NULL,
              message     TEXT    NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_logs_ts         ON logs(ts_unix_ms);
            CREATE INDEX IF NOT EXISTS idx_logs_level_ts   ON logs(level, ts_unix_ms);
            CREATE INDEX IF NOT EXISTS idx_logs_service_ts ON logs(service, ts_unix_ms);
            """;
        cmd.ExecuteNonQuery();
        logger.LogInformation("Storage initialized");
    }

    public async Task InsertAsync(IReadOnlyList<LogEntry> entries, CancellationToken ct)
    {
        if (entries.Count == 0) return;

        await using var conn = Open();
        await using var tx   = conn.BeginTransaction();
        await using var cmd  = conn.CreateCommand();
        cmd.CommandText = "INSERT INTO logs (ts_unix_ms, level, service, message) VALUES ($ts, $level, $service, $message)";
        var pTs    = cmd.Parameters.Add("$ts",      SqliteType.Integer);
        var pLevel = cmd.Parameters.Add("$level",   SqliteType.Integer);
        var pSvc   = cmd.Parameters.Add("$service", SqliteType.Text);
        var pMsg   = cmd.Parameters.Add("$message", SqliteType.Text);

        foreach (var e in entries)
        {
            pTs.Value    = e.Timestamp.ToUnixTimeMilliseconds();
            pLevel.Value = (int)e.Level;
            pSvc.Value   = e.Service;
            pMsg.Value   = e.Message;
            await cmd.ExecuteNonQueryAsync(ct);
        }

        await tx.CommitAsync(ct);
    }

    public async Task<QueryResult> QueryAsync(LogQuery q, CancellationToken ct)
    {
        await using var conn = Open();
        await using var cmd  = conn.CreateCommand();

        var sql = new StringBuilder("SELECT id, ts_unix_ms, level, service, message FROM logs WHERE 1=1");
        if (q.StartTime is { } st)            { sql.Append(" AND ts_unix_ms >= $start"); cmd.Parameters.AddWithValue("$start",  st.ToUnixTimeMilliseconds()); }
        if (q.EndTime   is { } et)            { sql.Append(" AND ts_unix_ms <= $end");   cmd.Parameters.AddWithValue("$end",    et.ToUnixTimeMilliseconds()); }
        if (q.Level     is { } lvl)           { sql.Append(" AND level = $level");        cmd.Parameters.AddWithValue("$level",  (int)lvl); }
        if (!string.IsNullOrEmpty(q.Service)) { sql.Append(" AND service = $svc");        cmd.Parameters.AddWithValue("$svc",    q.Service); }
        if (q.Cursor    is { } cur)           { sql.Append(" AND id < $cursor");          cmd.Parameters.AddWithValue("$cursor", cur); }
        sql.Append(" ORDER BY id DESC LIMIT $limit");
        cmd.Parameters.AddWithValue("$limit", q.Limit);
        cmd.CommandText = sql.ToString();

        var items  = new List<LogEntry>(q.Limit);
        long? last = null;
        await using var r = await cmd.ExecuteReaderAsync(ct);
        while (await r.ReadAsync(ct))
        {
            last = r.GetInt64(0);
            items.Add(ReadEntry(r, tsOrdinal: 1));
        }

        var nextCursor = items.Count == q.Limit ? last : null;
        return new QueryResult(items, nextCursor);
    }

    public async Task<IReadOnlyList<AggregateBucket>> AggregateAsync(
        DateTimeOffset start, DateTimeOffset end, string groupBy, CancellationToken ct)
    {
        var col = groupBy switch
        {
            "level"   => "level",
            "service" => "service",
            _         => throw new ArgumentException("groupBy must be 'level' or 'service'", nameof(groupBy))
        };

        await using var conn = Open();
        await using var cmd  = conn.CreateCommand();
        cmd.CommandText = $"SELECT {col}, COUNT(*) FROM logs WHERE ts_unix_ms BETWEEN $s AND $e GROUP BY {col} ORDER BY 2 DESC";
        cmd.Parameters.AddWithValue("$s", start.ToUnixTimeMilliseconds());
        cmd.Parameters.AddWithValue("$e", end.ToUnixTimeMilliseconds());

        var buckets = new List<AggregateBucket>();
        await using var r = await cmd.ExecuteReaderAsync(ct);
        while (await r.ReadAsync(ct))
        {
            var key = col == "level"
                ? ((LogLevel)r.GetInt32(0)).ToString()
                : r.GetString(0);
            buckets.Add(new AggregateBucket(key, r.GetInt64(1)));
        }
        return buckets;
    }

    public async Task<long> CountAsync(LogLevel level, DateTimeOffset since, CancellationToken ct)
    {
        await using var conn = Open();
        await using var cmd  = conn.CreateCommand();
        cmd.CommandText = "SELECT COUNT(*) FROM logs WHERE level = $level AND ts_unix_ms >= $since";
        cmd.Parameters.AddWithValue("$level", (int)level);
        cmd.Parameters.AddWithValue("$since", since.ToUnixTimeMilliseconds());
        return (long)(await cmd.ExecuteScalarAsync(ct))!;
    }

    public async Task<IReadOnlyList<LogEntry>> SearchAsync(string substring, DateTimeOffset since, CancellationToken ct)
    {
        await using var conn = Open();
        await using var cmd  = conn.CreateCommand();
        cmd.CommandText = "SELECT ts_unix_ms, level, service, message FROM logs WHERE ts_unix_ms >= $since AND message LIKE $pat";
        cmd.Parameters.AddWithValue("$since", since.ToUnixTimeMilliseconds());
        cmd.Parameters.AddWithValue("$pat",   "%" + substring + "%");

        var items = new List<LogEntry>();
        await using var r = await cmd.ExecuteReaderAsync(ct);
        while (await r.ReadAsync(ct))
            items.Add(ReadEntry(r, tsOrdinal: 0));
        return items;
    }

    private static LogEntry ReadEntry(SqliteDataReader r, int tsOrdinal) =>
        new(
            Timestamp: DateTimeOffset.FromUnixTimeMilliseconds(r.GetInt64(tsOrdinal)),
            Level:     (LogLevel)r.GetInt32(tsOrdinal + 1),
            Service:   r.GetString(tsOrdinal + 2),
            Message:   r.GetString(tsOrdinal + 3));

    private SqliteConnection Open()
    {
        var conn = new SqliteConnection(_connectionString);
        conn.Open();
        return conn;
    }
}
