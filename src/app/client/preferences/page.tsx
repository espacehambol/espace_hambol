'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/context/SiteContext';

export default function PreferencesPage() {
  const { currentSite } = useSite();
  const [preferences, setPreferences] = useState({
    pillowType: 'PLUME',
    beverages: 'Champagne, Jus de fruits frais',
    cleaningTime: '10:00',
    dietaryNotes: ''
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simuler sauvegarde
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-title font-bold text-primary italic">Personnaliser mon Séjour</h1>
        <p className="text-gray-500 mt-2">Dites-nous ce qui vous fait plaisir pour une expérience inoubliable à {currentSite}.</p>
      </header>

      <form onSubmit={handleSave} className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-100 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Type d&apos;oreillers</label>
            <select 
              value={preferences.pillowType}
              onChange={e => setPreferences({...preferences, pillowType: e.target.value})}
              className="w-full bg-[#fdfbf7] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="PLUME">Duvet de Plumes</option>
              <option value="MEMOIRE">Mémoire de Forme</option>
              <option value="FERME">Ferme & Ergonomique</option>
              <option value="ANTI_ALLERGIES">Anti-Allergies</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Heure de ménage souhaitée</label>
            <select 
              value={preferences.cleaningTime}
              onChange={e => setPreferences({...preferences, cleaningTime: e.target.value})}
              className="w-full bg-[#fdfbf7] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            >
              <option value="09:00">09:00 - Matinée</option>
              <option value="11:00">11:00 - Avant Midi</option>
              <option value="14:00">14:00 - Après-midi</option>
              <option value="18:00">18:00 - Turn-down Service</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-primary uppercase tracking-widest">Boissons & Minibar (Favoris)</label>
          <input 
            type="text"
            value={preferences.beverages}
            onChange={e => setPreferences({...preferences, beverages: e.target.value})}
            className="w-full bg-[#fdfbf7] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            placeholder="Ex: Champagne, Eau pétillante, Thé vert..."
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-primary uppercase tracking-widest">Notes Diététiques ou Allergies</label>
          <textarea 
            rows={4}
            value={preferences.dietaryNotes}
            onChange={e => setPreferences({...preferences, dietaryNotes: e.target.value})}
            className="w-full bg-[#fdfbf7] border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            placeholder="Avez-vous des restrictions alimentaires ?"
          />
        </div>

        <div className="pt-6 flex items-center justify-between">
          <button 
            type="submit"
            disabled={saving}
            className="px-10 py-5 bg-primary text-white rounded-[2rem] font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer mes Préférences'}
          </button>
          
          {success && (
            <span className="flex items-center gap-2 text-green-600 font-bold animate-fade-in">
              <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-[10px]">✓</span>
              Préférences enregistrées !
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
