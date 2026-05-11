using System.Threading.Channels;
using LogAnalysis.System.Domain;

namespace LogAnalysis.System.Pipeline;

public sealed class LogChannel
{
    public ChannelWriter<LogEntry> Writer => throw new NotImplementedException();
    public ChannelReader<LogEntry> Reader => throw new NotImplementedException();
}
