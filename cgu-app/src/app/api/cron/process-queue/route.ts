import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { crawlQueue } from "@/db/schema";
import { eq, asc, and, gte } from "drizzle-orm";
import { processQueueJob } from "@/lib/queue";
import { requireApiKey } from "@/lib/api-auth";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const authError = await requireApiKey(request);
  if (authError) return authError;

  const ip = request.headers.get("x-forwarded-for") || "cron";
  const { allowed } = rateLimit(`cron:${ip}`, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    // Vérification du quota quotidien (max 20 analyses par jour)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await db.select().from(crawlQueue).where(
      and(
        eq(crawlQueue.status, "COMPLETED"),
        gte(crawlQueue.updated_at, today)
      )
    );

    if (completedToday.length >= 20) {
      logger.warn("[Cron] Quota quotidien atteint (20 analyses/jour). Tâche reportée.");
      return NextResponse.json({ message: "Quota quotidien atteint. En pause jusqu'à demain." });
    }

    const domainRaw = request.nextUrl.searchParams.get("domain");

    const pendingJobs = domainRaw
      ? await db.select().from(crawlQueue).where(and(eq(crawlQueue.status, "PENDING"), eq(crawlQueue.domain, domainRaw)))
      : await db.select().from(crawlQueue).where(eq(crawlQueue.status, "PENDING")).orderBy(asc(crawlQueue.created_at)).limit(1);

    if (pendingJobs.length === 0) {
      return NextResponse.json({ message: "Queue is empty" });
    }

    const job = pendingJobs[0];
    logger.log(`[Cron] Traitement de ${job.domain}...`);

    const onProgress = async (phase: string) => {
      try {
        await db.update(crawlQueue).set({ phase }).where(eq(crawlQueue.id, job.id));
      } catch (e) {
        logger.error("[Cron] Erreur mise à jour phase:", e);
      }
    };

    const result = await processQueueJob(job, onProgress);

    logger.log(`[Cron] Terminé: ${job.domain} (note ${result.grade})`);
    return NextResponse.json({ success: true, domain: job.domain, platformId: result.platformId });

  } catch (error: any) {
    logger.error("[Cron] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
