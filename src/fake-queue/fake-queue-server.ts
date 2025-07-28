import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import fifoQueue from "./queue";

dotenv.config();

const queue = fifoQueue("http://localhost:3001", "log-ingestion")();

const app = express();
const PORT: number = parseInt(process.env["PORT"] || "3001", 10);

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/produce", (req, res) => {
  queue.produceMessage(req.body.message);
  res.send("success");
});

app.use("/consume", (_req, res) => {
  const message = queue.consumeMessage();
  res.send({ message: message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env["NODE_ENV"] || "development"}`);
});

export default app;
