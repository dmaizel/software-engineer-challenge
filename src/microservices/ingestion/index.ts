import { sleep } from "../../utils/sleep";
import { initQueue } from "../../common/queue/initQueue";
import { connectDatabase, createLog } from "../../odm";
import { validateLogMessage } from "./validation";

async function startIngestionService() {
  await connectDatabase();

  const queue = initQueue("http://localhost:3001");

  while (true) {
    const message = await queue.consumeMessage();
    if (message) {
      try {
        const logData = JSON.parse(message);
        const validatedLogData = validateLogMessage(logData);
        await createLog({
          message: validatedLogData.message,
          logLevel: validatedLogData.level,
          serviceName: validatedLogData.service,
          timestamp: new Date(validatedLogData.timestamp),
          metadata: {},
        });
      } catch (error) {
        console.error("Error processing log message:", error);
        console.error("Original message:", message);
      }
      await sleep(200);
      continue;
    }
    await sleep(5000);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n Shutting down ingestion service...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n Shutting down ingestion service...");
  process.exit(0);
});

startIngestionService().catch((error) => {
  console.error("Fatal error in ingestion service:", error);
  process.exit(1);
});
