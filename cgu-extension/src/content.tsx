/// <reference types="chrome" />
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function FloatingWidget() {
  const [data, setData] = useState<any>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const domain = window.location.hostname.replace('www.', '');
    fetch(`https://luetapprouve.vercel.app/api/check?domain=${domain}`)
      .then(res => res.json())
      .then(result => {
        if (result && result.found) {
          setData(result);
          
          // Sauvegarde des stats pour le Bilan de Santé
          if (chrome && chrome.storage) {
            chrome.storage.local.get(['luetapprouve_stats', 'luetapprouve_domains'], (data) => {
              const stats: any = data.luetapprouve_stats || { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, total: 0 };
              const domains: string[] = (data.luetapprouve_domains as string[]) || [];
              
              // On ne compte qu'une seule fois par domaine
              if (!domains.includes(domain)) {
                stats[result.platform.grade] = (stats[result.platform.grade] || 0) + 1;
                stats.total += 1;
                domains.push(domain);
                
                // Garder seulement les 100 derniers domaines pour ne pas faire exploser le storage
                if (domains.length > 100) domains.shift();
                
                chrome.storage.local.set({ 
                  luetapprouve_stats: stats,
                  luetapprouve_domains: domains
                });
              }
            });
          }
        }
      })
      .catch(err => console.log("LuEtApprouvé not available on this domain:", err));
  }, []);

  if (!data) return null;

  const getColors = (grade: string) => {
    if (["A", "B"].includes(grade)) return { bg: "#22c55e", shadow: "rgba(34,197,94,0.5)", color: "white" };
    if (["C", "D"].includes(grade)) return { bg: "#eab308", shadow: "rgba(234,179,8,0.5)", color: "black" };
    return { bg: "#ef4444", shadow: "rgba(239,68,68,0.5)", color: "white" };
  };

  const colors = getColors(data.platform.grade);
  const isWarning = ["D", "E", "F"].includes(data.platform.grade);

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        fontFamily: 'system-ui, sans-serif'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(hovered || (isWarning && !hovered)) && (
        <div style={{
          backgroundColor: isWarning ? '#450a0a' : '#171717',
          color: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: `0 10px 25px ${colors.shadow}`,
          border: `1px solid ${isWarning ? '#dc2626' : '#404040'}`,
          width: '280px',
          marginBottom: '8px',
          transition: 'all 0.3s ease-in-out',
          opacity: (hovered || isWarning) ? 1 : 0
        }}>
          <div style={{ 
            fontWeight: '900', 
            fontSize: '14px', 
            marginBottom: '8px', 
            color: isWarning ? '#fca5a5' : '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {isWarning ? '⚠️ ALERTE SÉCURITÉ' : '🛡️ LuEtApprouvé'}
          </div>
          <p style={{ fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
            <strong>{data.platform.name}</strong> a obtenu la note <strong style={{color: colors.bg}}>{data.platform.grade}</strong>.
          </p>
          {isWarning && (
            <p style={{ fontSize: '12px', color: '#fca5a5', marginTop: '8px', margin: 0, fontWeight: 'bold' }}>
              Ce site présente des risques élevés pour vos données.
            </p>
          )}
          {data.criticalPoints?.length > 0 && (
            <p style={{ fontSize: '12px', color: isWarning ? '#f87171' : '#9ca3af', marginTop: '8px', margin: 0 }}>
              {data.criticalPoints.length} point(s) critique(s). Cliquez sur l'extension.
            </p>
          )}
        </div>
      )}
      
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: colors.bg,
        color: colors.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: '900',
        cursor: 'pointer',
        boxShadow: `0 0 20px ${colors.shadow}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'scale(1.1) translateY(-4px)' : 'scale(1) translateY(0)',
        border: '3px solid rgba(255,255,255,0.2)'
      }}>
        {data.platform.grade}
      </div>
    </div>
  );
}

const init = () => {
  const container = document.createElement('div');
  container.id = 'cgu-scanner-root';
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(<FloatingWidget />);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
