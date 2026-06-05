'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/context/SiteContext';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  clientName: string;
  date: string;
}

interface FinanceMetrics {
  revenue: number;
  expenses: number;
  netProfit: number;
  pending: number;
}

export default function FinancePage() {
  const { currentSite } = useSite();
  const [metrics, setMetrics] = useState<FinanceMetrics>({ revenue: 0, expenses: 0, netProfit: 0, pending: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'Entrée (Revenu)', amount: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/finance');
      const data = await res.json();
      
      // Ensure metrics always has the required properties to avoid .toLocaleString() crash
      setMetrics({
        revenue: data?.metrics?.revenue ?? 0,
        expenses: data?.metrics?.expenses ?? 0,
        netProfit: data?.metrics?.netProfit ?? 0,
        pending: data?.metrics?.pending ?? 0
      });
      
      setTransactions(data.transactions || []);
    } catch (e) {
      console.error('Fetch finance data error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({ type: 'Entrée (Revenu)', amount: '', description: '' });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const kpiCards = [
    { label: "Chiffre d'Affaires", value: metrics.revenue, color: 'text-primary', trend: null },
    { label: 'Dépenses Opérationnelles', value: metrics.expenses, color: 'text-red-500', trend: null },
    { label: 'Bénéfice Net', value: metrics.netProfit, color: 'text-green-500', trend: null },
  ];

  return (
    <div className="space-y-10 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary">Comptabilité & Finance</h1>
          <p className="text-gray-400 text-sm">Gestion financière OHADA — {currentSite}</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:bg-sand transition-all">
            Exporter (Excel)
          </button>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg hover:bg-primary-dk transition-all">
            + Nouvelle Saisie
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {kpiCards.map((m, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-3 relative overflow-hidden group">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
                <div className={`text-3xl font-bold ${m.color}`}>
                  {m.value.toLocaleString()} <span className="text-sm">FCFA</span>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-sand/10 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
              </div>
            ))}
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h3 className="text-xl font-bold text-primary">Journal des Transactions</h3>
            </div>
            {transactions.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-4xl mb-4">📊</p>
                <p className="font-bold">Aucune transaction enregistrée.</p>
                <p className="text-sm">Utilisez &quot;+ Nouvelle Saisie&quot; pour commencer.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FA] text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-10 py-5">Description</th>
                    <th className="px-10 py-5">Type</th>
                    <th className="px-10 py-5">Montant</th>
                    <th className="px-10 py-5">Statut</th>
                    <th className="px-10 py-5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-10 py-6 font-bold text-primary">{t.description}</td>
                      <td className="px-10 py-6 text-gray-500 text-xs">{t.type}</td>
                      <td className="px-10 py-6">
                        <span className={`font-bold text-sm ${t.type === 'INVOICE' ? 'text-green-600' : 'text-red-500'}`}>
                          {t.type === 'INVOICE' ? '+' : '-'}{t.amount.toLocaleString()} FCFA
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${t.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-gray-400 text-xs">{new Date(t.date).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button>
            <h2 className="text-2xl font-bold font-title text-primary mb-6">Nouvelle Écriture</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Type de saisie</label>
                <select title="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none">
                  <option>Entrée (Revenu)</option>
                  <option>Sortie (Dépense)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Montant (FCFA)</label>
                <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="Ex: 50000" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description</label>
                <input type="text" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Ex: Paiement Fournisseur" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:bg-primary-dk transition-all disabled:opacity-60">
                {submitting ? 'Enregistrement...' : 'Enregistrer la Saisie'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
