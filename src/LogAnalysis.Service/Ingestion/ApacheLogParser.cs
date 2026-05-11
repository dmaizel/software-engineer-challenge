using LogAnalysis.Service.Domain;

namespace LogAnalysis.Service.Ingestion;

public sealed class ApacheLogParser : ILogParser
{
    public bool CanParse(string line) => throw new NotImplementedException();

    public LogEntry? Parse(string line) => throw new NotImplementedException();
}
