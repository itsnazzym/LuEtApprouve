import { db } from "@/db";
import { platforms, dataPoints, sources } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, XCircle, Info, ArrowLeft, ExternalLink, Quote, Search } from "@/components/Icons";

const severityOrder: Record<string, number> = { "RED": 0, "ORANGE": 1, "GREEN": 2, "GRAY": 3 };

export default async function PlatformPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const platformId = resolvedParams.id;
  if (!platformId) return notFound();

  const [platform] = await db.select().from(platforms).where(eq(platforms.id, platformId));
  if (!platform) return notFound();

  const points = await db.select().from(dataPoints).where(eq(dataPoints.platform_id, platformId));
  const allSources = await db.select().from(sources).where(eq(sources.platform_id, platformId));

  const sortedPoints = [...points].sort((a, b) => severityOrder[a.status] - severityOrder[b.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "GREEN": return <ShieldCheck className="w-8 h-8 text-success shrink-0" />;
      case "ORANGE": return <AlertTriangle className="w-8 h-8 text-warning shrink-0" />;
      case "RED": return <XCircle className="w-8 h-8 text-danger shrink-0" />;
      case "GRAY": return <Info className="w-8 h-8 text-neutral-400 shrink-0" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "GREEN": return "bg-success/10 border border-success/20";
      case "ORANGE": return "bg-warning/10 border border-warning/20";
      case "RED": return "bg-danger/10 border border-danger/20";
      case "GRAY": return "bg-neutral-800 border border-neutral-700";
      default: return "bg-neutral-800 border-neutral-700";
    }
  };

  const getGradeColor = (grade: string) => {
    if (["A", "B"].includes(grade)) return "bg-success text-white shadow-[0_0_30px_rgba(23,201,100,0.4)]";
    if (grade === "C") return "bg-warning text-white shadow-[0_0_30px_rgba(245,165,36,0.4)]";
    return "bg-danger text-white shadow-[0_0_30px_rgba(243,18,96,0.4)]";
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 mb-12 text-neutral-400 font-medium hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>

      <div className="bg-content2/50 backdrop-blur-md border border-neutral-800 rounded-3xl mb-12 shadow-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-3 shrink-0 shadow-lg">
              {platform.logo_url ? (
                <img src={platform.logo_url} alt={platform.name} className="object-contain w-full h-full" />
              ) : (
                <span className="text-4xl font-black text-black">{platform.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">{platform.name}</h1>
              <div className="flex flex-col gap-1">
                {allSources.length > 0 ? allSources.map((s, i) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 font-medium text-sm">
                    {s.label} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )) : (
                  <a href={platform.source_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2 font-medium">
                    Lire les conditions complètes <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center shrink-0">
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Classement</span>
            <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-7xl font-black ${getGradeColor(platform.grade)}`}>
              {platform.grade}
            </div>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Résumé de l'analyse</h2>
        <p className="text-lg text-neutral-300 leading-relaxed bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
          {platform.summary}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">Points clés de la politique</h2>
        <div className="flex flex-col gap-6">
          {sortedPoints.length > 0 ? sortedPoints.map(point => (
            <div key={point.id} className={`rounded-3xl border border-neutral-800 shadow-lg ${getStatusClass(point.status)}`}>
              <div className="flex flex-col md:flex-row items-start gap-6 p-6">
                <div className="mt-1 shrink-0">{getStatusIcon(point.status)}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{point.title}</h3>
                  <p className="text-neutral-300 leading-relaxed text-lg mb-4">{point.description}</p>
                  
                  {(() => {
                    if (!point.quote) return null;
                    const sourceUrl = allSources.length > 0 ? allSources[0].url : platform.source_url;
                    const hash = sourceUrl.includes("#") ? "&" : "#";
                    const anchor = `${hash}:~:text=${encodeURIComponent(point.quote.substring(0, 120))}`;
                    return (
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 relative mt-4">
                      <Quote className="w-8 h-8 text-white/10 absolute top-2 left-2" />
                      <p className="text-neutral-400 italic text-sm pl-8 mb-4">&ldquo;{point.quote}&rdquo;</p>
                      <a href={sourceUrl + anchor}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary/20 hover:bg-primary/40 text-primary font-bold py-2 px-4 rounded-lg transition-colors text-xs uppercase tracking-wider">
                        <Search className="w-4 h-4" />
                        Voir l'emplacement exact
                      </a>
                    </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )) : (
            <p className="text-neutral-500">Aucun point d'analyse trouvé pour cette plateforme.</p>
          )}
        </div>
      </section>
    </div>
  );
}
