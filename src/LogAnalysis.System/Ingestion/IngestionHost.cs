namespace LogAnalysis.System.Ingestion;

public sealed class IngestionHost(
    IEnumerable<IIngestionSource> sources,
    ILogger<IngestionHost>        logger) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken ct)
    {
        var tasks = sources.Select(s => RunSafe(s, ct)).ToArray();

        if (tasks.Length == 0)
        {
            logger.LogInformation("No ingestion sources registered");
            return Task.CompletedTask;
        }

        logger.LogInformation("Starting {Count} ingestion source(s)", tasks.Length);
        return Task.WhenAll(tasks);
    }

    private async Task RunSafe(IIngestionSource source, CancellationToken ct)
    {
        try
        {
            await source.RunAsync(ct);
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            logger.LogError(ex, "Ingestion source {Type} failed", source.GetType().Name);
        }
    }
}
