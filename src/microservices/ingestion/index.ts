import { sleep } from "../../utils/sleep";
import { initQueue } from "../../common/queue/initQueue";

async function startIngestionService() {
  const queue = initQueue('http://localhost:3001');
  while (true) {
    const message = await queue.consumeMessage();
    if (message) {
      console.log(message);
      sleep(200);
      continue;
    }
    sleep(5000);
  }
}

startIngestionService();
