using LogAnalysis.Service.Domain;

namespace LogAnalysis.Service.Ingestion;

public interface ILogParser
{
    bool CanParse(string line);
    LogEntry? Parse(string line);
}
