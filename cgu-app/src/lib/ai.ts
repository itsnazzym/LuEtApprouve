import { GoogleGenAI, Type, Schema } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    brandName: {
      type: Type.STRING,
      description: "Le nom officiel de l'entreprise ou du service (ex: 'Spotify', 'Google', 'X (Twitter)'). Ne mets pas le nom de domaine, juste le nom de la marque avec la bonne majuscule.",
    },
    grade: {
      type: Type.STRING,
      description: "Note globale de A (exceptionnel) à F (très abusif). Sois STRICT. La plupart des grandes plateformes méritent C ou D.",
      enum: ["A", "B", "C", "D", "E", "F"],
    },
    summary: {
      type: Type.STRING,
      description: "Résumé concis de l'analyse en 1 ou 2 phrases maximum.",
    },
    dataPoints: {
      type: Type.ARRAY,
      description: "Liste EXHAUSTIVE de points clés. Ne te limite pas, plus il y en a mieux c'est.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Titre court du point clé (ex: 'Vente des données personnelles').",
          },
          status: {
            type: Type.STRING,
            description: "Statut du point clé: GREEN (respectueux), ORANGE (limite/moyen), RED (abusif/critique), GRAY (neutre/informatif).",
            enum: ["GREEN", "ORANGE", "RED", "GRAY"],
          },
          description: {
            type: Type.STRING,
            description: "Explication vulgarisée et concise du point clé.",
          },
          quote: {
            type: Type.STRING,
            description: "CITATION EXACTE DANS SA LANGUE ORIGINALE (ne la traduis PAS). Elle doit être une COPIE CONFORME (au caractère et à la ponctuation près) du texte source. Ne rajoute SURTOUT PAS de point '.' à la fin s'il n'y en a pas dans le texte original. C'est crucial pour la recherche textuelle du navigateur.",
          },
        },
        required: ["title", "status", "description", "quote"],
      },
    },
  },
  required: ["brandName", "grade", "summary", "dataPoints"],
};

async function analyzeWithGrok(prompt: string): Promise<any> {
  console.log("[AI] Tentative de Fallback avec Grok (xAI)...");
  if (!process.env.GROK_API_KEY) {
    throw new Error("Clé GROK_API_KEY manquante pour le fallback.");
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "Tu es un avocat expert. Tu dois renvoyer UNIQUEMENT un objet JSON valide, sans aucun texte avant ou après, sans balises markdown. Le JSON doit correspondre exactement au schéma demandé."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "grok-beta",
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur Grok API: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

export async function analyzeTermsOfService(text: string, retries = 3): Promise<any> {
  const prompt = `
Tu es un avocat expert en protection des données, spécialisé dans la vulgarisation des Conditions Générales d'Utilisation (CGU) et politiques de confidentialité.
Ta mission est d'analyser le texte brut suivant, issu d'une politique de confidentialité.

INSTRUCTION IMPORTANTE : Sois EXHAUSTIF et STRICT. N'hésite PAS à trouver des points négatifs.
Les grandes plateformes (Apple, Google, Meta, Microsoft, Amazon) ont presque TOUJOURS des clauses problématiques. Ne leur donne PAS une bonne note sans raison valable.

Extrais ENTRE 15 ET 25 POINTS CLÉS (pas moins, surtout si le texte est long). Pour chaque point, attribue un statut (GREEN, ORANGE, RED ou GRAY), une description très vulgarisée, ET UNE CITATION EXACTE ('quote') EN FRANÇAIS, extraite ou traduite du texte original.

Signification des statuts :
- RED (critique) : clause abusive, dangereuse pour la vie privée, ou qui désavantage fortement l'utilisateur. EXEMPLES : revente de données à des tiers sans consentement, tracking cross-site, perte de droits IP, arbitrage forcé, absence de droit de suppression.
- ORANGE (attention) : pratique limite ou potentiellement intrusive. EXEMPLES : utilisation des données pour l'entraînement AI par défaut, cookies tiers, juridiction étrangère, modification unilatérale des conditions.
- GREEN (bon) : clause respectueuse des droits de l'utilisateur. EXEMPLES : possibilité de supprimer ses données facilement, pas de publicité ciblée, open source, chiffrement de bout en bout.
- GRAY (neutre/info) : information neutre ou mention légale standard sans impact particulier. EXEMPLES : coordonnées du DPO, loi applicable précisée, durée de conservation standard.

GUIDE DE NOTATION GLOBALE (sois STRICT) :
- A (EXCEPTIONNEL) : Quasi aucune collecte de données, pas de pub, pas de revente, suppression totale possible, open source de préférence. QUASIMENT AUCUNE PLATEFORME COMMERCIALE NE MÉRITE UN A.
- B (BON) : Globalement respectueux, quelques points d'attention mineurs mais l'utilisateur garde le contrôle.
- C (MOYEN) : Pratiques standard de l'industrie. Mélange de bonnes et mauvaises clauses. C'est la note la PLUS COURANTE pour les grandes plateformes.
- D (INSUFFISANT) : Plusieurs clauses problématiques. Collecte excessive, manque de transparence, options de contrôle limitées.
- E (MAUVAIS) : Pratiques agressives de collecte et monétisation des données utilisateur.
- F (TRÈS MAUVAIS) : Abus de confiance, revente extensive de données, aucun contrôle utilisateur, conditions abusives.

La 'quote' DOIT être dans sa LANGUE ORIGINALE. Ne la traduis SURTOUT PAS (même si elle est en anglais). C'est un copier-coller EXACT (au caractère et à la ponctuation près). Ne rajoute aucun point à la fin de la citation s'il n'y en a pas dans le texte. Le but est que le navigateur puisse la retrouver avec sa fonction de recherche exacte. MAXIMUM 200 CARACTÈRES. Pas de paragraphes entiers — uniquement l'extrait clé. Elle servira de preuve juridique.

Texte à analyser :
${text.substring(0, 100000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    if (!response.text) throw new Error("No response text");
    return JSON.parse(response.text);
  } catch (error: any) {
    if (error.status === 429 && retries > 0) {
      console.warn(`[AI] Rate limit atteint (429). Nouvelle tentative dans 8 secondes... (${retries} essais restants)`);
      await new Promise(resolve => setTimeout(resolve, 8000));
      return analyzeTermsOfService(text, retries - 1);
    }
    
    console.error(`[AI] Erreur avec Gemini: ${error.message || error}. Déclenchement du fallback Grok...`);
    try {
      return await analyzeWithGrok(prompt);
    } catch (grokError) {
      console.error("[AI] Le fallback Grok a également échoué:", grokError);
      throw error; // Renvoie l'erreur originale si le fallback échoue
    }
  }
}
