/// <reference types="chrome" />
import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield, ExternalLink, Settings, Activity } from 'lucide-react';

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Dans une extension, on récupère l'onglet actif
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
        const url = tabs[0].url;
        
        if (url) {
          try {
            const domain = new URL(url).hostname.replace('www.', '');
            checkDomain(domain);
          } catch(e) {
            setLoading(false);
          }
        }
      });
      
      chrome.storage.local.get(['luetapprouve_stats'], (result) => {
        if (result.luetapprouve_stats) {
          setStats(result.luetapprouve_stats);
        }
      });
    } else {
      // Pour le dev local hors extension
      checkDomain("spotify.com");
    }
  }, []);

  const checkDomain = async (domain: string, force: boolean = false) => {
    try {
      if (!data) setLoading(true);
      const res = await fetch(`https://luetapprouve.vercel.app/api/check?domain=${domain}&force=${force}`);
      const result = await res.json();
      setData({ ...result, domain }); // On garde la trace du domaine
      
      if (result.in_queue && result.queue_status !== "FAILED") {
        setTimeout(() => checkDomain(domain, false), 2500); // Polling toutes les 2.5s
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (!data) setLoading(false);
    }
  };

  if (loading && !data) return <div className="p-6 text-center text-white bg-neutral-900 h-full flex items-center justify-center">Recherche d'analyse...</div>;
  
  if (!data || !data.found) {
    const isProcessing = data && data.in_queue && (data.queue_status === "PROCESSING" || data.queue_status === "PENDING");
    const isFailed = data && data.in_queue && data.queue_status === "FAILED";
    const needsApproval = data && data.in_queue && data.queue_status === "NEEDS_APPROVAL";

    return (
      <div className="p-6 text-center text-white bg-neutral-900 h-full flex flex-col items-center justify-center gap-4">
        {isFailed ? (
          <>
            <ShieldAlert size={48} className="text-red-500" />
            <h2 className="text-xl font-bold text-red-500">Analyse impossible</h2>
            <p className="text-sm text-neutral-400">
              Nous avons essayé d'analyser ce site, mais notre robot n'a pas pu trouver ou lire les Conditions Générales de manière fiable.
            </p>
            <button 
              onClick={() => data.domain && checkDomain(data.domain, true)}
              className="mt-4 w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-4 rounded-xl border border-neutral-700 transition-colors"
            >
              Forcer une nouvelle analyse
            </button>
          </>
        ) : needsApproval ? (
          <>
            <Shield size={48} className="text-neutral-500" />
            <h2 className="text-xl font-bold">Site non analysé</h2>
            <p className="text-sm text-neutral-400">
              Ce site a été détecté mais n'a pas encore été lu par notre IA pour préserver nos ressources.
            </p>
            <button 
              onClick={() => data.domain && checkDomain(data.domain, true)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-colors"
            >
              Lancer l'analyse par l'IA
            </button>
          </>
        ) : (
          <>
            <Shield size={48} className={`text-neutral-500 ${isProcessing ? 'animate-pulse' : ''}`} />
            <h2 className="text-xl font-bold">
              {isProcessing ? "Analyse en cours" : "Site en file d'attente"}
            </h2>
            <p className="text-sm text-neutral-400">
              Ce site n'est pas dans notre base, mais il a été **automatiquement ajouté à notre file d'attente**.
            </p>
            <p className="text-xs text-neutral-500">
              Notre IA l'analysera d'ici quelques minutes.
            </p>
            <div className="mt-4 w-full bg-blue-600/10 text-blue-400 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-3 border border-blue-600/30 relative overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.1)]">
              <div className="flex items-center gap-2 font-bold">
                <span className={isProcessing ? "animate-spin text-xl" : "text-xl"}>⚙️</span>
                <span>{isProcessing ? "L'IA lit les CGU..." : "En attente du robot..."}</span>
              </div>
              
              <div className="w-full bg-blue-900/50 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full w-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
              
              <span className="text-[10px] text-blue-300 uppercase tracking-widest font-black opacity-80">
                {data?.phase ? `Phase : ${data.phase}` : "Démarrage en cours..."}
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

  const { platform, criticalPoints } = data;
  const gradeColors: any = {
    "A": "bg-green-500 text-white", "B": "bg-green-500 text-white",
    "C": "bg-yellow-500 text-black", "D": "bg-yellow-500 text-black",
    "E": "bg-red-500 text-white", "F": "bg-red-500 text-white",
  };
  const colorClass = gradeColors[platform.grade] || "bg-gray-500 text-white";

  return (
    <div className="p-6 bg-neutral-900 text-white h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${colorClass} shadow-lg`}>
          {platform.grade}
        </div>
        <div>
          <h1 className="text-2xl font-black">{platform.name}</h1>
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Note Globale</p>
        </div>
      </div>
      
      <p className="text-sm text-neutral-300 mb-6 bg-neutral-800 p-4 rounded-xl border border-neutral-700">
        {platform.summary}
      </p>

      {criticalPoints && criticalPoints.length > 0 && (
        <>
          <h2 className="text-sm font-bold uppercase text-neutral-500 mb-3 flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" /> 
            Alertes Critiques ({criticalPoints.length})
          </h2>
          <div className="flex flex-col gap-3">
            {criticalPoints.map((point: any) => (
              <div key={point.id} className="bg-neutral-800 border border-neutral-700 rounded-xl p-3 flex gap-3">
                <span className="text-xl shrink-0">{point.status === 'RED' ? '🔴' : '🟠'}</span>
                <div>
                  <h3 className="font-bold text-sm">{point.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">{point.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {(!criticalPoints || criticalPoints.length === 0) && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex flex-col items-center gap-2 text-center mt-4">
          <ShieldCheck size={32} className="text-green-500" />
          <h3 className="font-bold text-green-500 text-sm">Aucune pratique abusive détectée</h3>
        </div>
      )}

      {/* Boutons d'Action */}
      <div className="mt-6 flex flex-col gap-2">
        <a 
          href={`https://luetapprouve.vercel.app/platforms/${platform.id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          Voir l'analyse détaillée complète <ExternalLink size={16} />
        </a>
        <a 
          href={platform.source_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 px-4 rounded-xl border border-neutral-700 transition-colors text-sm"
        >
          Gérer mes données sur ce site <Settings size={16} />
        </a>
      </div>

      {/* Bilan de Santé Personnel */}
      {stats && stats.total > 0 && (
        <div className="mt-8 pt-6 border-t border-neutral-800">
          <h2 className="text-sm font-bold uppercase text-neutral-500 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-blue-500" /> 
            Mon Bilan de Santé Privée
          </h2>
          
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-neutral-400">Sites analysés : {stats.total}</span>
              <span className="text-xs font-bold text-white">
                {Math.round(((stats.A || 0) + (stats.B || 0)) / stats.total * 100)}% fiables
              </span>
            </div>
            
            {/* Barre de progression multi-couleurs */}
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-neutral-900">
              <div style={{ width: `${((stats.A || 0) + (stats.B || 0)) / stats.total * 100}%` }} className="bg-green-500 h-full"></div>
              <div style={{ width: `${((stats.C || 0) + (stats.D || 0)) / stats.total * 100}%` }} className="bg-yellow-500 h-full"></div>
              <div style={{ width: `${((stats.E || 0) + (stats.F || 0)) / stats.total * 100}%` }} className="bg-red-500 h-full"></div>
            </div>
            
            <p className="text-[10px] text-neutral-500 mt-3 text-center">
              Ces statistiques sont calculées localement dans votre navigateur et ne sont envoyées à aucun serveur.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
