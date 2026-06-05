'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSite } from '@/context/SiteContext';

interface PopupConfig {
  enabled: boolean;
  imageUrl: string;
  link: string;
  title: string;
}

export default function GlobalPopup() {
  const { currentSite } = useSite();
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const sessionKey = `hambol_popup_seen_${currentSite}`;
    // Already shown this session for this site
    if (sessionStorage.getItem(sessionKey)) return;

    fetch('/api/admin/promotions')
      .then(r => r.json())
      .then(data => {
        const siteData = data[currentSite];
        if (siteData?.popup?.enabled && siteData.popup.imageUrl) {
          setConfig(siteData.popup);
          setVisible(true);
          sessionStorage.setItem(sessionKey, '1');
        }
      })
      .catch(() => {/* silently fail */});
  }, [currentSite]);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 350);
  }, []);

  if (!visible || !config) return null;

  const inner = (
    <div
      className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-350 ${closing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
      style={{ maxWidth: '90vw', maxHeight: '85vh', width: 'auto' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={close}
        aria-label="Fermer"
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.55)', color: '#fff',
          border: 'none', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
          backdropFilter: 'blur(4px)',
        }}
      >
        ×
      </button>

      {/* Image — auto-adapts to any aspect ratio */}
      <div style={{ position: 'relative', maxWidth: '80vw', maxHeight: '80vh' }}>
        {/* We use a regular <img> so the container shrink-wraps naturally */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.imageUrl}
          alt={config.title}
          style={{
            display: 'block',
            maxWidth: '80vw',
            maxHeight: '80vh',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Optional title bar at the bottom */}
      {config.title && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          textAlign: 'center',
          backdropFilter: 'blur(6px)',
        }}>
          {config.title}
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes hambol-fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes hambol-scaleIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        .hambol-popup-overlay {
          animation: hambol-fadeIn 0.25s ease;
        }
        .hambol-popup-inner {
          animation: hambol-scaleIn 0.35s cubic-bezier(.22,1,.36,1);
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="hambol-popup-overlay"
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.70)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)',
        }}
      >
        <div className="hambol-popup-inner">
          {config.link ? (
            <a href={config.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
              {inner}
            </a>
          ) : inner}
        </div>
      </div>
    </>
  );
}
