import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { platforms, dataPoints, crawlQueue } from "@/db/schema";
import { ilike, eq } from "drizzle-orm";
import { processQueueJob } from "@/lib/queue";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get("domain");

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (!domain) {
    return NextResponse.json({ error: "Missing domain parameter" }, { status: 400, headers });
  }

  try {
    const foundPlatforms = await db.select().from(platforms).where(ilike(platforms.source_url, `%${domain}%`));

    if (foundPlatforms.length === 0) {
      // Ajouter à la queue
      try {
        await db.insert(crawlQueue).values({ domain, status: "PENDING" }).onConflictDoNothing();
      } catch (e) {
        console.error("Erreur ajout queue", e);
      }

      // Traiter immédiatement
      const queueItem = await db.select().from(crawlQueue).where(eq(crawlQueue.domain, domain)).limit(1);
      if (queueItem.length > 0 && queueItem[0].status === "PENDING") {
        try {
          const result = await processQueueJob(queueItem[0]);
          const platformData = await db.select().from(platforms).where(eq(platforms.id, result.platformId)).limit(1);
          const allPoints = await db.select().from(dataPoints).where(eq(dataPoints.platform_id, result.platformId));
          const criticalPoints = allPoints.filter(p => p.status === "RED" || p.status === "ORANGE");

          return NextResponse.json({
            found: true,
            platform: {
              id: result.platformId,
              name: domain,
              grade: result.grade,
              summary: result.summary,
              logo_url: platformData[0]?.logo_url ?? null,
            },
            criticalPoints,
          }, { headers });
        } catch (error: any) {
          console.error("[Check] Échec du traitement immédiat, laissé dans la queue:", error.message);
          await db.update(crawlQueue)
            .set({ status: "FAILED", error_message: error.message })
            .where(eq(crawlQueue.domain, domain));
        }
      }

      return NextResponse.json({ found: false, in_queue: true, queue_status: "PENDING" }, { headers });
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
    console.error("API Check Error:", error);
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
