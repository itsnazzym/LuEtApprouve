"use client";

import React from "react";

export function CopyButton({ text }: { text: string }) {
  return (
    <button 
      onClick={(e) => {
        navigator.clipboard.writeText(text);
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = "Copié ! (Ctrl+F)";
        setTimeout(() => { btn.innerHTML = originalText; }, 3000);
      }}
      className="inline-flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2 px-4 rounded-lg transition-colors text-xs uppercase tracking-wider"
    >
      Copier la citation
    </button>
  );
}
