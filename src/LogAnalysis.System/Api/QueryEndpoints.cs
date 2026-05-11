using LogAnalysis.System.Storage;

namespace LogAnalysis.System.Api;

public static class QueryEndpoints
{
    public static IEndpointRouteBuilder MapQueryEndpoints(this IEndpointRouteBuilder app)
    {
        // GET /logs?startTime&endTime&level&service&limit&cursor
        // GET /logs/aggregate?startTime&endTime&groupBy=level|service

        // --- Production ingestion path (commented out for the demo) ----------
        // POST /logs: accepts a JSON LogEntry, returns 202 Accepted, writes
        // straight into the same LogChannel that FileIngestionSource uses.
        // The pipeline downstream is source-agnostic, so enabling this is a
        // one-method change. The demo replays src/apache_log.txt instead.
        // ---------------------------------------------------------------------

        return app;
    }
}
