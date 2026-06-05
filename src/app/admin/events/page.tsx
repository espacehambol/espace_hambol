'use client';

import { useState } from 'react';
import { useSite } from '@/context/SiteContext';

const EVENT_TYPES = ['Mariage', 'Séminaire', 'Concert', 'Lancement Produit', 'Gala', 'Conférence'];

export default function EventsPage() {
  const { currentSite } = useSite();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', eventType: 'Mariage', guestCount: '', date: '' });
  const [localEvents, setLocalEvents] = useState<{ title: string; eventType: string; guestCount: string; date: string; status: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalEvents(prev => [...prev, { ...form, status: 'PENDING' }]);
    setIsModalOpen(false);
    setForm({ title: '', eventType: 'Mariage', guestCount: '', date: '' });
  };

  const statusColor = (s: string) => {
    if (s === 'CONFIRMED') return 'bg-green-500/20 text-green-500';
    if (s === 'QUOTED') return 'bg-blue-500/20 text-blue-500';
    return 'bg-amber-500/20 text-amber-500';
  };

  return (
    <div className="space-y-10 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary">Événements & Business</h1>
          <p className="text-gray-400 text-sm">Gestion des Salles & Conventions — {currentSite}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-primary-dk transition-all">
          + Créer un Devis Événement
        </button>
      </header>

      {/* Venue Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative group overflow-hidden">
          <h3 className="text-xl font-bold text-primary mb-6">Salle des Congrès</h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="p-1 px-3 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">LIBRE</span>
            <span className="text-xs text-gray-400">Capacité : 500 pers.</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">Idéale pour les mariages de prestige et les grands concerts en plein air.</p>
        </div>
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative group overflow-hidden">
          <h3 className="text-xl font-bold text-primary mb-6">Espace Business Center</h3>
          <div className="flex items-center gap-4 mb-4">
            <span className="p-1 px-3 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">DISPONIBLE</span>
            <span className="text-xs text-gray-400">Capacité : 40 pers.</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">Équipé de solutions de haute technologie pour vos séminaires exécutifs.</p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-[#1A1208] text-white p-10 rounded-[3rem] shadow-xl overflow-hidden">
        <h3 className="text-xl font-bold mb-8">Devis & Réservations</h3>
        {localEvents.length === 0 ? (
          <div className="text-center py-10 text-white/40">
            <p className="text-4xl mb-3">📅</p>
            <p className="font-bold">Aucun événement planifié.</p>
            <p className="text-sm">Créez votre premier devis ci-dessus.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {localEvents.map((event, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all gap-6">
                <div className="flex gap-6 items-center">
                  <div className="text-center min-w-[60px]">
                    <p className="text-2xl font-bold text-accent">{event.date ? new Date(event.date).getDate() : '—'}</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase">{event.date ? new Date(event.date).toLocaleDateString('fr', { month: 'short' }) : ''}</p>
                  </div>
                  <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                  <div>
                    <h5 className="font-bold">{event.title}</h5>
                    <p className="text-[10px] text-white/50">{event.guestCount} invités • {event.eventType}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded text-[10px] font-bold ${statusColor(event.status)}`}>{event.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button>
            <h2 className="text-2xl font-bold font-title text-primary mb-6">Créer un Devis</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Titre Événement</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Mariage Konan & Awa" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Type</label>
                <select title="Type" value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none">
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nb Invités</label>
                  <input type="number" required value={form.guestCount} onChange={e => setForm({...form, guestCount: e.target.value})} placeholder="Ex: 150" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Date</label>
                  <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:bg-primary-dk transition-all">
                Générer le Devis
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
