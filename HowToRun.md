If you ran 'dotnet run' right now, the app would:
  1. Initialize SQLite (logs.db created, schema
  applied).
  2. Start IngestionHost, which starts
  FileIngestionSource.
  3. Stream src/apache_log.txt → parse → push to
  channel → batch-write to SQLite.
  4. Sit idle once the file is exhausted, waiting
  for more producers (there are none).
  5. GET /logs would return 404 because we haven't
  mapped the endpoints yet.
  6. The alert worker is registered but throws on
  first tick because it's still a stub.