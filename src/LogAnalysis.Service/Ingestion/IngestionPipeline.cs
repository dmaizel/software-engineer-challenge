using LogAnalysis.Service.Pipeline;

namespace LogAnalysis.Service.Ingestion;

public sealed class IngestionPipeline(
    IEnumerable<ILogParser>      parsers,
    LogChannel                   channel,
    ILogger<IngestionPipeline>   logger)
{
    public ValueTask IngestAsync(string line, CancellationToken ct)
        => throw new NotImplementedException();
}
