'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/context/SiteContext';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  staffProfile: { position: string } | null;
}

export default function HRPage() {
  const { currentSite } = useSite();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', position: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      const data = await res.json();
      setStaff(data.agents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({ name: '', email: '', position: '' });
        fetchStaff();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary">Ressources Humaines</h1>
          <p className="text-gray-400 text-sm">Gestion des Équipes — {currentSite}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-primary-dk transition-all">
          + Ajouter un Employé
        </button>
      </header>

      {/* Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl">👥</div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Effectif</p>
            <h4 className="text-2xl font-bold text-primary">{staff.length} Agents</h4>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center text-3xl">🔑</div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Admins</p>
            <h4 className="text-2xl font-bold text-primary">{staff.filter(s => s.role === 'ADMIN').length}</h4>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-3xl">✅</div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400">Staff</p>
            <h4 className="text-2xl font-bold text-primary">{staff.filter(s => s.role === 'STAFF').length}</h4>
          </div>
        </div>
      </div>

      {/* Staff Directory */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-10 py-5">Employé</th>
                <th className="px-10 py-5">Poste</th>
                <th className="px-10 py-5">Rôle</th>
                <th className="px-10 py-5">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.length === 0 ? (
                <tr><td colSpan={4} className="px-10 py-16 text-center text-gray-400">Aucun employé enregistré.</td></tr>
              ) : staff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-[10px] font-bold text-primary">
                        {(member.name || '?').charAt(0)}
                      </div>
                      <span className="font-bold text-primary">{member.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-gray-500">{member.staffProfile?.position || '—'}</td>
                  <td className="px-10 py-6">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${member.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-gray-400 text-xs">{member.email}</td>
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
            <h2 className="text-2xl font-bold font-title text-primary mb-6">Ajouter un Employé</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nom Complet</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Kouassi Konan" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Ex: k.konan@hambol.com" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Poste</label>
                <input required value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="Ex: Réceptionniste" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:bg-primary-dk transition-all disabled:opacity-60">
                {submitting ? 'Enregistrement...' : "Enregistrer l'Employé"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
