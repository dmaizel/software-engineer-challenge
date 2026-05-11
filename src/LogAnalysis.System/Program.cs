using LogAnalysis.System.Alerting;
using LogAnalysis.System.Api;
using LogAnalysis.System.Ingestion;
using LogAnalysis.System.Pipeline;
using LogAnalysis.System.Storage;

var builder = WebApplication.CreateBuilder(args);

// Transport -----------------------------------------------------------------
builder.Services.AddSingleton<LogChannel>();

// Storage -------------------------------------------------------------------
builder.Services.AddSingleton<ILogRepository, SqliteLogRepository>();

// Ingestion -----------------------------------------------------------------
// Parsers: each format = one ILogParser registration.
builder.Services.AddSingleton<ILogParser, ApacheLogParser>();

// Sources: each source = one IIngestionSource registration; IngestionHost runs them.
builder.Services.AddSingleton<IIngestionSource, FileIngestionSource>();
builder.Services.AddSingleton<IngestionPipeline>();
builder.Services.AddHostedService<IngestionHost>();

// Pipeline (drains LogChannel into ILogRepository) --------------------------
builder.Services.AddHostedService<PipelineWorker>();

// Alerting ------------------------------------------------------------------
// Rules + sinks are pluggable. Concrete rules are built from appsettings.
// TODO: bind IConfiguration "Alerting" section into ThresholdRule/PatternRule instances.
builder.Services.AddSingleton<IAlertSink, FileAlertSink>();
builder.Services.AddHostedService<AlertWorker>();

var app = builder.Build();

// Schema init at startup
app.Services.GetRequiredService<ILogRepository>().Initialize();

// HTTP endpoints (POST /logs is commented out inside QueryEndpoints)
app.MapQueryEndpoints();

app.Run();
