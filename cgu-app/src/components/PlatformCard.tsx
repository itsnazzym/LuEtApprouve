"use client";

import Link from "next/link";

interface PlatformProps {
  id: string;
  name: string;
  logo_url: string | null;
  grade: string;
}

const gradeColors: Record<string, string> = {
  "A": "bg-success text-white shadow-[0_0_15px_rgba(23,201,100,0.5)]",
  "B": "bg-success text-white shadow-[0_0_15px_rgba(23,201,100,0.5)]",
  "C": "bg-warning text-black shadow-[0_0_15px_rgba(245,165,36,0.5)]",
  "D": "bg-warning text-black shadow-[0_0_15px_rgba(245,165,36,0.5)]",
  "E": "bg-danger text-white shadow-[0_0_15px_rgba(243,18,96,0.5)]",
  "F": "bg-danger text-white shadow-[0_0_15px_rgba(243,18,96,0.5)]",
};

export function PlatformCard({ id, name, logo_url, grade }: PlatformProps) {
  const colorClass = gradeColors[grade] || "bg-gray-500 text-white";

  return (
    <Link href={`/platforms/${id}`} className="block h-full group">
      <div className="w-full h-full bg-content2/50 backdrop-blur-md border border-neutral-800 group-hover:border-neutral-500 transition-colors rounded-3xl overflow-hidden shadow-lg">
        <div className="flex flex-row items-center gap-4 p-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-2 shrink-0">
            {logo_url ? (
              <img src={logo_url} alt={name} className="object-contain w-full h-full" />
            ) : (
              <span className="text-2xl font-bold text-black">{name.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col gap-1 flex-grow text-left">
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-sm text-neutral-400">Voir l'analyse détaillée</p>
          </div>
          <div className="shrink-0">
            <div className={`px-4 py-2 rounded-full font-black text-xl flex items-center justify-center ${colorClass}`}>
              {grade}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
