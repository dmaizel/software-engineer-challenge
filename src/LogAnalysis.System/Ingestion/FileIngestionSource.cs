using System.Runtime.CompilerServices;

namespace LogAnalysis.System.Ingestion;

public sealed class FileIngestionSource(
    IngestionPipeline               pipeline,
    IConfiguration                  config,
    ILogger<FileIngestionSource>    logger) : IIngestionSource
{
    public async Task RunAsync(CancellationToken ct)
    {
        var path = config["Ingestion:FilePath"];
        if (string.IsNullOrWhiteSpace(path))
        {
            logger.LogInformation("FileIngestionSource disabled — no Ingestion:FilePath configured");
            return;
        }
        if (!File.Exists(path))
        {
            logger.LogWarning("Log file not found: {Path}", path);
            return;
        }

        logger.LogInformation("Replaying {Path}", path);

        var count = 0;
        await foreach (var line in ReadLinesAsync(path, ct))
        {
            await pipeline.IngestAsync(line, ct);
            count++;
        }

        logger.LogInformation("File ingestion complete: {Count} line(s) from {Path}", count, path);
    }

    private static async IAsyncEnumerable<string> ReadLinesAsync(
        string path, [EnumeratorCancellation] CancellationToken ct)
    {
        using var reader = new StreamReader(path);
        string? line;
        while ((line = await reader.ReadLineAsync(ct)) is not null)
            yield return line;
    }
}
