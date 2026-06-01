import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as cheerio from "cheerio";
import crypto from "crypto";
import { db } from "@/db";
import { platforms, sources, dataPoints } from "@/db/schema";
import { findAllPolicyUrls } from "@/lib/crawler";
import { analyzeTermsOfService } from "@/lib/ai";
import { requireApiKey } from "@/lib/api-auth";
import { logger } from "@/lib/logger";

const analyzeSchema = z.object({
  domain: z.string().min(1).max(255),
  url: z.string().url().optional(),
});

async function scrapeText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { domain, url } = parsed.data;
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const name = cleanDomain.split('.')[0].charAt(0).toUpperCase() + cleanDomain.split('.')[0].slice(1);
    const logoUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;

    let foundSources = url ? [{ label: "Document fourni", url }] : [];
    if (foundSources.length === 0) {
      logger.log(`[API] Auto-discovering URLs for ${cleanDomain}...`);
      foundSources = await findAllPolicyUrls(cleanDomain);
    }

    if (foundSources.length === 0) {
      return NextResponse.json({ error: "Impossible de trouver de page légale automatiquement. Veuillez fournir l'URL exacte." }, { status: 404 });
    }

    let combinedText = "";
    const scraped: { label: string; url: string }[] = [];

    for (const source of foundSources) {
      try {
        logger.log(`[API] Scraping ${source.label}: ${source.url}...`);
        const text = await scrapeText(source.url);
        if (text.length >= 200) {
          combinedText += `\n\n--- Document: ${source.label} (${source.url}) ---\n\n${text}`;
          scraped.push(source);
        }
      } catch (e) {
        logger.warn(`[API] Échec scraping ${source.url}:`, e);
      }
    }

    if (combinedText.trim().length < 500) {
      return NextResponse.json({ error: "Textes extraits trop courts. Vérifiez les URLs fournies." }, { status: 400 });
    }

    logger.log(`[API] Analysing ${combinedText.length} chars with AI...`);
    const analysis = await analyzeTermsOfService(combinedText);

    const firstUrl = scraped[0]?.url ?? url;
    const contentHash = crypto.createHash("sha256").update(combinedText).digest("hex");

    logger.log(`[API] Saving to DB...`);
    const insertedPlatforms = await db.insert(platforms).values({
      name: name,
      logo_url: logoUrl,
      grade: analysis.grade,
      summary: analysis.summary,
      source_url: firstUrl,
      content_hash: contentHash,
      last_rechecked_at: new Date(),
    }).returning();

    const platformId = insertedPlatforms[0].id;

    if (scraped.length > 0) {
      await db.insert(sources).values(
        scraped.map(s => ({
          platform_id: platformId,
          label: s.label,
          url: s.url,
        }))
      );
    }

    const MAX_QUOTE_LENGTH = 200;
    const pointsToInsert = analysis.dataPoints.map((dp: any) => ({
      platform_id: platformId,
      title: dp.title,
      status: dp.status,
      description: dp.description,
      quote: dp.quote ? dp.quote.substring(0, MAX_QUOTE_LENGTH) : null,
    }));

    await db.insert(dataPoints).values(pointsToInsert);

    logger.log(`[API] Success !`);
    return NextResponse.json({ success: true, platformId });
  } catch (error: any) {
    logger.error("API Analyze Error:", error);
    let errorMessage = error.message || "Erreur interne";
    if (errorMessage.includes("429") || errorMessage.includes("Quota") || error.status === 429) {
      errorMessage = "Le quota gratuit de l'Intelligence Artificielle est épuisé pour le moment. Veuillez réessayer dans une minute.";
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
