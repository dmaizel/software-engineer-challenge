using LogAnalysis.System.Domain;
using LogAnalysis.System.Storage;
using LogLevel = LogAnalysis.System.Domain.LogLevel;

namespace LogAnalysis.System.Alerting;

public sealed class ThresholdRule(
    string   name,
    LogLevel level,
    long     threshold,
    TimeSpan window) : IAlertRule
{
    public string Name => name;

    public Task<Alert?> EvaluateAsync(ILogRepository repository, DateTimeOffset now, CancellationToken ct)
        => throw new NotImplementedException();
}
