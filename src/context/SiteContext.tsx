'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Site = 'Azaguié' | 'Yopougon';

interface SiteContextType {
  currentSite: Site;
  setCurrentSite: (site: Site) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

// Color palettes per site
const SITE_THEMES: Record<Site, Record<string, string>> = {
  'Yopougon': {
    '--color-primary':    '#8B3A1A',
    '--color-primary-dk': '#5C2410',
    '--color-accent':     '#D4956A',
    '--color-bg':         '#F5EDE0',
    '--color-text':       '#6B5C4E',
    '--color-hero-dark':  '#1A0E08',
    '--color-badge-bg':   '#8B3A1A',
  },
  'Azaguié': {
    '--color-primary':    '#1B4332',
    '--color-primary-dk': '#081C15',
    '--color-accent':     '#40916C',
    '--color-bg':         '#D8F3DC',
    '--color-text':       '#1B4332',
    '--color-hero-dark':  '#081C15',
    '--color-badge-bg':   '#2D6A4F',
  },
};

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [currentSite, setCurrentSite] = useState<Site>('Azaguié');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedSite = localStorage.getItem('hambol_current_site') as Site;
    if (savedSite && (savedSite === 'Azaguié' || savedSite === 'Yopougon')) {
      setCurrentSite(savedSite);
    }
    setMounted(true);
  }, []);

  // Inject CSS variables into :root whenever site changes
  useEffect(() => {
    const theme = SITE_THEMES[currentSite];
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    // Also set a data attribute for CSS selectors
    root.setAttribute('data-site', currentSite);
  }, [currentSite]);

  const handleSetSite = (site: Site) => {
    setCurrentSite(site);
    localStorage.setItem('hambol_current_site', site);
  };

  return (
    <SiteContext.Provider value={{ currentSite, setCurrentSite: handleSetSite }}>
      {!mounted ? (
        <div className="invisible">{children}</div>
      ) : (
        children
      )}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
