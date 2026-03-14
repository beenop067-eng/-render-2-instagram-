import { Router, type IRouter } from "express";
import { GetBotStatusResponse, StartBotResponse, StopBotResponse } from "@workspace/api-zod";
import { getBotStatus, startBot, stopBot } from "../lib/bot.js";
import { db } from "@workspace/db";
import { analysesTable } from "@workspace/db/schema";
import { count } from "drizzle-orm";

const router: IRouter = Router();

router.get("/status", async (_req, res) => {
  const status = getBotStatus();
  const [row] = await db.select({ total: count() }).from(analysesTable);
  const data = GetBotStatusResponse.parse({
    ...status,
    totalAnalyses: row?.total ?? 0,
  });
  res.json(data);
});

router.post("/start", async (_req, res) => {
  const result = await startBot();
  const status = getBotStatus();
  const data = StartBotResponse.parse({
    success: result.success,
    message: result.message,
    running: status.running,
  });
  res.json(data);
});

router.post("/stop", async (_req, res) => {
  const result = await stopBot();
  const status = getBotStatus();
  const data = StopBotResponse.parse({
    success: result.success,
    message: result.message,
    running: status.running,
  });
  res.json(data);
});

export default router;
