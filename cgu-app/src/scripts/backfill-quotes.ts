import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import "dotenv/config";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function scrapeText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    $("script, style, noscript, iframe, nav, footer, header").remove();
    return $("body").text().replace(/\s+/g, " ").trim();
  } catch {
    return null;
  }
}

async function backfill() {
  console.log("🔍 Recherche des data_points sans quote...");

  const allPlatforms = await db.select().from(schema.platforms);

  for (const platform of allPlatforms) {
    const emptyPoints = await db
      .select()
      .from(schema.dataPoints)
      .where(eq(schema.dataPoints.platform_id, platform.id));

    const needsQuote = emptyPoints.filter(p => !p.quote);
    if (needsQuote.length === 0) {
      console.log(`  ✓ ${platform.name} : toutes les quotes sont présentes`);
      continue;
    }

    console.log(`  → ${platform.name} : ${needsQuote.length} point(s) sans quote`);

    const text = await scrapeText(platform.source_url);
    if (!text || text.length < 500) {
      console.log(`  ✗ Impossible de scraper ${platform.source_url}`);
      continue;
    }

    const titles = needsQuote.map(p => `- "${p.title}" : ${p.description}`).join("\n");

    const prompt = `
Tu disposes du texte brut d'une politique de confidentialité (CGU).
Des points clés ont déjà été extraits, mais leurs citations exactes (quotes) sont manquantes.

Pour CHACUN des points ci-dessous, trouve la phrase EXACTE dans le texte fourni qui justifie ce point.
Réponds UNIQUEMENT avec un tableau JSON contenant title et quote (recopiée au mot près).
N'inclus PAS de traduction française, uniquement la citation originale exacte.

Points sans citation :
${titles}

Texte :
${text.substring(0, 80000)}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.2 },
      });

      const raw = response.text;
      if (!raw) throw new Error("Pas de réponse");

      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Pas de JSON trouvé");

      const quotes: { title: string; quote: string }[] = JSON.parse(jsonMatch[0]);

      for (const q of quotes) {
        const match = needsQuote.find(p => p.title === q.title);
        if (match && q.quote) {
          await db
            .update(schema.dataPoints)
            .set({ quote: q.quote })
            .where(eq(schema.dataPoints.id, match.id));
          console.log(`    ✓ "${q.title}" → quote ajoutée`);
        }
      }
    } catch (e: any) {
      console.error(`    ✗ Erreur AI pour ${platform.name}: ${e.message}`);
    }
  }

  console.log("\n✅ Backfill terminé !");
}

backfill().catch(console.error);
