namespace LogAnalysis.System.Ingestion;

public interface IIngestionSource
{
    Task RunAsync(CancellationToken ct);
}
