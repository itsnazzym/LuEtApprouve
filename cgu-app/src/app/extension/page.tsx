import Link from "next/link";
import { ArrowLeft, Download, Code, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Obtenir l'Extension - LuEtApprouvé",
  description: "Installez l'extension LuEtApprouvé pour naviguer en toute sécurité.",
};

export default function ExtensionPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 mb-16 text-neutral-400 font-bold hover:text-white transition-colors uppercase tracking-widest text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <header className="mb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Installez l'Extension</h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          L'extension est actuellement en version bêta (mode développeur). Suivez ces étapes simples pour l'installer sur Google Chrome, Brave ou Edge.
        </p>
      </header>

      <div className="space-y-8">
        <div className="bg-content2/50 backdrop-blur-md border border-neutral-800 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
          
          <div className="flex flex-col gap-12 relative z-10">
            {/* Etape 1 */}
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xl shrink-0">1</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Télécharger le code source</h3>
                <p className="text-neutral-400 mb-4">Récupérez le dossier contenant l'extension.</p>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  <Download className="w-5 h-5" /> Télécharger (.zip)
                </a>
              </div>
            </div>

            {/* Etape 2 */}
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center font-black text-xl shrink-0">2</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Activer le mode développeur</h3>
                <p className="text-neutral-400">
                  Ouvrez votre navigateur et allez sur la page des extensions : <br />
                  <code className="text-primary bg-primary/10 px-2 py-1 rounded-md mt-2 inline-block">chrome://extensions</code>
                </p>
                <p className="text-neutral-400 mt-2">
                  Activez ensuite le bouton <strong>"Mode développeur"</strong> (Developer mode) en haut à droite.
                </p>
              </div>
            </div>

            {/* Etape 3 */}
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center font-black text-xl shrink-0">3</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Charger l'extension</h3>
                <p className="text-neutral-400">
                  Cliquez sur le bouton <strong>"Charger l'extension non empaquetée"</strong> (Load unpacked) en haut à gauche et sélectionnez le dossier `cgu-extension` que vous avez téléchargé.
                </p>
              </div>
            </div>

            <div className="bg-success/10 border border-success/30 p-6 rounded-2xl flex items-start gap-4 mt-4">
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
              <p className="text-success font-medium">
                Félicitations ! L'extension est maintenant installée. Vous verrez l'icône LuEtApprouvé apparaître dans votre barre d'extensions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
