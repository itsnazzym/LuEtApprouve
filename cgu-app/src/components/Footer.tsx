export function Footer() {
  return (
    <footer className="w-full mt-auto py-8 border-t border-default-200 bg-content1/50 backdrop-blur-md">
      <div className="container mx-auto px-6 text-center text-sm text-default-500">
        <p className="mb-2 font-bold text-danger-500">⚠️ Avertissement Légal</p>
        <p className="max-w-2xl mx-auto opacity-80">
          Ce site propose une vulgarisation visuelle et simplifiée des Conditions Générales d'Utilisation. 
          Il ne constitue en aucun cas un conseil juridique officiel. L'analyse peut contenir des erreurs d'interprétation. 
          Consultez toujours les documents officiels via les liens "Source" fournis sur chaque fiche.
        </p>
      </div>
    </footer>
  );
}
