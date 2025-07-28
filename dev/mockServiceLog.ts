import Logger from "../src/logger-sdk/logger";

const logBankMessageBank = {
  info: ["This is info log", "hello world", "this is great"],
  error: ["This is a test error log", "failed something", "not great"],
};

const mockServiceLog = () => {
  const logger = new Logger("test", {
    queueUrl: "http://localhost:3001",
    queueName: "test",
  });
  setInterval(() => {
  const randomLevel = Math.random() > 0.5 ? "info" : "error";
  const randomMessage = logBankMessageBank[randomLevel][
      Math.floor(Math.random() * logBankMessageBank[randomLevel].length)
    ];
    logger[randomLevel](randomMessage as string);
  }, 2000);
};

mockServiceLog();
