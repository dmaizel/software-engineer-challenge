import { initQueue } from "../common/queue/initQueue";

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
  queue: any;
  service?: string;

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
    this.service = service;
    console.log(`Initialized logger for service: ${service}`);
  }

  private prepareMessage(message: string, level: LogLevel) {
    const preparedMessage = {
      service: this.service,
      message: message,
      timestamp: new Date().toISOString(),
      level: level,
    }
    return JSON.stringify(preparedMessage);
  }

  info(message: string) {
    console.log(message);
    const messageToSend = this.prepareMessage(message, 'info');
    this.queue.produceMessage(messageToSend);
  }
  error(message: string) {
    console.error(message);
    const messageToSend = this.prepareMessage(message, 'error');
    this.queue.produceMessage(messageToSend);
  }
  warn(message: string) {
    console.warn(message);
    const messageToSend = this.prepareMessage(message, 'warn');
    this.queue.produceMessage(messageToSend);
  }
  debug(message: string) {
    console.debug(message);
    const messageToSend = this.prepareMessage(message, 'debug');
    this.queue.produceMessage(messageToSend);
  }
}

export default Logger;
