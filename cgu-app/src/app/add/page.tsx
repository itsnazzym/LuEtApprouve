"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AddPlatformForm() {
  const searchParams = useSearchParams();
  const [domain, setDomain] = useState(searchParams?.get("domain") || "");
  const [url, setUrl] = useState(searchParams?.get("url") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Une erreur est survenue");

      router.push(`/platforms/${data.platformId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="bg-danger/20 border border-danger/30 text-danger p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Nom de domaine (obligatoire)
          </label>
          <input
            type="text"
            required
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="ex: tiktok.com"
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
            URL exacte des CGU (optionnel)
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Facultatif. Si vide, le robot cherchera tout seul."
            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-primary hover:bg-primary/90 disabled:bg-neutral-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyse de l'IA en cours...
            </>
          ) : (
            "🤖 Chercher et Analyser"
          )}
        </button>
      </form>
    </>
  );
}

export default function AddPlatformPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-2xl">
      <Link href="/" className="text-neutral-400 hover:text-white mb-8 inline-flex items-center gap-2 transition-colors">
        ← Retour à l'accueil
      </Link>

      <div className="bg-content2/50 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-neutral-800 shadow-2xl">
        <h1 className="text-3xl font-black mb-2">Ajout Automatique</h1>
        <p className="text-neutral-400 mb-8">
          Entrez un nom de domaine. Notre robot va trouver la page de confidentialité tout seul. Si cela échoue, vous pourrez fournir l'URL exacte.
        </p>

        <Suspense fallback={<div className="text-neutral-400 text-center py-8">Chargement du formulaire...</div>}>
          <AddPlatformForm />
        </Suspense>
      </div>
    </div>
  );
}
