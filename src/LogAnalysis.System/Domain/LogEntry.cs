namespace LogAnalysis.System.Domain;

public sealed record LogEntry(
    DateTimeOffset Timestamp,
    LogLevel       Level,
    string         Service,
    string         Message);
