import Link from "next/link";
import { ArrowLeft, Terminal, Copy } from "lucide-react";

export const metadata = {
  title: "API Publique - LuEtApprouvé",
  description: "Documentation de l'API publique de LuEtApprouvé pour intégrer nos données.",
};

export default function ApiDocsPage() {
  const jsonResponseFound = `{
  "found": true,
  "platform": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "youtube.com",
    "grade": "D",
    "summary": "YouTube collecte massivement vos données et les partage avec des annonceurs tiers...",
    "logo_url": "https://logo.clearbit.com/youtube.com"
  },
  "criticalPoints": [
    {
      "id": "abc-def",
      "title": "Collecte de données étendue",
      "status": "RED",
      "description": "Vos données sont partagées avec des partenaires tiers à des fins publicitaires.",
      "quote": "Nous partageons vos données personnelles avec nos partenaires publicitaires."
    }
  ]
}`;

  const jsonResponseQueue = `{
  "found": false,
  "in_queue": true,
  "queue_status": "PENDING" // ou "PROCESSING", "FAILED"
}`;

  return (
    <div className="container mx-auto px-6 py-20 max-w-5xl">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 mb-16 text-neutral-400 font-bold hover:text-white transition-colors uppercase tracking-widest text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-start">
        <main>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-primary/20 rounded-2xl text-primary">
              <Terminal className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight">API Publique</h1>
          </div>
          
          <p className="text-xl text-neutral-300 leading-relaxed font-medium mb-12">
            Intégrez les données de LuEtApprouvé dans vos propres outils, extensions de navigateur, ou tableaux de bord grâce à notre point d'accès REST simple et ouvert.
          </p>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4">
              <span className="bg-primary text-black px-3 py-1 rounded-md text-sm font-black uppercase tracking-widest">GET</span>
              Vérifier un domaine
            </h2>
            <p className="text-neutral-400 mb-6">
              Vérifie si une plateforme est répertoriée dans notre base de données et renvoie son classement ainsi que ses points critiques.
            </p>
            
            <div className="bg-[#0D0D0D] border border-neutral-800 rounded-2xl p-6 font-mono text-sm relative group mb-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50" />
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">GET</span>
                <span className="text-neutral-500">application/json</span>
              </div>
              <div className="mt-4 text-white overflow-x-auto">
                <span className="text-neutral-400">https://luetapprouve.vercel.app</span>/api/check?domain=<span className="text-primary">youtube.com</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Paramètres</h2>
            <div className="border border-neutral-800 rounded-2xl overflow-hidden bg-black/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/50">
                    <th className="p-4 text-sm font-bold text-neutral-300 uppercase">Paramètre</th>
                    <th className="p-4 text-sm font-bold text-neutral-300 uppercase">Type</th>
                    <th className="p-4 text-sm font-bold text-neutral-300 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-400 font-mono text-sm">
                  <tr>
                    <td className="p-4 border-b border-neutral-800 text-primary">domain</td>
                    <td className="p-4 border-b border-neutral-800">string</td>
                    <td className="p-4 border-b border-neutral-800"><span className="text-red-400 text-xs font-bold mr-2 uppercase">Requis</span>Le nom de domaine à rechercher (ex: youtube.com)</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-primary">force</td>
                    <td className="p-4">boolean</td>
                    <td className="p-4">Force une nouvelle tentative d'analyse de l'IA (si le statut était FAILED). Défaut: false</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6">Comprendre les Réponses</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">1. Plateforme trouvée</h3>
                <p className="text-neutral-400 mb-4 text-sm leading-relaxed">
                  Si le domaine a déjà été analysé, l'API renvoie <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">found: true</code> avec les détails de la plateforme et la liste des points critiques (rouge ou orange). Le champ <code className="text-neutral-300 bg-neutral-800 px-1 py-0.5 rounded">quote</code> contient la citation exacte extraite des CGU.
                </p>
              </div>
              
              <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-3">2. Ajout à la file d'attente (Non trouvé)</h3>
                <p className="text-neutral-400 mb-4 text-sm leading-relaxed">
                  Si le domaine n'existe pas dans notre base, il est <strong>automatiquement ajouté</strong> à notre file d'attente. L'API déclenche une tentative d'analyse via notre IA en arrière-plan et renvoie <code className="text-warning bg-warning/10 px-1 py-0.5 rounded">found: false</code>.
                </p>
                <ul className="list-disc list-inside text-sm text-neutral-300 space-y-2 mt-4 ml-2">
                  <li><code className="text-neutral-100 font-bold">queue_status: "PENDING"</code> : En attente du robot ou robot lancé.</li>
                  <li><code className="text-blue-400 font-bold">queue_status: "PROCESSING"</code> : Le robot lit actuellement les conditions (peut prendre jusqu'à 2 minutes).</li>
                  <li><code className="text-red-400 font-bold">queue_status: "FAILED"</code> : L'IA n'a pas pu trouver la page de confidentialité ou la lire correctement.</li>
                </ul>
              </div>
            </div>
          </section>
        </main>

        <aside className="sticky top-32 space-y-8">
          {/* Response Found */}
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Succès (found: true)</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-success/50" />
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-xs font-mono text-neutral-300 leading-loose">
                <code dangerouslySetInnerHTML={{ __html: jsonResponseFound.replace(/"(.*?)":/g, '<span class="text-primary">"$1"</span>:').replace(/true/g, '<span class="text-success">true</span>') }} />
              </pre>
            </div>
          </div>

          {/* Response Queue */}
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Mise en file d'attente</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-warning/50" />
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-xs font-mono text-neutral-300 leading-loose">
                <code dangerouslySetInnerHTML={{ __html: jsonResponseQueue.replace(/"(.*?)":/g, '<span class="text-primary">"$1"</span>:').replace(/false/g, '<span class="text-danger">false</span>').replace(/true/g, '<span class="text-success">true</span>') }} />
              </pre>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
