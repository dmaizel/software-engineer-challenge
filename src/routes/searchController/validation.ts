import { z } from "zod";

const searchQuerySchema = z.object({
  query: z.object({
    serviceName: z.array(z.string()).optional(),
    message: z.string().optional(),
    logLevel: z.array(z.enum(["info", "error", "warn", "debug"])).optional(),
    startDate: z.string().transform((val) => new Date(val)),
    endDate: z.string().transform((val) => new Date(val)).optional(),
  }),
  page: z.number().optional(),
});

export const validateSearchQuery = (query: unknown) => {
  return searchQuerySchema.safeParse(query);
};