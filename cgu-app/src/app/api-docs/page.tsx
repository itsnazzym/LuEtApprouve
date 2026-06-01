import Link from "next/link";
import { ArrowLeft, Terminal, Copy } from "lucide-react";

export const metadata = {
  title: "API Publique - LuEtApprouvé",
  description: "Documentation de l'API publique de LuEtApprouvé pour intégrer nos données.",
};

export default function ApiDocsPage() {
  const jsonResponse = `{
  "found": true,
  "platform": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Youtube",
    "grade": "D",
    "summary": "YouTube collecte massivement vos données...",
    "logo_url": "https://logo.clearbit.com/youtube.com"
  },
  "criticalPoints": [
    {
      "id": "...",
      "title": "Collecte de données étendue",
      "status": "RED",
      "description": "Vos données sont partagées avec des partenaires tiers."
    }
  ]
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
                    <td className="p-4 border-b border-neutral-800 font-sans">Le nom de domaine à rechercher (ex: youtube.com)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <aside className="sticky top-32">
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-neutral-900 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Exemple de Réponse</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-danger/50" />
                <div className="w-3 h-3 rounded-full bg-warning/50" />
                <div className="w-3 h-3 rounded-full bg-success/50" />
              </div>
            </div>
            <div className="p-6 overflow-x-auto">
              <pre className="text-xs font-mono text-neutral-300 leading-loose">
                <code dangerouslySetInnerHTML={{ __html: jsonResponse.replace(/"(.*?)":/g, '<span class="text-primary">"$1"</span>:').replace(/true/g, '<span class="text-success">true</span>') }} />
              </pre>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
