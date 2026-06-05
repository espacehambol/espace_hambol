'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/context/SiteContext';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minThreshold: number;
  site: { name: string };
}

export default function InventoryPage() {
  const { currentSite } = useSite();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'F&B', quantity: '', unit: 'unités', minThreshold: '5' });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      setInventory(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const filteredItems = filter === 'All' ? inventory : inventory.filter(i => i.category === filter);
  const lowStockCount = inventory.filter(i => i.quantity <= i.minThreshold).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: parseFloat(form.quantity),
          minThreshold: parseFloat(form.minThreshold),
          siteId: 'auto', // handled by API
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({ name: '', category: 'F&B', quantity: '', unit: 'unités', minThreshold: '5' });
        fetchInventory();
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
          <h1 className="text-3xl font-title font-bold text-primary">Gestion des Stocks</h1>
          <p className="text-gray-400 text-sm">Inventaire centralisé — {currentSite}</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-primary-dk transition-all">
          + Entrée de Stock
        </button>
      </header>

      {/* Alert Banner */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border-l-8 border-amber-400 p-6 rounded-2xl flex items-center gap-6">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">⚠️</div>
          <div>
            <h4 className="font-bold text-amber-800">Alertes Stock Critique</h4>
            <p className="text-amber-700/80 text-sm">{lowStockCount} article{lowStockCount > 1 ? 's' : ''} en dessous du seuil de sécurité. Veuillez réapprovisionner.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {['All', 'F&B', 'Linge', 'Gouvernance', 'Boissons'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              filter === cat ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-100 hover:border-accent'
            }`}
          >
            {cat === 'All' ? 'Tous les produits' : cat}
          </button>
        ))}
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-4">📦</p>
            <p className="font-bold">Aucun article en stock.</p>
            <p className="text-sm">Cliquez sur &quot;+ Entrée de Stock&quot; pour commencer.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] border-b border-gray-100 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-10 py-5">Article</th>
                <th className="px-10 py-5">Catégorie</th>
                <th className="px-10 py-5 text-center">Quantité</th>
                <th className="px-10 py-5">Unité</th>
                <th className="px-10 py-5">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map(item => {
                const isLow = item.quantity <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-6"><span className="font-bold text-primary">{item.name}</span></td>
                    <td className="px-10 py-6"><span className="text-[10px] p-1 px-2 bg-gray-100 rounded font-bold uppercase">{item.category}</span></td>
                    <td className="px-10 py-6 text-center">
                      <span className={`text-lg font-bold ${isLow ? 'text-red-500' : 'text-primary'}`}>{item.quantity}</span>
                    </td>
                    <td className="px-10 py-6 text-gray-400">{item.unit}</td>
                    <td className="px-10 py-6">
                      <span className={`p-1 px-3 rounded-full text-[10px] font-bold ${isLow ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isLow ? 'CRITIQUE' : 'OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">✕</button>
            <h2 className="text-2xl font-bold font-title text-primary mb-6">Entrée de Stock</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Article</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Riz Parfumé" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Quantité</label>
                  <input type="number" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="Ex: 25" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Unité</label>
                  <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="Ex: kg" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Catégorie</label>
                <select title="Catégorie" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none">
                  <option>F&B</option>
                  <option>Linge</option>
                  <option>Gouvernance</option>
                  <option>Boissons</option>
                </select>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:bg-primary-dk transition-all disabled:opacity-60">
                {submitting ? 'Enregistrement...' : 'Ajouter au Stock'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
