/// <reference types="chrome" />
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function FloatingWidget() {
  const [data, setData] = useState<any>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const domain = window.location.hostname.replace('www.', '');
    
    fetch(`http://localhost:3000/api/check?domain=${domain}`)
      .then(res => res.json())
      .then(result => {
        if (result && result.found) {
          setData(result);
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
      {hovered && (
        <div style={{
          backgroundColor: '#171717',
          color: 'white',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: '1px solid #404040',
          width: '260px',
          marginBottom: '8px'
        }}>
          <div style={{ fontWeight: '900', fontSize: '14px', marginBottom: '8px', color: '#3b82f6' }}>LuEtApprouvé</div>
          <p style={{ fontSize: '14px', margin: 0 }}>
            <strong>{data.platform.name}</strong> a obtenu la note <strong>{data.platform.grade}</strong>.
          </p>
          {data.criticalPoints?.length > 0 && (
            <p style={{ fontSize: '12px', color: '#f87171', marginTop: '8px', margin: 0 }}>
              ⚠️ {data.criticalPoints.length} point(s) critique(s) détecté(s). Cliquez sur l'extension pour voir les détails.
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
        boxShadow: `0 0 15px ${colors.shadow}`,
        transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)'
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
