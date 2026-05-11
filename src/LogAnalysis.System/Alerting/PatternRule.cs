using LogAnalysis.System.Storage;

namespace LogAnalysis.System.Alerting;

public sealed class PatternRule(
    string   name,
    string   substring,
    TimeSpan window) : IAlertRule
{
    public string Name => name;

    public Task<Alert?> EvaluateAsync(ILogRepository repository, DateTimeOffset now, CancellationToken ct)
        => throw new NotImplementedException();
}
