namespace LogAnalysis.System.Ingestion;

public sealed class IngestionHost(
    IEnumerable<IIngestionSource> sources,
    ILogger<IngestionHost>        logger) : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken ct)
        => throw new NotImplementedException();
}
