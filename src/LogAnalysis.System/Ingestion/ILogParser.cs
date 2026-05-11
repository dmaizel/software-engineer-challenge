using LogAnalysis.System.Domain;

namespace LogAnalysis.System.Ingestion;

public interface ILogParser
{
    bool CanParse(string line);
    LogEntry? Parse(string line);
}
