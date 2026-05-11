namespace LogAnalysis.Service.Ingestion;

public interface IIngestionSource
{
    Task RunAsync(CancellationToken ct);
}
