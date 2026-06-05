'use client';

import { useSite } from '@/context/SiteContext';
import { useState } from 'react';

export default function SiteSwitcher() {
  const { currentSite, setCurrentSite } = useSite();
  const [isOpen, setIsOpen] = useState(false);

  const sites: ('Azaguié' | 'Yopougon')[] = ['Azaguié', 'Yopougon'];

  return (
    <div className="relative inline-block text-left font-body">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-sand px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-inset ring-accent hover:bg-accent/20 transition-all"
          id="menu-button"
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-haspopup="true"
        >
          {currentSite}
          <svg className="-mr-1 h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div 
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-sand shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
        >
          <div className="py-1" role="none">
            {sites.map((site) => (
              <button
                key={site}
                onClick={() => {
                  setCurrentSite(site);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm ${site === currentSite ? 'bg-accent text-white' : 'text-primary hover:bg-accent/20'}`}
                role="menuitem"
              >
                {site}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
