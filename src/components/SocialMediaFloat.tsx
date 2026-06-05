'use client';

import { useSite } from '@/context/SiteContext';
import { useState, useEffect } from 'react';

interface SocialItem {
  id: string;
  platform: string;
  url: string;
  enabled: boolean;
}

const PLATFORM_ICONS: Record<string, { svg: React.ReactNode; color: string }> = {
  facebook: {
    color: '#1877F2',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
      </svg>
    )
  },
  tiktok: {
    color: '#000000',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.17 1.22 1.34 2.92 2.12 4.74 2.29v3.83c-1.68-.07-3.32-.67-4.66-1.72-.11-.09-.23-.19-.36-.29v7.7c.04 3.99-2.92 7.55-6.89 8.01-4.73.54-8.87-2.82-9.15-7.55-.3-4.99 3.65-9.35 8.65-9.45.69 0 1.37.07 2.05.2v3.7c-.67-.2-1.37-.29-2.07-.26-3 .08-5.38 2.76-5.18 5.76.17 2.6 2.36 4.63 4.96 4.6 2.73-.03 4.88-2.29 4.86-5.02V.02z"/>
      </svg>
    )
  },
  instagram: {
    color: '#E4405F',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    )
  },
  youtube: {
    color: '#FF0000',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    )
  },
  whatsapp: {
    color: '#25D366',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.557-5.338 11.897-11.953 11.897-.002 0-.003 0-.005 0-2.099-.001-4.14-.549-5.943-1.591L0 24zm6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654z"/>
      </svg>
    )
  },
  twitter: {
    color: '#000000',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  linkedin: {
    color: '#0077B5',
    svg: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    )
  }
};

const DEFAULT_ICON = {
  color: '#8B3A1A',
  svg: (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7.4H7c-2.54 0-4.6 2.06-4.6 4.6s2.06 4.6 4.6 4.6h4v-1.5H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-5.6h-4v1.5h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4v1.5h4c2.54 0 4.6-2.06 4.6-4.6s-2.06-4.6-4.6-4.6z"/>
    </svg>
  )
};

function SocialLink({ item }: { item: SocialItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const platformKey = item.platform.toLowerCase().trim();
  const conf = PLATFORM_ICONS[platformKey] || DEFAULT_ICON;

  return (
    <a 
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Suivez-nous sur ${item.platform}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? conf.color : '#ffffff',
        color: isHovered ? '#ffffff' : '#1A1208',
      }}
      className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 border border-[#D4956A]/30 hover:scale-110 group relative"
    >
      {conf.svg}
      <span className="absolute left-16 bg-[#1A1208] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md uppercase tracking-wider whitespace-nowrap capitalize">
        {item.platform}
      </span>
    </a>
  );
}

export default function SocialMediaFloat() {
  const { currentSite } = useSite();
  const [socials, setSocials] = useState<SocialItem[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/admin/promotions')
      .then(r => r.json())
      .then(data => {
        const siteData = data[currentSite];
        if (siteData?.socials) {
          setSocials(siteData.socials.filter((s: SocialItem) => s.enabled && s.url));
        }
      })
      .catch(console.error);
  }, [currentSite]);

  useEffect(() => {
    if (socials.length > 0) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [socials]);

  if (socials.length === 0) return null;

  return (
    <div className={`fixed left-4 top-1/2 -translate-y-1/2 z-[90] flex flex-col gap-4 items-center transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-16 pointer-events-none'}`}>
      
      <span className="text-[9px] uppercase font-bold tracking-widest text-[#8B3A1A] select-none [writing-mode:vertical-lr] rotate-180 opacity-70 mb-2">
        Nous suivre
      </span>

      {socials.map((item) => (
        <SocialLink key={item.id} item={item} />
      ))}

    </div>
  );
}
