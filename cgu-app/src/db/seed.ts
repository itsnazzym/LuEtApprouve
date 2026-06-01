import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding database...");
  
  // Clear existing data
  await db.delete(schema.dataPoints);
  await db.delete(schema.platforms);

  const insertedPlatforms = await db.insert(schema.platforms).values([
    {
      name: "TikTok",
      logo_url: "https://logo.clearbit.com/tiktok.com",
      grade: "F",
      summary: "Pratiques agressives de collecte de données et profilage étendu.",
      source_url: "https://www.tiktok.com/legal/page/eea/privacy-policy/fr",
    },
    {
      name: "ChatGPT (OpenAI)",
      logo_url: "https://logo.clearbit.com/openai.com",
      grade: "C",
      summary: "Collecte les conversations pour l'entraînement par défaut, mais offre une option de désactivation.",
      source_url: "https://openai.com/policies/privacy-policy",
    }
  ]).returning();

  const tiktokId = insertedPlatforms.find(p => p.name === "TikTok")!.id;
  const chatgptId = insertedPlatforms.find(p => p.name === "ChatGPT (OpenAI)")!.id;

  await db.insert(schema.dataPoints).values([
    {
      platform_id: tiktokId,
      title: "Collecte de l'historique de navigation",
      status: "RED",
      description: "L'application collecte des informations sur vos activités sur d'autres sites web et applications via des trackers tiers.",
      quote: "Nous pouvons collecter des informations sur votre activité sur d'autres sites et applications."
    },
    {
      platform_id: tiktokId,
      title: "Partage des données avec des tiers",
      status: "RED",
      description: "TikTok partage vos données personnelles avec des partenaires publicitaires et des sociétés tierces sans consentement explicite.",
      quote: "Nous pouvons partager vos informations personnelles avec nos sociétés affiliées et des tiers."
    },
    {
      platform_id: tiktokId,
      title: "Droit de suppression des données",
      status: "GRAY",
      description: "La plateforme offre la possibilité de supprimer son compte et ses données conformément au RGPD.",
      quote: "Vous pouvez demander la suppression de votre compte et de vos données personnelles."
    },
    {
      platform_id: chatgptId,
      title: "Utilisation des données pour l'entraînement",
      status: "ORANGE",
      description: "Les conversations sont utilisées pour entraîner les modèles par défaut, mais vous pouvez le désactiver dans les paramètres.",
      quote: "Nous pouvons utiliser vos conversations pour améliorer nos modèles."
    },
    {
      platform_id: chatgptId,
      title: "Transmission aux États-Unis",
      status: "RED",
      description: "Les données des utilisateurs européens sont transférées vers des serveurs situés aux États-Unis.",
      quote: "Vos données peuvent être transférées et traitées aux États-Unis."
    },
    {
      platform_id: chatgptId,
      title: "Option de désactivation de l'entraînement",
      status: "GREEN",
      description: "OpenAI permet de désactiver l'utilisation des conversations pour l'entraînement via les paramètres du compte.",
      quote: "Vous pouvez désactiver l'entraînement en modifiant vos paramètres."
    }
  ]);

  console.log("Seeding finished!");
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
