using LogAnalysis.Service.Domain;

namespace LogAnalysis.Service.Storage;

public interface ILogRepository
{
    void Initialize();

    Task InsertAsync(IReadOnlyList<LogEntry> entries, CancellationToken ct);

    Task<QueryResult> QueryAsync(LogQuery query, CancellationToken ct);

    Task<IReadOnlyList<AggregateBucket>> AggregateAsync(
        DateTimeOffset start, DateTimeOffset end, string groupBy, CancellationToken ct);

    Task<long> CountAsync(LogLevel level, DateTimeOffset since, CancellationToken ct);

    Task<IReadOnlyList<LogEntry>> SearchAsync(string substring, DateTimeOffset since, CancellationToken ct);
}
