import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { platforms, dataPoints, sources } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { findAllPolicyUrls } from "@/lib/crawler";
import { analyzeTermsOfService } from "@/lib/ai";
import { requireApiKey } from "@/lib/api-auth";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import * as cheerio from "cheerio";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function scrapeText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      }
    });
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, nav, footer, header").remove();
    return $("body").text().replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const authError = await requireApiKey(request);
  if (authError) return authError;

  const ip = request.headers.get("x-forwarded-for") || "cron";
  const { allowed } = rateLimit(`recheck:${ip}`, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const platformId = request.nextUrl.searchParams.get("id");
    const forceRaw = request.nextUrl.searchParams.get("force");
    const force = forceRaw === "true";

    const results = platformId
      ? await db.select().from(platforms).where(eq(platforms.id, platformId)).limit(1)
      : await db.select().from(platforms).orderBy(asc(platforms.last_rechecked_at)).limit(1);
    
    const [platform] = results;

    if (!platform) {
      return NextResponse.json({ message: "Aucune plateforme à vérifier" });
    }

    logger.log(`[Recheck] Vérification de ${platform.name}...`);

    const text = await scrapeText(platform.source_url);
    if (!text || text.length < 500) {
      return NextResponse.json({ message: `Impossible de rescraper ${platform.name}`, platform: platform.name });
    }

    const newHash = crypto.createHash("sha256").update(text).digest("hex");
    const changed = platform.content_hash && platform.content_hash !== newHash;

    if (!changed && platform.content_hash && !force) {
      await db.update(platforms)
        .set({ last_rechecked_at: new Date() })
        .where(eq(platforms.id, platform.id));

      logger.log(`[Recheck] ${platform.name} : inchangé`);
      return NextResponse.json({ message: "Inchangé", platform: platform.name });
    }

    logger.log(`[Recheck] ${platform.name} : contenu modifié, ré-analyse...`);

    const foundSources = await findAllPolicyUrls(platform.name.toLowerCase().replace(/\s+/g, ''));
    let combinedText = text;

    for (const source of foundSources) {
      if (source.url !== platform.source_url) {
        try {
          const extraText = await scrapeText(source.url);
          if (extraText && extraText.length >= 200) {
            combinedText += `\n\n--- Document: ${source.label} (${source.url}) ---\n\n${extraText}`;
          }
        } catch { }
      }
    }

    const result = await analyzeTermsOfService(combinedText);

    await db.delete(dataPoints).where(eq(dataPoints.platform_id, platform.id));
    await db.delete(sources).where(eq(sources.platform_id, platform.id));

    await db.update(platforms)
      .set({
        grade: result.grade,
        summary: result.summary,
        content_hash: newHash,
        last_rechecked_at: new Date(),
      })
      .where(eq(platforms.id, platform.id));

    if (result.dataPoints?.length > 0) {
      await db.insert(dataPoints).values(
        result.dataPoints.map((dp: any) => ({
          platform_id: platform.id,
          title: dp.title,
          status: dp.status,
          description: dp.description,
          quote: dp.quote ?? null,
        }))
      );
    }

    if (foundSources.length > 0) {
      await db.insert(sources).values(
        foundSources.map(s => ({
          platform_id: platform.id,
          label: s.label,
          url: s.url,
        }))
      );
    }

    logger.log(`[Recheck] ${platform.name} : mis à jour (note ${result.grade})`);
    return NextResponse.json({
      success: true,
      platform: platform.name,
      changed: true,
      oldGrade: platform.grade,
      newGrade: result.grade,
      pointsCount: result.dataPoints?.length ?? 0,
    });

  } catch (error: any) {
    logger.error("[Recheck] Erreur:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
