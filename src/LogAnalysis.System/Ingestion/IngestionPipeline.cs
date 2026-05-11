using LogAnalysis.System.Pipeline;

namespace LogAnalysis.System.Ingestion;

public sealed class IngestionPipeline(
    IEnumerable<ILogParser>      parsers,
    LogChannel                   channel,
    ILogger<IngestionPipeline>   logger)
{
    private readonly ILogParser[] _parsers = parsers.ToArray();

    public async ValueTask IngestAsync(string line, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(line)) return;

        foreach (var parser in _parsers)
        {
            if (!parser.CanParse(line)) continue;

            var entry = parser.Parse(line);
            if (entry is null) continue;

            await channel.Writer.WriteAsync(entry, ct);
            return;
        }

        logger.LogDebug("No parser matched line: {Preview}", Preview(line));
    }

    private static string Preview(string line) =>
        line.Length <= 80 ? line : line[..80];
}
