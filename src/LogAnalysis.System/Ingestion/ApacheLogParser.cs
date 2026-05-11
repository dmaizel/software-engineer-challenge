using LogAnalysis.System.Domain;

namespace LogAnalysis.System.Ingestion;

public sealed class ApacheLogParser : ILogParser
{
    public bool CanParse(string line) => throw new NotImplementedException();

    public LogEntry? Parse(string line) => throw new NotImplementedException();
}
