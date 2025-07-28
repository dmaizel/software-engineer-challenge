import { Router, Request, Response } from "express";
import { getLogs } from "../../odm";
import { SEARCH_LIMIT } from "./constants";
import { validateSearchQuery } from "./validation";
import { getLogsCount } from "../../odm/Logs/LogsRepository";

const router = Router();

router.post("/search", async (req: Request, res: Response) => {
  try {
    console.log("req.body", req.body);
    const parsedBody = validateSearchQuery(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.message });
    }

    const { query, page = 1 } = parsedBody.data;
    const [logs, total] = await Promise.all([
      getLogs(query, page, SEARCH_LIMIT),
      getLogsCount(query),
    ]);

    return res.json({ results: logs, total });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
