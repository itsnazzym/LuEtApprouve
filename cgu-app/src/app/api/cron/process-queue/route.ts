import { NextResponse } from "next/server";
import { db } from "@/db";
import { crawlQueue } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { processQueueJob } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  try {
    const pendingJobs = await db.select()
      .from(crawlQueue)
      .where(eq(crawlQueue.status, "PENDING"))
      .orderBy(asc(crawlQueue.created_at))
      .limit(1);

    if (pendingJobs.length === 0) {
      return NextResponse.json({ message: "Queue is empty" });
    }

    const job = pendingJobs[0];
    console.log(`[Cron] Traitement de ${job.domain}...`);

    const result = await processQueueJob(job);

    console.log(`[Cron] Terminé: ${job.domain} (note ${result.grade})`);
    return NextResponse.json({ success: true, domain: job.domain, platformId: result.platformId });

  } catch (error: any) {
    console.error("[Cron] Erreur:", error);
    await db.execute(
      `UPDATE "crawl_queue" SET status = 'FAILED', error_message = '${error.message.replace(/'/g, "''")}' WHERE status = 'PROCESSING' AND created_at = (SELECT created_at FROM "crawl_queue" WHERE status = 'PROCESSING' ORDER BY created_at LIMIT 1)`
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
