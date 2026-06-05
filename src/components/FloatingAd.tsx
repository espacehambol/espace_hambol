'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSite } from '@/context/SiteContext';

interface AdConfig {
  enabled: boolean;
  imageUrl: string;
  link: string;
  title: string;
  delayMs: number;
  intervalMs: number;
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function FloatingAd() {
  const { currentSite } = useSite();
  const [config, setConfig] = useState<AdConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load config whenever site changes
  useEffect(() => {
    fetch('/api/admin/promotions')
      .then(r => r.json())
      .then(data => {
        const siteData = data[currentSite];
        if (siteData?.floatingAd?.enabled && siteData.floatingAd.imageUrl) {
          setConfig(siteData.floatingAd);
        } else {
          setConfig(null);
        }
      })
      .catch(() => setConfig(null));
  }, [currentSite]);

  const dismiss = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 400);
  }, []);

  // Schedule the ad to appear
  const scheduleNext = useCallback((cfg: AdConfig, isFirst: boolean) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const base = isFirst ? cfg.delayMs : cfg.intervalMs;
    const jitter = randomBetween(-base * 0.2, base * 0.2);
    const delay = Math.max(1000, base + jitter);
    timerRef.current = setTimeout(() => {
      setSide(Math.random() > 0.5 ? 'right' : 'left');
      setVisible(true);
    }, delay);
  }, []);

  useEffect(() => {
    // Clear any pending timer when config changes
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!config) return;
    scheduleNext(config, true);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [config, scheduleNext]);

  // When ad is dismissed, schedule the next appearance
  useEffect(() => {
    if (!visible && !closing && config) {
      // Only reschedule after it was actually shown (not on first mount)
      // We track this with a ref so we don't fire on initial render
    }
  }, [visible, closing, config, scheduleNext]);

  // Reschedule after dismiss
  const handleClose = useCallback(() => {
    dismiss();
    if (config) {
      // Schedule next appearance after dismiss animation
      setTimeout(() => scheduleNext(config, false), 450);
    }
  }, [config, dismiss, scheduleNext]);

  if (!config) return null;

  const positionStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 80,
    [side]: 20,
    zIndex: 8000,
    maxWidth: 320,
    width: 'auto',
  };

  const slideClass = side === 'right' ? 'hambol-ad-slide-right' : 'hambol-ad-slide-left';

  return (
    <>
      <style>{`
        @keyframes hambol-ad-in-right {
          from { opacity: 0; transform: translateX(120px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hambol-ad-in-left {
          from { opacity: 0; transform: translateX(-120px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hambol-ad-out-right {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(120px); }
        }
        @keyframes hambol-ad-out-left {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-120px); }
        }
        .hambol-ad-slide-right {
          animation: hambol-ad-in-right 0.45s cubic-bezier(.22,1,.36,1) both;
        }
        .hambol-ad-slide-left {
          animation: hambol-ad-in-left 0.45s cubic-bezier(.22,1,.36,1) both;
        }
        .hambol-ad-out-right {
          animation: hambol-ad-out-right 0.38s ease-in both;
        }
        .hambol-ad-out-left {
          animation: hambol-ad-out-left 0.38s ease-in both;
        }
      `}</style>

      {visible && (
        <div style={positionStyle}>
          <div
            className={closing
              ? (side === 'right' ? 'hambol-ad-out-right' : 'hambol-ad-out-left')
              : slideClass
            }
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Fermer la publicité"
              style={{
                position: 'absolute', top: 8, right: 8, zIndex: 1,
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                border: 'none', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1, backdropFilter: 'blur(4px)',
              }}
            >
              ×
            </button>

            {/* Image — adapts to any aspect ratio, max 320px wide */}
            {config.link ? (
              <a href={config.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.imageUrl}
                  alt={config.title}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    maxWidth: 320,
                    objectFit: 'contain',
                  }}
                />
              </a>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={config.imageUrl}
                alt={config.title}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  maxWidth: 320,
                  objectFit: 'contain',
                }}
              />
            )}

            {config.title && (
              <div style={{
                padding: '8px 14px',
                background: 'rgba(0,0,0,0.70)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                textAlign: 'center',
                backdropFilter: 'blur(4px)',
              }}>
                {config.title}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
