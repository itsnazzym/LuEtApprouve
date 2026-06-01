import Link from "next/link";
import { ArrowLeft, ShieldCheck, AlertTriangle, XCircle, Info } from "lucide-react";

export const metadata = {
  title: "Grades et Évaluation - LuEtApprouvé",
  description: "Comment nous évaluons et notons les conditions générales d'utilisation.",
};

export default function GradesPage() {
  const grades = [
    {
      id: "red",
      title: "Point Rouge (Critique)",
      icon: <XCircle className="w-12 h-12 text-danger" />,
      colorClass: "bg-danger/10 border-danger/30 text-danger",
      description: "Danger pour la vie privée ou droits abusifs. Ces clauses sont souvent déséquilibrées en faveur de l'entreprise et contre l'utilisateur.",
      examples: [
        "L'entreprise revend l'historique complet de votre navigation.",
        "Vous perdez les droits de propriété intellectuelle sur ce que vous publiez.",
        "L'entreprise peut vous bannir sans aucune justification ni recours."
      ]
    },
    {
      id: "orange",
      title: "Point Orange (Attention)",
      icon: <AlertTriangle className="w-12 h-12 text-warning" />,
      colorClass: "bg-warning/10 border-warning/30 text-warning",
      description: "Pratiques courantes mais potentiellement intrusives. Rien d'illégal, mais des clauses qui méritent votre attention avant d'accepter.",
      examples: [
        "La plateforme peut utiliser votre contenu pour entraîner ses algorithmes.",
        "Des traceurs publicitaires (cookies) sont utilisés par défaut.",
        "Les conditions peuvent changer sans notification préalable de 30 jours."
      ]
    },
    {
      id: "green",
      title: "Point Vert (Bon)",
      icon: <ShieldCheck className="w-12 h-12 text-success" />,
      colorClass: "bg-success/10 border-success/30 text-success",
      description: "La plateforme protège activement vos droits ou s'engage au-delà des standards habituels de l'industrie. Vous conservez le contrôle de vos données.",
      examples: [
        "Vos données ne sont jamais vendues à des tiers.",
        "Vous pouvez supprimer votre compte et vos données instantanément.",
        "Le code source de la plateforme est ouvert (Open Source)."
      ]
    },
    {
      id: "gray",
      title: "Point Gris (Neutre / Info)",
      icon: <Info className="w-12 h-12 text-neutral-400" />,
      colorClass: "bg-neutral-800 border-neutral-700 text-neutral-400",
      description: "Information neutre ou simple mention légale. Sans impact négatif ni positif sur vos droits, mais utile à connaître.",
      examples: [
        "Le service est fourni \"en l'état\", sans garantie explicite.",
        "Le siège social de l'entreprise est indiqué.",
        "La loi applicable est précisée (ex: droit français ou californien)."
      ]
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 mb-16 text-neutral-400 font-bold hover:text-white transition-colors uppercase tracking-widest text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <header className="mb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Le Système de Notation</h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Nous ne donnons pas seulement une note globale. Nous décomposons chaque clause juridique en points concrets et faciles à comprendre.
        </p>
      </header>

      <div className="space-y-12">
        {grades.map((grade) => (
          <div 
            key={grade.id} 
            className={`border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all hover:scale-[1.01] ${grade.colorClass}`}
          >
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="bg-black/50 p-6 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">
                {grade.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black mb-4">{grade.title}</h2>
                <p className="text-lg text-neutral-200 mb-8 leading-relaxed font-medium">
                  {grade.description}
                </p>
                
                <div>
                  <h3 className="text-sm uppercase tracking-widest font-bold opacity-70 mb-4">Exemples typiques :</h3>
                  <ul className="space-y-3">
                    {grade.examples.map((example, i) => (
                      <li key={i} className="flex items-center gap-3 text-white">
                        <div className="w-2 h-2 rounded-full bg-current opacity-50 shrink-0" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Background decorative artifact */}
            <div className="absolute -right-20 -bottom-20 opacity-[0.03] scale-[3] pointer-events-none">
              {grade.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
