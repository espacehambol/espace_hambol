'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type SiteName = 'Azaguié' | 'Yopougon';

interface PromoItem {
  enabled: boolean;
  imageUrl: string;
  link: string;
  title: string;
  delayMs?: number;
  intervalMs?: number;
}

interface SocialItem {
  id: string;
  platform: string;
  url: string;
  enabled: boolean;
}

interface SitePromos {
  popup: PromoItem;
  floatingAd: PromoItem;
  socials?: SocialItem[];
}

interface PromosData {
  Azaguié: SitePromos;
  Yopougon: SitePromos;
}

type TabKey = 'popup' | 'floatingAd' | 'socials';

const SITES: SiteName[] = ['Azaguié', 'Yopougon'];
const SITE_COLORS: Record<SiteName, string> = {
  Azaguié: '#1B4332',
  Yopougon: '#8B3A1A',
};

const DEFAULT_DATA: PromosData = {
  Azaguié: {
    popup: { enabled: false, imageUrl: '', link: '', title: '' },
    floatingAd: { enabled: false, imageUrl: '', link: '', title: '', delayMs: 6000, intervalMs: 45000 },
    socials: [
      { id: 'fb', platform: 'facebook', url: 'https://www.facebook.com/share/1Hdt2EsaiS/', enabled: true },
      { id: 'tt', platform: 'tiktok', url: 'https://www.tiktok.com/@commercial.espacehambolg?_r=1&_t=ZS-96vaoWO4Ua4', enabled: true },
    ]
  },
  Yopougon: {
    popup: { enabled: false, imageUrl: '', link: '', title: '' },
    floatingAd: { enabled: false, imageUrl: '', link: '', title: '', delayMs: 6000, intervalMs: 45000 },
    socials: [
      { id: 'fb', platform: 'facebook', url: 'https://www.facebook.com/share/1Hdt2EsaiS/', enabled: true },
      { id: 'tt', platform: 'tiktok', url: 'https://www.tiktok.com/@commercial.espacehambolg?_r=1&_t=ZS-96vaoWO4Ua4', enabled: true },
    ]
  },
};

// Client-side image compression helper to avoid hitting payload size limits
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file); // fallback to original on error
    };
    reader.onerror = () => resolve(file);
  });
};

// ── Sub-component: one card per site ──────────────────────────────────────────
interface SiteCardProps {
  site: SiteName;
  activeTab: TabKey;
  item: any;
  onUpdate: (field: string, value: unknown) => void;
}

function SiteCard({ site, activeTab, item, onUpdate }: SiteCardProps) {
  // Each card has its OWN independent ref — key fix for the upload bug
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      // Compress image to ensure payload is small and uploads fast
      const compressedFile = await compressImage(file);
      console.log(`[promo-upload] Original size: ${(file.size / 1024).toFixed(1)} KB, Compressed: ${(compressedFile.size / 1024).toFixed(1)} KB`);

      const fd = new FormData();
      fd.append('file', compressedFile);

      const res = await fetch('/api/admin/upload/promotions', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.url) {
        setUploadError(json.error || json.detail || `Erreur serveur (${res.status})`);
        return;
      }
      onUpdate('imageUrl', json.url);
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
      // Reset so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [onUpdate]);

  if (activeTab === 'socials') {
    const list = (item || []) as SocialItem[];

    const updateSocial = (id: string, key: keyof SocialItem, val: unknown) => {
      const newList = list.map(s => s.id === id ? { ...s, [key]: val } : s);
      onUpdate('socials', newList);
    };

    const deleteSocial = (id: string) => {
      const newList = list.filter(s => s.id !== id);
      onUpdate('socials', newList);
    };

    const addSocial = () => {
      const newId = 'social-' + Date.now();
      const newList = [...list, { id: newId, platform: 'facebook', url: '', enabled: true }];
      onUpdate('socials', newList);
    };

    return (
      <div style={{
        background: '#fff',
        border: '1.5px solid #E5E7EB',
        borderRadius: 18,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* Site header */}
        <div style={{
          background: SITE_COLORS[site],
          color: '#fff',
          padding: '14px 20px',
        }}>
          <span style={{ fontWeight: 800, fontSize: 16 }}>
            {site === 'Azaguié' ? '🌿' : '🏙️'} {site}
          </span>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
            Configurez les réseaux sociaux qui apparaissent dans le module flottant de ce site.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {list.map((social) => (
              <div 
                key={social.id} 
                style={{
                  border: '1px solid #F3F4F6',
                  borderRadius: 12,
                  padding: 14,
                  background: '#F9FAFB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <select
                    value={social.platform.toLowerCase()}
                    onChange={e => updateSocial(social.id, 'platform', e.target.value)}
                    style={{
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 8,
                      padding: '5px 10px',
                      fontSize: 12,
                      fontWeight: 700,
                      outline: 'none',
                      background: '#fff',
                      color: '#1F2937'
                    }}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="autre">Autre / Lien</option>
                  </select>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <span style={{ fontSize: 11, color: '#4B5563' }}>Actif</span>
                      <input 
                        type="checkbox"
                        checked={social.enabled}
                        onChange={e => updateSocial(social.id, 'enabled', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => deleteSocial(social.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontSize: 12,
                        padding: '2px 6px'
                      }}
                      title="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  type="url"
                  placeholder="https://..."
                  value={social.url}
                  onChange={e => updateSocial(social.id, 'url', e.target.value)}
                  style={{
                    border: '1.5px solid #E5E7EB',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    color: '#1F2937'
                  }}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSocial}
            style={{
              padding: '10px 16px',
              background: '#F3F4F6',
              border: '1px dashed #D1D5DB',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 700,
              color: '#374151',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'background 0.2s'
            }}
          >
            ➕ Ajouter un réseau social
          </button>

        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #E5E7EB',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
    }}>
      {/* Site header */}
      <div style={{
        background: SITE_COLORS[site],
        color: '#fff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontWeight: 800, fontSize: 16 }}>
          {site === 'Azaguié' ? '🌿' : '🏙️'} {site}
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ fontSize: 12, opacity: 0.85 }}>Actif</span>
          <div
            onClick={() => onUpdate('enabled', !item.enabled)}
            style={{
              width: 42, height: 24, borderRadius: 12,
              background: item.enabled ? '#4ADE80' : '#6B7280',
              position: 'relative', cursor: 'pointer', transition: 'background .25s',
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: 9, background: '#fff',
              position: 'absolute', top: 3,
              left: item.enabled ? 21 : 3,
              transition: 'left .25s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </div>
        </label>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Image preview */}
        {item.imageUrl && item.imageUrl.length > 8 && (
          <div style={{ textAlign: 'center', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt="Aperçu"
              style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
          </div>
        )}

        {/* Upload */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            Image
          </label>

          {/* Native file input with its own dedicated ref */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                padding: '9px 16px',
                border: '2px dashed #D1D5DB',
                borderRadius: 10,
                background: uploading ? '#F3F4F6' : '#F9FAFB',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, color: '#374151',
              }}
            >
              {uploading ? '⏳ Upload en cours…' : '📁 Choisir une image'}
            </button>

            {uploadError && (
              <p style={{ color: '#DC2626', fontSize: 12, margin: 0 }}>❌ {uploadError}</p>
            )}

            <span style={{ fontSize: 11, color: '#6B7280', textAlign: 'center' }}>ou coller une URL directe</span>

            <input
              type="url"
              placeholder="https://… (URL externe)"
              value={item.imageUrl}
              onChange={e => onUpdate('imageUrl', e.target.value)}
              style={{
                border: '1.5px solid #E5E7EB', borderRadius: 10,
                padding: '9px 12px', fontSize: 13, outline: 'none', color: '#1F2937',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            Titre / Message
          </label>
          <input
            type="text"
            placeholder="Ex: Offre spéciale du mois…"
            value={item.title}
            onChange={e => onUpdate('title', e.target.value)}
            style={{
              width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10,
              padding: '9px 12px', fontSize: 13, outline: 'none', color: '#1F2937', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Link */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
            Lien (optionnel)
          </label>
          <input
            type="url"
            placeholder="https://…"
            value={item.link}
            onChange={e => onUpdate('link', e.target.value)}
            style={{
              width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10,
              padding: '9px 12px', fontSize: 13, outline: 'none', color: '#1F2937', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Floating ad extra fields */}
        {activeTab === 'floatingAd' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                Délai initial (ms)
              </label>
              <input
                type="number" min={1000} step={1000}
                value={item.delayMs ?? 6000}
                onChange={e => onUpdate('delayMs', Number(e.target.value))}
                style={{
                  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10,
                  padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                Intervalle (ms)
              </label>
              <input
                type="number" min={5000} step={1000}
                value={item.intervalMs ?? 45000}
                onChange={e => onUpdate('intervalMs', Number(e.target.value))}
                style={{
                  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10,
                  padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PromotionsAdmin() {
  const [data, setData] = useState<PromosData>(DEFAULT_DATA);
  const [activeTab, setActiveTab] = useState<TabKey>('popup');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/promotions')
      .then(r => r.json())
      .then(d => { 
        if (d?.Azaguié) {
          const merged = {
            Azaguié: {
              ...DEFAULT_DATA.Azaguié,
              ...d.Azaguié,
              socials: d.Azaguié.socials || DEFAULT_DATA.Azaguié.socials
            },
            Yopougon: {
              ...DEFAULT_DATA.Yopougon,
              ...d.Yopougon,
              socials: d.Yopougon.socials || DEFAULT_DATA.Yopougon.socials
            }
          };
          setData(merged);
        }
      })
      .catch(console.error);
  }, []);

  const handleUpdate = useCallback((site: SiteName, tab: TabKey, field: string, value: unknown) => {
    setData(prev => {
      if (tab === 'socials') {
        return {
          ...prev,
          [site]: {
            ...prev[site],
            socials: value as SocialItem[],
          }
        };
      }
      return {
        ...prev,
        [site]: {
          ...prev[site],
          [tab]: { ...prev[site][tab] as any, [field]: value },
        },
      };
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        alert(`Erreur lors de la sauvegarde : ${errJson.error || res.statusText || 'Erreur inconnue'}\n\nDétails : ${errJson.detail || 'Aucun détail'}`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(`Erreur : ${String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const TAB_LABELS: Record<TabKey, string> = {
    popup: "🪟 Popup d'accueil",
    floatingAd: '📢 Pub flottante',
    socials: '📱 Réseaux Sociaux',
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1A1208', marginBottom: 6 }}>
          📢 Gestion des Promotions
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Configurez le popup d&apos;accueil et la publicité flottante pour chaque site.
          Actives immédiatement après sauvegarde.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '2px solid #E5E7EB' }}>
        {(Object.keys(TAB_LABELS) as TabKey[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 22px', border: 'none', background: 'transparent',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              borderBottom: activeTab === tab ? '3px solid #1A1208' : '3px solid transparent',
              color: activeTab === tab ? '#1A1208' : '#9CA3AF',
              transition: 'all .2s', marginBottom: -2,
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Cards — key includes activeTab so React remounts with a fresh ref on tab change */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {SITES.map(site => (
          <SiteCard
            key={`${site}-${activeTab}`}
            site={site}
            activeTab={activeTab}
            item={data[site][activeTab]}
            onUpdate={(field, value) => handleUpdate(site, activeTab, field, value)}
          />
        ))}
      </div>

      {/* Save */}
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            padding: '13px 36px',
            background: saved ? '#16A34A' : '#1A1208',
            color: '#fff', border: 'none', borderRadius: 12,
            fontWeight: 800, fontSize: 15,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background .3s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          {saving ? '⏳ Sauvegarde…' : saved ? '✅ Sauvegardé !' : '💾 Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}
