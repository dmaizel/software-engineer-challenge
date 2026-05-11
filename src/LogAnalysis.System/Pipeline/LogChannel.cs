using System.Threading.Channels;
using LogAnalysis.System.Domain;

namespace LogAnalysis.System.Pipeline;

public sealed class LogChannel
{
    private const int Capacity = 10_000;

    private readonly Channel<LogEntry> _channel = Channel.CreateBounded<LogEntry>(
        new BoundedChannelOptions(Capacity)
        {
            FullMode     = BoundedChannelFullMode.DropOldest,
            SingleReader = true,
            SingleWriter = false
        });

    public ChannelWriter<LogEntry> Writer => _channel.Writer;
    public ChannelReader<LogEntry> Reader => _channel.Reader;
}
