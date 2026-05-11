namespace LogAnalysis.System.Alerting;

public sealed class FileAlertSink(
    IConfiguration              config,
    ILogger<FileAlertSink>      logger) : IAlertSink
{
    public Task WriteAsync(Alert alert, CancellationToken ct)
        => throw new NotImplementedException();
}
