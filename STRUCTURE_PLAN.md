# Plan de restructuration du projet

## 1. Problème critique — Le dépôt Git

**Actuel :** Le `.git/` est dans `cgu-app/`. L'extension `cgu-extension/` n'est pas suivie par Git.

**Action :** Déplacer le dépôt Git à la racine.

```bash
cd cgu-app
# Récupérer la liste des fichiers trackés
git ls-files > ../tracked-files.txt
# Supprimer .git/ de cgu-app
Remove-Item -Recurse -Force .git
cd ..
# Initialiser git à la racine
git init
git add .
git commit -m "Initial commit: LuEtApprouvé (web app + extension)"
```

**Résultat :** Tout le projet (app + extension) est versionné depuis la racine.

---

## 2. Fichier `.env.example`

**Actuel :** Pas de template. Les clés API sont dans `.env` (protégé par `.gitignore`).

**Action :** Créer `cgu-app/.env.example` avec les clés vides :

```env
DATABASE_URL="postgresql://..."
GEMINI_API_KEY=""
GROK_API_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Nettoyage des fichiers inutiles

| Fichier / Dossier | Action | Raison |
|---|---|---|
| `cgu-app/AGENTS.md` | Supprimer | Note interne IDE, pas pour GitHub |
| `cgu-app/CLAUDE.md` | Supprimer | Redondant avec AGENTS.md |
| `cgu-app/.vscode/` | Déjà ignoré | Config IDE personnelle |
| `cgu-app/src/scripts/scraper.ts` | Conserver | Utilitaire CLI utile |
| `.agents/` | Conserver | Contient l'architecture du projet |

---

## 4. Améliorations optionnelles de structure

### Actuel :
```
CGU/
├── cgu-app/          # Next.js web app
├── cgu-extension/    # Chrome extension
├── .gitignore
├── README.md
└── .agents/
```

### Suggestion : (pas bloquant)

```
CGU/
├── apps/
│   ├── web/          # cgu-app → apps/web
│   └── extension/    # cgu-extension → apps/extension
├── packages/         # (futur) code partagé (types, utils)
├── .gitignore
├── README.md
└── .env.example
```

**Pourquoi ?** Structure monorepo standard. Prépare le terrain si un jour tu ajoutes une API, un package de types partagés ou une app mobile.

**Risque :** Nécessite de tout déplacer (configs, imports, déploiement Vercel, CI). À faire uniquement si tu prévois une croissance significative.

---

## 5. Recommandations finales

| Priorité | Action | Impact |
|---|---|---|
| **Haute** | Déplacer `.git/` à la racine | L'extension sera versionnée |
| **Haute** | Root `.gitignore` déjà fait | Protège secrets + artefacts |
| **Moyenne** | Créer `.env.example` | Facilite l'onboarding |
| **Moyenne** | Supprimer `AGENTS.md` et `CLAUDE.md` | Garde le repo propre |
| **Basse** | Refacto monorepo (`apps/*`) | Préparation long terme |
