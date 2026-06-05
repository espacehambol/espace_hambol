'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/context/SiteContext';

interface Client {
  id: string;
  name: string;
  email: string;
  tier: string;
  visits: number;
  spent: number;
}

export default function CRMPage() {
  const { currentSite } = useSite();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({ name: '', email: '' });
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const tierColor = (tier: string) => {
    if (tier === 'PLATINUM') return 'bg-indigo-100 text-indigo-700';
    if (tier === 'GOLD') return 'bg-amber-100 text-amber-700';
    if (tier === 'SILVER') return 'bg-gray-200 text-gray-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-10 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary">CRM & Fidélité</h1>
          <p className="text-gray-400 text-sm">Gestion des Clients — {currentSite}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-primary-dk transition-all">
          + Nouveau Profil Client
        </button>
      </header>

      {/* Loyalty Tiers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['PLATINUM', 'GOLD', 'SILVER', 'STANDARD'].map(tier => {
          const count = clients.filter(c => c.tier === tier).length;
          const colors: Record<string, string> = {
            PLATINUM: 'bg-indigo-600', GOLD: 'bg-amber-500',
            SILVER: 'bg-gray-400', STANDARD: 'bg-sand'
          };
          return (
            <div key={tier} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tier}</p>
                <h4 className="text-xl font-bold text-primary">{count} Clients</h4>
              </div>
              <div className={`w-3 h-10 rounded-full ${colors[tier]}`} />
            </div>
          );
        })}
      </div>

      {/* Guest Directory */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-4">👥</p>
            <p className="font-bold">Aucun client enregistré.</p>
            <p className="text-sm">Utilisez le bouton &quot;+ Nouveau Profil Client&quot; pour commencer.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-10 py-5">Client</th>
                <th className="px-10 py-5">Niveau</th>
                <th className="px-10 py-5 text-center">Séjours</th>
                <th className="px-10 py-5">Total Dépensé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients.map(guest => (
                <tr key={guest.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center font-bold text-primary text-xs uppercase">
                        {guest.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="font-bold text-primary">{guest.name}</p>
                        <p className="text-[10px] text-gray-400">{guest.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tierColor(guest.tier)}`}>
                      {guest.tier}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center text-primary font-bold">{guest.visits}</td>
                  <td className="px-10 py-6 font-mono font-bold text-primary">{guest.spent.toLocaleString()} FCFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button>
            <h2 className="text-2xl font-bold font-title text-primary mb-6">Nouveau Profil Client</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nom Complet</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Koffi Marc" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Adresse Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Ex: koffi@email.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:bg-primary-dk transition-all disabled:opacity-60">
                {submitting ? 'Enregistrement...' : 'Enregistrer le Profil'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
