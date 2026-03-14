import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { analysesTable } from "@workspace/db/schema";
import { desc, count, sql } from "drizzle-orm";
import { fetchInstagramProfile } from "../lib/instagram.js";
import {
  GetRecentAnalysesResponse,
  AnalyzeProfileResponse,
  GetBotStatsResponse,
  AnalyzeProfileBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/recent", async (req, res) => {
  const limit = Math.min(parseInt(String(req.query.limit ?? "20")), 100);
  const rows = await db
    .select()
    .from(analysesTable)
    .orderBy(desc(analysesTable.analyzedAt))
    .limit(limit);

  const data = GetRecentAnalysesResponse.parse(
    rows.map((r) => ({
      id: r.id,
      username: r.username,
      fullName: r.fullName ?? undefined,
      followers: r.followers,
      following: r.following,
      postsCount: r.postsCount,
      isVerified: r.isVerified,
      isPrivate: r.isPrivate,
      isBusinessAccount: r.isBusinessAccount,
      engagementRate: r.engagementRate,
      avgLikes: r.avgLikes ?? undefined,
      avgComments: r.avgComments ?? undefined,
      accountCategory: r.accountCategory ?? undefined,
      profilePicUrl: r.profilePicUrl ?? undefined,
      requestedBy: r.requestedBy ?? undefined,
      analyzedAt: r.analyzedAt.toISOString(),
    }))
  );
  res.json(data);
});

router.post("/analyze", async (req, res) => {
  const parsed = AnalyzeProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Bad Request", message: "Username is required" });
    return;
  }

  const { username } = parsed.data;

  try {
    const profile = await fetchInstagramProfile(username);

    await db.insert(analysesTable).values({
      username: profile.username,
      fullName: profile.fullName,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      postsCount: profile.postsCount,
      isVerified: profile.isVerified,
      isPrivate: profile.isPrivate,
      isBusinessAccount: profile.isBusinessAccount,
      profilePicUrl: profile.profilePicUrl,
      engagementRate: profile.engagementRate,
      avgLikes: profile.avgLikes,
      avgComments: profile.avgComments,
      accountCategory: profile.accountCategory,
      externalUrl: profile.externalUrl,
      requestedBy: "dashboard",
    });

    const data = AnalyzeProfileResponse.parse({
      ...profile,
      analyzedAt: new Date().toISOString(),
    });
    res.json(data);
  } catch (err: any) {
    const msg = err?.message ?? "Failed to analyze profile";
    if (msg.includes("not found") || msg.includes("404")) {
      res.status(404).json({ error: "Not Found", message: `Profile @${username} not found` });
    } else {
      res.status(400).json({ error: "Analysis Failed", message: msg });
    }
  }
});

router.get("/stats", async (_req, res) => {
  const [totalRow] = await db.select({ total: count() }).from(analysesTable);

  const uniqueUsersResult = await db.execute(
    sql`SELECT COUNT(DISTINCT requested_by) as unique_users FROM analyses WHERE requested_by IS NOT NULL`
  );
  const uniqueProfilesResult = await db.execute(
    sql`SELECT COUNT(DISTINCT username) as unique_profiles FROM analyses`
  );
  const todayResult = await db.execute(
    sql`SELECT COUNT(*) as today FROM analyses WHERE analyzed_at >= CURRENT_DATE`
  );
  const topProfilesResult = await db.execute(
    sql`SELECT username, COUNT(*) as cnt FROM analyses GROUP BY username ORDER BY cnt DESC LIMIT 5`
  );

  const data = GetBotStatsResponse.parse({
    totalAnalyses: Number(totalRow?.total ?? 0),
    uniqueUsers: Number((uniqueUsersResult.rows[0] as any)?.unique_users ?? 0),
    uniqueProfiles: Number((uniqueProfilesResult.rows[0] as any)?.unique_profiles ?? 0),
    todayAnalyses: Number((todayResult.rows[0] as any)?.today ?? 0),
    topProfiles: (topProfilesResult.rows as any[]).map((r) => ({
      username: r.username,
      count: Number(r.cnt),
    })),
  });
  res.json(data);
});

export default router;
