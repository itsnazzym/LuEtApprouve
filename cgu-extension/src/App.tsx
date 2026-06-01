/// <reference types="chrome" />
import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

function App() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    } else {
      // Pour le dev local hors extension
      checkDomain("spotify.com");
    }
  }, []);

  const checkDomain = async (domain: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/check?domain=${domain}`);
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-white bg-neutral-900 h-full flex items-center justify-center">Recherche d'analyse...</div>;
  
  if (!data || !data.found) {
    const isProcessing = data && data.in_queue && data.queue_status === "PROCESSING";

    return (
      <div className="p-6 text-center text-white bg-neutral-900 h-full flex flex-col items-center justify-center gap-4">
        <Shield size={48} className={`text-neutral-500 ${isProcessing ? 'animate-pulse' : ''}`} />
        <h2 className="text-xl font-bold">
          {isProcessing ? "Analyse en cours" : "Site en file d'attente"}
        </h2>
        <p className="text-sm text-neutral-400">
          Ce site n'est pas dans notre base, mais il a été **automatiquement ajouté à notre file d'attente**.
        </p>
        <p className="text-xs text-neutral-500">
          Notre IA en arrière-plan l'analysera d'ici quelques minutes pour protéger les limites de notre serveur.
        </p>
        
        <div className="mt-4 w-full bg-blue-600/20 text-blue-400 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-blue-600/30">
          <span className={isProcessing ? "animate-spin text-xl" : "text-xl"}>⚙️</span>
          {isProcessing ? "L'IA est en train de lire les CGU..." : "En attente du robot..."}
        </div>
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
    </div>
  );
}

export default App;
