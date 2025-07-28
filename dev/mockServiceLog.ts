import Logger from "../src/logger-sdk/logger";

const mockServiceLog = () => {
  const logger = new Logger("test", {
    queueUrl: "http://localhost:3001",
    queueName: "test",
  });

  // ... some code
  const sum = 1 + 1;
  if (sum === 2) {
    logger!.info("test");
  } else {
    logger!.error("test");
  }
};

mockServiceLog();
