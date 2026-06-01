"use client";
import { useState } from "react";
import { ShieldCheck, RefreshCw, LogOut, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const gradeColors: Record<string, string> = {
  A: "bg-green-600", B: "bg-lime-600",
  C: "bg-yellow-500", D: "bg-orange-500",
  E: "bg-red-500", F: "bg-red-700",
};

interface Stats {
  total: number; grades: Record<string, number>; rechecked: number;
}

interface Platform { id: string; name: string; grade: string; source_url: string; last_rechecked_at: Date | null; }

export function AdminDashboard({ stats, platforms }: { stats: Stats; platforms: Platform[] }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/cron/recheck");
      const data = await res.json();
      setResult(data.changed
        ? `${data.platform}: ${data.oldGrade} → ${data.newGrade} (${data.pointsCount} pts)`
        : data.message === "Inchangé"
        ? `${data.platform} : inchangé`
        : data.message || "Erreur"
      );
    } catch {
      setResult("Erreur réseau");
    }
    setSyncing(false);
  }

  async function handleLogout() {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-black">Administration</h1>
          </div>
          <button onClick={handleLogout} className="text-neutral-500 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 rounded-xl p-5">
            <p className="text-neutral-400 text-xs uppercase tracking-widest mb-1">Plateformes</p>
            <p className="text-3xl font-black">{stats.total}</p>
          </div>
          <div className="bg-neutral-900 rounded-xl p-5">
            <p className="text-neutral-400 text-xs uppercase tracking-widest mb-1">Notes</p>
            <div className="flex gap-1.5 mt-2">
              {Object.entries(stats.grades).map(([g, c]) =>
                c > 0 ? <span key={g} className={`${gradeColors[g]} text-white text-xs font-bold px-2 py-0.5 rounded`}>{g}{c}</span> : null
              )}
            </div>
          </div>
          <div className="bg-neutral-900 rounded-xl p-5">
            <p className="text-neutral-400 text-xs uppercase tracking-widest mb-1">Re-vérifiées</p>
            <p className="text-3xl font-black">{stats.rechecked}<span className="text-sm text-neutral-500 font-normal">/{stats.total}</span></p>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-xl p-6 mb-8">
          <h2 className="font-bold text-lg mb-2">Synchronisation manuelle</h2>
          <p className="text-sm text-neutral-400 mb-4">
            Ré-analyse la plateforme dont la dernière vérification est la plus ancienne.
          </p>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Analyse en cours..." : "Synchroniser"}
          </button>
          {result && (
            <p className="mt-4 text-sm text-neutral-300 bg-neutral-800 rounded-lg px-4 py-3">{result}</p>
          )}
        </div>

        <div className="bg-neutral-900 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800">
            <h2 className="font-bold">Plateformes</h2>
          </div>
          <div className="divide-y divide-neutral-800">
            {platforms.map((p) => (
              <div key={p.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-neutral-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`${gradeColors[p.grade] || "bg-neutral-600"} text-white text-xs font-bold w-6 h-6 rounded flex items-center justify-center`}>
                    {p.grade}
                  </span>
                  <span className="font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">
                    {p.last_rechecked_at ? new Date(p.last_rechecked_at).toLocaleDateString("fr") : "jamais"}
                  </span>
                  <a
                    href={`/platforms/${p.id}`}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
