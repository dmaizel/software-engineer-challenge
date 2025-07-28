import { z } from "zod";

const logMessageSchema = z.object({
  message: z.string(),
  level: z.enum(["info", "error", "warn", "debug"]),
  service: z.string(),
  timestamp: z.string(),
});

export const validateLogMessage = (message: string) =>
  logMessageSchema.parse(message);
