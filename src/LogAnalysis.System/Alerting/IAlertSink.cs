namespace LogAnalysis.System.Alerting;

public interface IAlertSink
{
    Task WriteAsync(Alert alert, CancellationToken ct);
}
