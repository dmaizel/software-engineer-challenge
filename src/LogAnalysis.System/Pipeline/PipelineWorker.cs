using LogAnalysis.System.Storage;

namespace LogAnalysis.System.Pipeline;

public sealed class PipelineWorker(
    LogChannel              channel,
    ILogRepository          repository,
    ILogger<PipelineWorker> logger) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken ct)
        => throw new NotImplementedException();
}
