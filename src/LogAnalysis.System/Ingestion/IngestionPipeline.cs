using LogAnalysis.System.Pipeline;

namespace LogAnalysis.System.Ingestion;

public sealed class IngestionPipeline(
    IEnumerable<ILogParser>      parsers,
    LogChannel                   channel,
    ILogger<IngestionPipeline>   logger)
{
    public ValueTask IngestAsync(string line, CancellationToken ct)
        => throw new NotImplementedException();
}
