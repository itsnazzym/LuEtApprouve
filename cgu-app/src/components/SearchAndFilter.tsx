"use client";

import { useState, useMemo } from "react";
import { PlatformCard } from "./PlatformCard";
import { Search } from "lucide-react";

type Platform = {
  id: string;
  name: string;
  logo_url: string | null;
  grade: string;
};

export function SearchAndFilter({ initialPlatforms }: { initialPlatforms: Platform[] }) {
  const [search, setSearch] = useState("");
  const [activeGrade, setActiveGrade] = useState<string | null>(null);

  const filteredPlatforms = useMemo(() => {
    return initialPlatforms.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchGrade = activeGrade ? p.grade === activeGrade : true;
      return matchSearch && matchGrade;
    });
  }, [initialPlatforms, search, activeGrade]);

  const grades = ["A", "B", "C", "D", "E", "F"];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-3xl mb-12 relative flex flex-col items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-neutral-500" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une application (ex: Spotify, Netflix...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 hover:border-primary focus:border-primary focus:outline-none rounded-full pl-16 pr-8 py-5 text-lg text-white shadow-xl transition-all"
          />
        </div>
        
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button 
            onClick={() => setActiveGrade(null)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeGrade === null ? "bg-white text-black" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
          >
            Toutes
          </button>
          {grades.map(grade => (
            <button 
              key={grade}
              onClick={() => setActiveGrade(activeGrade === grade ? null : grade)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeGrade === grade ? "bg-primary text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"}`}
            >
              Class {grade}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlatforms.length > 0 ? (
          filteredPlatforms.map((platform) => (
            <PlatformCard
              key={platform.id}
              id={platform.id}
              name={platform.name}
              logo_url={platform.logo_url}
              grade={platform.grade}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-neutral-500">
            Aucune application trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
