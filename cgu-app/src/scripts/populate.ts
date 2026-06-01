import "dotenv/config";
import { db } from "../db";
import { platforms, dataPoints } from "../db/schema";
import { execSync } from "child_process";

const apps = [
  { name: "TikTok", url: "https://www.tiktok.com/legal/page/eea/privacy-policy/fr", domain: "tiktok.com" },
  { name: "ChatGPT", url: "https://openai.com/policies/privacy-policy", domain: "openai.com" },
  { name: "Spotify", url: "https://www.spotify.com/fr/legal/privacy-policy/plain/", domain: "spotify.com" },
  { name: "Netflix", url: "https://help.netflix.com/legal/privacy", domain: "netflix.com" },
  { name: "Facebook", url: "https://www.facebook.com/privacy/policy/", domain: "facebook.com" },
  { name: "Instagram", url: "https://privacycenter.instagram.com/policy", domain: "instagram.com" },
  { name: "LinkedIn", url: "https://fr.linkedin.com/legal/privacy-policy", domain: "linkedin.com" },
  { name: "Snapchat", url: "https://values.snap.com/privacy/privacy-policy", domain: "snapchat.com" },
  { name: "Pinterest", url: "https://policy.pinterest.com/fr/privacy-policy", domain: "pinterest.com" },
  { name: "Discord", url: "https://discord.com/privacy", domain: "discord.com" }
];

async function run() {
  console.log("Nettoyage de la base de données...");
  await db.delete(dataPoints);
  await db.delete(platforms);
  console.log("Base nettoyée ! Lancement du Scraper IA pour 10 applications...");

  for (const app of apps) {
    const logo = `https://www.google.com/s2/favicons?domain=${app.domain}&sz=128`;
    console.log(`\n===========================================`);
    console.log(`🤖 Scrapping & IA Analysis: ${app.name}`);
    console.log(`===========================================`);
    try {
      execSync(`npx tsx src/scripts/scraper.ts "${app.name}" "${app.url}" "${logo}"`, { stdio: 'inherit' });
    } catch(e) {
      console.error(`❌ Echec pour ${app.name}`);
    }
  }
  
  console.log("\n✅ Base de données remplie avec 10 applications !");
}

run();
