import { db } from "@/db";
import { eq } from "drizzle-orm";
import { platforms, dataPoints, sources, crawlQueue } from "@/db/schema";
import { analyzeTermsOfService } from "@/lib/ai";
import { findAllPolicyUrls } from "@/lib/crawler";
import * as cheerio from "cheerio";
import crypto from "crypto";

async function scrapeText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  const html = await response.text();
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, nav, footer, header").remove();
  return $("body").text().replace(/\s+/g, ' ').trim();
}

async function scrapeCombinedText(domain: string, primaryUrl: string, onProgress?: (phase: string) => Promise<void>): Promise<{ text: string; hash: string; scraped: { label: string; url: string }[] }> {
  if (onProgress) await onProgress("Recherche des documents légaux...");
  const foundSources = await findAllPolicyUrls(domain);
  let combined = "";
  const scraped: { label: string; url: string }[] = [];

  const allUrls = foundSources.length > 0
    ? foundSources
    : [{ label: "Document principal", url: primaryUrl }];

  for (const source of allUrls) {
    if (onProgress) await onProgress(`Lecture de : ${source.label}...`);
    try {
      const text = await scrapeText(source.url);
      if (text.length >= 200) {
        combined += `\n\n--- Document: ${source.label} (${source.url}) ---\n\n${text}`;
        scraped.push(source);
      }
    } catch { }
  }

  const hash = crypto.createHash("sha256").update(combined).digest("hex");
  return { text: combined, hash, scraped };
}

export async function processQueueJob(job: { id: string; domain: string }, onProgress?: (phase: string) => Promise<void>) {
  if (onProgress) await onProgress("Démarrage du robot...");
  await db.update(crawlQueue)
    .set({ status: "PROCESSING", phase: "Démarrage du robot..." })
    .where(eq(crawlQueue.id, job.id));

  const { text: combinedText, hash, scraped } = await scrapeCombinedText(job.domain, `https://${job.domain}`, onProgress);

  if (combinedText.trim().length < 500) {
    throw new Error("Textes extraits trop courts, les pages ne sont probablement pas les bonnes.");
  }

  if (onProgress) await onProgress("Analyse par l'IA en cours (peut prendre jusqu'à 1 minute)...");
  const firstUrl = scraped[0]?.url ?? `https://${job.domain}`;
  const result = await analyzeTermsOfService(combinedText);
  
  if (onProgress) await onProgress("Sauvegarde des résultats...");

  const newPlatform = await db.insert(platforms).values({
    name: job.domain,
    grade: result.grade,
    summary: result.summary,
    source_url: firstUrl,
    content_hash: hash,
    last_rechecked_at: new Date(),
  }).returning();

  const platformId = newPlatform[0].id;

  if (scraped.length > 0) {
    await db.insert(sources).values(
      scraped.map(s => ({
        platform_id: platformId,
        label: s.label,
        url: s.url,
      }))
    );
  }

  if (result.dataPoints?.length > 0) {
    const MAX_QUOTE_LENGTH = 200;
    await db.insert(dataPoints).values(
      result.dataPoints.map((dp: any) => ({
        platform_id: platformId,
        title: dp.title,
        status: dp.status,
        description: dp.description,
        quote: dp.quote ? dp.quote.substring(0, MAX_QUOTE_LENGTH) : null,
      }))
    );
  }

  await db.update(crawlQueue)
    .set({ status: "COMPLETED", phase: "Terminé !" })
    .where(eq(crawlQueue.id, job.id));

  return {
    platformId,
    grade: result.grade,
    summary: result.summary,
    dataPoints: result.dataPoints,
    sourceUrl: firstUrl,
  };
}
