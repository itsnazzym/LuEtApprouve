"use client";

import Link from "next/link";
import { ShieldCheck, Download } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="w-full bg-background/70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <ShieldCheck className="w-8 h-8" />
            <p className="font-bold text-xl tracking-tight">
              <span className="text-white">LuEt</span><span className="text-primary">Approuvé</span>
            </p>
          </Link>
          
          <div className="hidden sm:flex gap-6">
            <Link href="/" className="font-medium text-white hover:text-primary transition-colors">
              Accueil
            </Link>
            <Link href="/about" className="font-medium text-neutral-400 hover:text-white transition-colors">
              À propos
            </Link>
            <Link href="/grades" className="font-medium text-neutral-400 hover:text-white transition-colors">
              Grades
            </Link>
            <Link href="/api-docs" className="font-medium text-neutral-400 hover:text-white transition-colors">
              API
            </Link>
          </div>
        </div>
        
        <div>
          <Link 
            href="/extension" 
            className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold py-2 px-4 rounded-xl transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Obtenir l'Extension
          </Link>
        </div>
      </div>
    </nav>
  );
}
