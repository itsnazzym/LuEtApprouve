import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { platforms, dataPoints, crawlQueue } from "@/db/schema";
import { ilike, eq, or } from "drizzle-orm";
import { processQueueJob } from "@/lib/queue";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const checkSchema = z.object({
  domain: z.string().min(1).max(255),
});

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const { allowed } = rateLimit(`check:${ip}`, 30, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429, headers });
  }

  const domainRaw = request.nextUrl.searchParams.get("domain");
  const parsed = checkSchema.safeParse({ domain: domainRaw });
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètre domain manquant" }, { status: 400, headers });
  }

  const domain = parsed.data.domain;
  const domainName = domain.split('.')[0]; // ex: "chatgpt" depuis "chatgpt.com"

  try {
    const foundPlatforms = await db.select().from(platforms).where(
      or(
        ilike(platforms.source_url, `%${domain}%`),
        ilike(platforms.name, `%${domainName}%`)
      )
    );

    if (foundPlatforms.length === 0) {
      const forceRaw = request.nextUrl.searchParams.get("force");
      const force = forceRaw === "true";
      
      const autoRaw = request.nextUrl.searchParams.get("auto");
      const isAuto = autoRaw === "true";

      const initialStatus = isAuto ? "NEEDS_APPROVAL" : "PENDING";

      try {
        await db.insert(crawlQueue).values({ domain, status: initialStatus }).onConflictDoNothing();
      } catch (e) {
        logger.error("Erreur ajout queue", e);
      }

      let queueItem = await db.select().from(crawlQueue).where(eq(crawlQueue.domain, domain)).limit(1);
      
      // Si on force l'analyse manuellement (depuis l'interface), on passe de NEEDS_APPROVAL ou FAILED à PENDING
      if (queueItem.length > 0 && force && (queueItem[0].status === "FAILED" || queueItem[0].status === "NEEDS_APPROVAL")) {
        await db.update(crawlQueue).set({ status: "PENDING", error_message: null, phase: null }).where(eq(crawlQueue.domain, domain));
        queueItem[0].status = "PENDING";
      }

      if (queueItem.length > 0 && queueItem[0].status === "PENDING") {
        // Trigger background task (fire and forget)
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
        fetch(`${baseUrl}/api/cron/process-queue?domain=${domain}`, {
          headers: { "Authorization": `Bearer ${process.env.CRON_SECRET || ""}` }
        }).catch(e => logger.error("Background task failed to start", e));
      }

      const finalStatus = queueItem.length > 0 ? queueItem[0].status : "PENDING";
      const finalPhase = queueItem.length > 0 ? queueItem[0].phase : "Démarrage en cours...";
      const finalError = queueItem.length > 0 ? queueItem[0].error_message : null;
      
      return NextResponse.json({ 
        found: false, 
        in_queue: true, 
        queue_status: finalStatus, 
        phase: finalPhase,
        error: finalError 
      }, { headers });
    }

    const platform = foundPlatforms[0];
    const points = await db.select().from(dataPoints).where(
      eq(dataPoints.platform_id, platform.id)
    );

    const criticalPoints = points.filter(p => p.status === "RED" || p.status === "ORANGE");

    return NextResponse.json({
      found: true,
      platform: {
        id: platform.id,
        name: platform.name,
        grade: platform.grade,
        summary: platform.summary,
        logo_url: platform.logo_url,
      },
      criticalPoints: criticalPoints,
    }, { headers });
  } catch (error) {
    logger.error("API Check Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
