import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full border-b border-neutral-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          <span className="text-white">LuEt</span><span className="text-primary">Approuvé</span>
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/add" className="text-sm font-bold bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-full transition-colors">
            + Ajouter une App
          </Link>
        </div>
      </div>
    </nav>
  );
}
