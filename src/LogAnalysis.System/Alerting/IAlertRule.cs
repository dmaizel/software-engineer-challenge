using LogAnalysis.System.Storage;

namespace LogAnalysis.System.Alerting;

public interface IAlertRule
{
    string Name { get; }

    Task<Alert?> EvaluateAsync(ILogRepository repository, DateTimeOffset now, CancellationToken ct);
}

public sealed record Alert(string RuleName, string Detail, DateTimeOffset FiredAt);
