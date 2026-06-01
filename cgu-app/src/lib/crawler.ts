import * as cheerio from "cheerio";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const keywordGroups = [
  { label: "Politique de confidentialité", keywords: ["privacy", "confidentialité", "datenschutz"] },
  { label: "Conditions d'utilisation", keywords: ["terms of service", "terms of use", "conditions d'utilisation", "terms", "cgu"] },
  { label: "Mentions légales", keywords: ["legal notice", "mentions légales", "legal", "imprint", "impressum"] },
  { label: "Politique des cookies", keywords: ["cookies", "cookie policy"] },
  { label: "Autre document juridique", keywords: ["eula", "license", "license agreement", "community guidelines"] },
];

function resolveUrl(baseUrl: string, href: string): string {
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${baseUrl}${href}`;
  return `${baseUrl}/${href}`;
}

export async function findAllPolicyUrls(domain: string): Promise<{ label: string; url: string }[]> {
  try {
    const baseUrl = domain.startsWith("http") ? domain : `https://${domain}`;

    console.log(`[Crawler] Fetching homepage ${baseUrl}`);
    const res = await fetch(baseUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);

    const seen = new Set<string>();
    const results: { label: string; url: string }[] = [];

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href")!;
      const text = $(element).text().toLowerCase();

      for (const group of keywordGroups) {
        if (group.keywords.some(k => text.includes(k) || href.toLowerCase().includes(k))) {
          const url = resolveUrl(baseUrl, href);
          const key = url.toLowerCase().replace(/\/$/, "");
          if (!seen.has(key)) {
            seen.add(key);
            results.push({ label: group.label, url });
          }
          break;
        }
      }
    });

    console.log(`[Crawler] Found ${results.length} policy URL(s):`, results.map(r => r.label));
    return results;
  } catch (error) {
    console.error(`[Crawler] Error finding policies for ${domain}:`, error);
    return [];
  }
}

export async function findPrivacyPolicyUrl(domain: string): Promise<string | null> {
  const urls = await findAllPolicyUrls(domain);
  return urls.length > 0 ? urls[0].url : null;
}
