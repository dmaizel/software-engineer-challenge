using LogAnalysis.System.Domain;
using LogAnalysis.System.Storage;

namespace LogAnalysis.System.Pipeline;

public sealed class PipelineWorker(
    LogChannel              channel,
    ILogRepository          repository,
    ILogger<PipelineWorker> logger) : BackgroundService
{
    private const int BatchSize        = 500;
    private const int MaxMessageLength = 4096;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var batch = new List<LogEntry>(BatchSize);

        while (await channel.Reader.WaitToReadAsync(ct))
        {
            while (batch.Count < BatchSize && channel.Reader.TryRead(out var entry))
                batch.Add(Enrich(entry));

            await Flush(batch, ct);
        }

        await Flush(batch, ct);
    }

    private async Task Flush(List<LogEntry> batch, CancellationToken ct)
    {
        if (batch.Count == 0) return;

        try
        {
            await repository.InsertAsync(batch, ct);
            logger.LogDebug("Inserted batch of {Count}", batch.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Batch insert failed; dropping {Count} entries", batch.Count);
        }
        finally
        {
            batch.Clear();
        }
    }

    private static LogEntry Enrich(LogEntry e) => e with
    {
        Timestamp = e.Timestamp.ToUniversalTime(),
        Message   = e.Message.Length <= MaxMessageLength ? e.Message : e.Message[..MaxMessageLength]
    };
}
