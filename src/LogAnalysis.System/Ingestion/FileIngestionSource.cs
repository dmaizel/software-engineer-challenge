namespace LogAnalysis.System.Ingestion;

public sealed class FileIngestionSource(
    IngestionPipeline               pipeline,
    IConfiguration                  config,
    ILogger<FileIngestionSource>    logger) : IIngestionSource
{
    public Task RunAsync(CancellationToken ct) => throw new NotImplementedException();
}
