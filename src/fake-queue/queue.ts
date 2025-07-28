function fifoQueue(_url: string, _name: string) {
  const queueName = _name;
  const queue: string[] = [];
  return () => ({
    produceMessage: (message: string) => {
      queue.push(message);
    },
    consumeMessage: () => {
      return queue.pop();
    },
    getName: () => {
      return queueName;
    }
  });
}

export default fifoQueue;