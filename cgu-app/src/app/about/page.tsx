import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "À propos - LuEtApprouvé",
  description: "Notre mission : rendre les Conditions Générales d'Utilisation lisibles par tous.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-5xl">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 mb-16 text-neutral-400 font-bold hover:text-primary transition-colors uppercase tracking-widest text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 items-start">
        <main>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-12 tracking-tighter">
            <span className="line-through decoration-primary decoration-[6px] opacity-60">
              J'ai lu et j'accepte les conditions.
            </span>
            <br />
            <span className="text-primary">Le plus gros mensonge du web.</span>
          </h1>

          <div className="prose prose-invert prose-lg prose-p:text-neutral-300 prose-headings:text-white max-w-none">
            <p className="text-2xl leading-relaxed font-medium mb-12 border-l-4 border-primary pl-6">
              Notre mission est simple : détruire l'opacité des Conditions Générales d'Utilisation (CGU). Personne ne les lit. Les entreprises le savent. Nous avons décidé que cela devait changer.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">Notre Vision</h2>
            <p>
              Nous croyons au droit fondamental des utilisateurs à comprendre ce à quoi ils s'engagent. À l'ère numérique, l'information est le pouvoir, et l'opacité est une arme. Nous rendons ce pouvoir aux utilisateurs en rendant la transparence automatique et inévitable.
            </p>
            
            <h2 className="text-3xl font-bold mt-12 mb-6">Comment ça marche ?</h2>
            <p>
              Nous utilisons une analyse automatisée pour scanner, lire, et synthétiser les milliers de mots cachés dans les CGU des plateformes. Nous mettons en lumière les clauses abusives, les violations potentielles de votre vie privée, et les droits que vous cédez silencieusement.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-6">Gratuit et Open Source</h2>
            <p>
              Ce projet est conçu pour être utile, accessible via notre extension de navigateur, et interrogable via notre API publique.
            </p>
          </div>
        </main>

        <aside className="sticky top-32 space-y-8">
          <div className="bg-content2/50 backdrop-blur-md border border-neutral-800 p-8 rounded-3xl shadow-2xl">
            <ShieldCheck className="w-16 h-16 text-primary mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Transparence Totale</h3>
            <p className="text-neutral-400 mb-6">Le projet est ouvert et accessible à tous.</p>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex w-full justify-center items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold py-3 px-4 rounded-xl transition-colors"
            >
              Voir le code source <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
