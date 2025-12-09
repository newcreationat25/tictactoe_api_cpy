import { Router, Request, Response } from "express";
import { authenticateJWT } from "./auth";
import db from "../db/db";
import { users } from "../schema/user";
import { sql } from "drizzle-orm";
import { sendSuccess, sendError } from "../utils/responseBuilder";

const analyticsRoute = Router();

/**
 * TOTAL USERS
 * POST /analytics/total-users
 */
analyticsRoute.post("/total-users", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const result = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const total = result[0].count;

    return res.status(200).json(sendSuccess(res, true, "Total users fetched", total));
  } catch (err: any) {
    return res
      .status(200)
      .json(sendError("Failed to fetch total users", 500, err.message));
  }
});

/**
 * PLATFORM USAGE
 * POST /analytics/platform-usage
 */
analyticsRoute.post("/platform-usage", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        platform: users.platform,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .groupBy(users.platform);

    return res.status(200).json(sendSuccess(res, true, "Platform usage fetched", result));
  } catch (err: any) {
    return res
      .status(200)
      .json(sendError("Failed to fetch platform usage", 500, err.message));
  }
});

/**
 * DAILY SIGNUPS
 * POST /analytics/daily-signups
 */
analyticsRoute.post("/daily-signups", authenticateJWT, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select({
        date: sql<string>`DATE("createdAt")`,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .groupBy(sql`DATE("createdAt")`)
      .orderBy(sql`DATE("createdAt")`);

    return res.status(200).json(sendSuccess(res, true, "Daily signups fetched", rows));
  } catch (err: any) {
    return res
      .status(200)
      .json(sendError("Failed to fetch daily signups", 500, err.message));
  }
});

/**
 * APP PERFORMANCE
 * POST /analytics/app-performance
 */
analyticsRoute.post("/app-performance", authenticateJWT, async (req: Request, res: Response) => {
  try {
    // Dummy values for now
    const performance = [
      { metric: "avg_response_time_ms", value: 120 },
      { metric: "crashes_last_24h", value: 2 },
      { metric: "api_success_rate", value: "99.1%" },
      { metric: "average_memory_usage_mb", value: 180 },
    ];

    return res.status(200).json(sendSuccess(res, true, "App performance fetched", performance));
  } catch (err: any) {
    return res
      .status(200)
      .json(sendError("Failed to fetch app performance", 500, err.message));
  }
});

export default analyticsRoute;
