using LogAnalysis.System.Domain;
using LogLevel = LogAnalysis.System.Domain.LogLevel;

namespace LogAnalysis.System.Storage;

public sealed record LogQuery(
    DateTimeOffset? StartTime,
    DateTimeOffset? EndTime,
    LogLevel?       Level,
    string?         Service,
    int             Limit,
    long?           Cursor);

public sealed record QueryResult(
    IReadOnlyList<LogEntry> Items,
    long?                   NextCursor);

public sealed record AggregateBucket(
    string Key,
    long   Count);
