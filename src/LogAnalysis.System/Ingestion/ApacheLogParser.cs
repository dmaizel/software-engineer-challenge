using System.Globalization;
using System.Text.RegularExpressions;
using LogAnalysis.System.Domain;
using LogLevel = LogAnalysis.System.Domain.LogLevel;

namespace LogAnalysis.System.Ingestion;

public sealed partial class ApacheLogParser : ILogParser
{
    private const string DateFormat = "dd/MMM/yyyy:HH:mm:ss zzz";
    private const string ServiceTag = "apache";

    [GeneratedRegex(
        @"^\S+ \S+ \S+ \[(?<ts>[^\]]+)\] ""(?<req>[^""]*)"" (?<status>\d{3}) ",
        RegexOptions.Compiled)]
    private static partial Regex Pattern();

    public bool CanParse(string line) => Pattern().IsMatch(line);

    public LogEntry? Parse(string line)
    {
        var m = Pattern().Match(line);
        if (!m.Success) return null;

        if (!DateTimeOffset.TryParseExact(
                m.Groups["ts"].Value, DateFormat,
                CultureInfo.InvariantCulture, DateTimeStyles.None, out var ts))
        {
            ts = DateTimeOffset.UtcNow;
        }

        var status = int.Parse(m.Groups["status"].Value, CultureInfo.InvariantCulture);
        var level  = status >= 500 ? LogLevel.Error
                   : status >= 400 ? LogLevel.Warn
                   :                 LogLevel.Info;

        return new LogEntry(ts.ToUniversalTime(), level, ServiceTag, m.Groups["req"].Value);
    }
}
