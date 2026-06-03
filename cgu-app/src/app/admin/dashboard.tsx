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

interface QueueItem { id: string; domain: string; created_at: Date; status: string; }

export function AdminDashboard({ stats, platforms, pendingApprovals = [] }: { stats: Stats; platforms: Platform[]; pendingApprovals?: QueueItem[] }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [syncAllProgress, setSyncAllProgress] = useState<{current: number, total: number} | null>(null);
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

  async function handleSyncAll() {
    if (!confirm("⚠️ Attention : Cette opération va forcer l'IA à relire les CGU de TOUTES les plateformes, même si elles n'ont pas changé.\n\nCela peut prendre plusieurs minutes et consommer beaucoup de requêtes API.\n\nVoulez-vous vraiment continuer ?")) return;
    
    setSyncing(true);
    setSyncAllProgress({ current: 0, total: platforms.length });
    setResult("Synchronisation complète en cours...");

    let successCount = 0;
    for (let i = 0; i < platforms.length; i++) {
      setSyncAllProgress({ current: i + 1, total: platforms.length });
      try {
        const res = await fetch(`/api/cron/recheck?force=true&id=${platforms[i].id}`);
        const data = await res.json();
        if (data.changed) successCount++;
      } catch (e) {
        console.error("Erreur sur " + platforms[i].name, e);
      }
    }
    
    setSyncAllProgress(null);
    setResult(`Synchronisation terminée : ${successCount} plateforme(s) mise(s) à jour.`);
    setSyncing(false);
  }

  async function handleApprove(domain: string) {
    if (!confirm(`Voulez-vous autoriser l'IA à analyser ${domain} ?`)) return;
    try {
      await fetch(`/api/check?domain=${domain}&force=true`, { method: "GET" });
      alert(`L'analyse de ${domain} a été lancée en arrière-plan !`);
      window.location.reload();
    } catch (e) {
      alert("Erreur lors du lancement");
    }
  }

  async function handleLogout() {
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-8">
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
            Ré-analyse la plateforme dont la dernière vérification est la plus ancienne, ou forcez l'analyse de toutes les plateformes.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              <RefreshCw size={18} className={syncAllProgress ? "animate-spin" : ""} />
              {syncAllProgress ? `Analyse totale (${syncAllProgress.current}/${syncAllProgress.total})...` : "Tout re-synchroniser (Forcer l'IA)"}
            </button>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-all"
            >
              <RefreshCw size={18} className={syncing && !syncAllProgress ? "animate-spin" : ""} />
              {syncing && !syncAllProgress ? "Mise à jour..." : "Mettre à jour la plus ancienne"}
            </button>
          </div>
          {result && (
            <p className="mt-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              Dernière action : {result}
            </p>
          )}
        </div>

        {/* Section Approbations (Background Extension) */}
        {pendingApprovals.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-yellow-500/30">
            <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span>
              Sites en attente de validation ({pendingApprovals.length})
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Ces sites ont été détectés par l'extension en arrière-plan. Validez-les pour que l'IA les analyse.
            </p>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl">
                  <div>
                    <h3 className="font-bold text-neutral-800 dark:text-white">{item.domain}</h3>
                    <p className="text-xs text-neutral-500">Détecté le {new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(item.domain)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm">
                      Lancer l'IA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
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
