import { initQueue } from "../common/queue/initQueue";

class Logger {
  queue: any;
  constructor(
    service: string,
    options: { queueUrl: string; queueName: string }
  ) {
    const url = options.queueUrl || process.env["QUEUE_URL"];
    const name = options.queueName || process.env["QUEUE_NAME"];
    if(!url || !name) {
      console.log('WARN: cannot initialize logger')
      return;
    }
    this.queue = initQueue(url);
    console.log(`Initialized logger for service: ${service}`);
  }
  info(message: string) {
    console.log(message);
    this.queue.produceMessage(message);
  }
  error(message: string) {
    console.error(message);
    this.queue.produceMessage(message);
  }
  warn(message: string) {
    console.warn(message);
    this.queue.produceMessage(message);
  }
  debug(message: string) {
    console.debug(message);
    this.queue.produceMessage(message);
  }
}

export default Logger;
