<div align="center">
  <h3>
    <img src="https://www.google.com/s2/favicons?domain=luetapprouve.vercel.app&sz=64" width="28" style="vertical-align: middle; margin-right: 8px;" />
    LuEtApprouvé
  </h3>
  <p><em>Don't read terms of service. We do it for you.</em></p>

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=nextdotjs&logoColor=white)]()
[![License MIT](https://img.shields.io/badge/license-MIT-blue)]()
[![Neon](https://img.shields.io/badge/Neon-00E599?logo=neon&logoColor=000)]()
[![Gemini](https://img.shields.io/badge/Gemini-8E75B2?logo=googlegemini&logoColor=white)]()

<br/>

<a href="https://luetapprouve.vercel.app">Web App</a> ·
<a href="#setup">Setup</a> ·
<a href="#architecture">Architecture</a> ·
<a href="https://luetapprouve.vercel.app/api-docs">API</a>

</div>

<br/>

---

**LuEtApprouvé** scans any website's Terms of Service / Privacy Policy using AI,
assigns a grade (A–F), and surfaces the critical clauses you need to know about.

A browser extension and a public web app — both fully open source.

<br/>

## Features

**Web App** – Search platforms, browse grades, read detailed AI-generated
summaries with exact quotes from the legal text.

**Browser Extension** – Open any site and instantly see its grade. Never used
before? It queues the domain for background analysis.

**Public API** – `GET /api/check?domain=` for integrations.

**Automated Queue** – New domains are enqueued and processed asynchronously by a
background worker.

<br/>

## Tech Stack

| Layer     | Stack                                                        |
| --------- | ------------------------------------------------------------ |
| Frontend  | Next.js 16, React 19, Tailwind CSS v4, HeroUI, Framer Motion |
| Database  | PostgreSQL (Neon) + Drizzle ORM                              |
| AI        | Gemini 2.5 Flash (primary), Grok (fallback)                  |
| Extension | Vite, Manifest V3, React 19                                  |
| Scraping  | Cheerio – discovers & extracts policy text                   |
| Deploy    | Vercel                                                       |

<br/>

## Setup

### Prerequisites

- Node.js >= 20
- A [Neon](https://neon.tech) PostgreSQL database
- A [Gemini API key](https://aistudio.google.com/apikey)
- (Optional) A [Grok API key](https://x.ai/api) – fallback

### 1. Web app

```shell
cd cgu-app
cp .env.example .env   # add DATABASE_URL, GEMINI_API_KEY, GROK_API_KEY
npm install
npx drizzle-kit push   # create tables
npm run dev            # → http://localhost:3000
```

Seed sample data (optional):

```shell
npx tsx src/db/seed.ts
```

### 2. Browser extension

```shell
cd cgu-extension
npm install
npm run build
```

Load the `dist/` folder in `chrome://extensions` (Developer Mode).

> Update the API URL in `src/App.tsx` and `src/content.tsx` for production.

### 3. Cron (background worker)

To process the queue automatically, set up a scheduled job calling:

```
GET https://your-domain.vercel.app/api/cron/process-queue
```

[cron-job.org](https://cron-job.org) works well — set it every 5 minutes.

<br/>

## Architecture

```
Extension ──GET /api/check──► Next.js ──► Neon DB
                                   │
                          ┌────────┴────────┐
                          │   Background     │
                          │   Worker (cron)  │
                          │  /api/cron/      │
                          │  process-queue   │
                          └────────┬────────┘
                                   │
                     findPrivacyPolicyUrl()
                            +  scrapeText()
                            +  analyzeTermsOfService()
                                   │
                                   ▼
                             platforms + data_points
```

**Flow:** A domain arrives via the extension → enqueued as `PENDING` → the cron
worker picks it up, crawls the policy page, runs AI analysis, saves the grade +
data points → the extension fetches the result next time.

<br/>

## Scripts

| Command                           | Description                                 |
| --------------------------------- | ------------------------------------------- |
| `npm run dev`                     | Start dev server                            |
| `npm run analyze`                 | CLI tool: `npm run analyze -- "Name" "url"` |
| `npx tsx src/scripts/populate.ts` | Batch-analyze 10 popular platforms          |
| `npm run build` (extension)       | Build extension for production              |

<br/>

## License

MIT
