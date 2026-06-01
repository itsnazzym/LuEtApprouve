import { db } from "@/db";
import { platforms } from "@/db/schema";
import { SearchAndFilter } from "@/components/SearchAndFilter";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allPlatforms = await db.select().from(platforms);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-16">
        <header className="mb-16 text-center max-w-4xl mx-auto mt-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
            Je n'ai pas lu. <br />
            <span className="text-primary">L'IA s'en charge.</span>
          </h1>
          <p className="text-xl text-neutral-400 font-medium">
            Obtenez instantanément une analyse claire et détaillée des conditions d'utilisation de n'importe quel service. Protégez votre vie privée sans perdre votre temps.
          </p>
        </header>

        <SearchAndFilter initialPlatforms={allPlatforms} />
      </main>
    </div>
  );
}
