import * as cheerio from "cheerio";
import { analyzeTermsOfService } from "../lib/ai";
import { db } from "../db";
import { platforms, dataPoints } from "../db/schema";
import "dotenv/config";

async function scrapeText(url: string): Promise<string> {
  console.log(`📡 Fetching ${url}...`);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // Clean up the DOM
  $("script, style, noscript, iframe, nav, footer, header").remove();
  
  // Extract text
  const text = $("body").text().replace(/\s+/g, " ").trim();
  console.log(`✅ Extracted ${text.length} characters of text.`);
  return text;
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: npm run analyze <PlatformName> <URL> [LogoURL]");
    process.exit(1);
  }

  const name = args[0];
  const url = args[1];
  const logoUrl = args[2] || null;

  try {
    const text = await scrapeText(url);
    
    console.log(`🤖 Envoi du texte à l'IA pour analyse (peut prendre quelques secondes)...`);
    const analysis = await analyzeTermsOfService(text);
    console.log(`✅ Analyse terminée. Note globale : ${analysis.grade}`);

    console.log(`💾 Sauvegarde dans la base de données...`);
    
    const insertedPlatforms = await db.insert(platforms).values({
      name: name,
      logo_url: logoUrl,
      grade: analysis.grade,
      summary: analysis.summary,
      source_url: url,
    }).returning();

    const platformId = insertedPlatforms[0].id;

    const pointsToInsert = analysis.dataPoints.map((dp: any) => ({
      platform_id: platformId,
      title: dp.title,
      status: dp.status,
      description: dp.description,
    }));

    await db.insert(dataPoints).values(pointsToInsert);

    console.log(`🎉 Plateforme ${name} analysée et sauvegardée avec succès !`);
  } catch (error) {
    console.error("❌ Erreur pendant l'exécution :", error);
    process.exit(1);
  }
}

run();
