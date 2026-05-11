using LogAnalysis.System.Storage;

namespace LogAnalysis.System.Alerting;

public sealed class AlertWorker(
    IEnumerable<IAlertRule> rules,
    IEnumerable<IAlertSink> sinks,
    ILogRepository          repository,
    IConfiguration          config,
    ILogger<AlertWorker>    logger) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken ct)
        => throw new NotImplementedException();
}
