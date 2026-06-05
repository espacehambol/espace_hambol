'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSite } from '@/context/SiteContext';
import Image from 'next/image';

interface DishComponent {
  id: string;
  name: string;
  type: string;
  optional: boolean;
}

interface Dish {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  image: string | null;
  isActive: boolean;
  siteId: string;
  components: DishComponent[];
}

const CATEGORIES = ['Signature', 'Terroir', 'Tradition', 'L Excellence', 'Dessert', 'Boisson', 'Bières', 'Sucreries', 'Softs', 'Vins'];
const COMPONENT_TYPES = [
  { value: 'PROTEIN',  label: '🍗 Protéine',  color: 'bg-red-100 text-red-700' },
  { value: 'GARNISH',  label: '🌿 Garniture',  color: 'bg-green-100 text-green-700' },
  { value: 'SAUCE',    label: '🥣 Sauce',      color: 'bg-yellow-100 text-yellow-700' },
  { value: 'OPTION',   label: '✨ Option',     color: 'bg-purple-100 text-purple-700' },
];

const typeStyle = (type: string) =>
  COMPONENT_TYPES.find(t => t.value === type)?.color ?? 'bg-gray-100 text-gray-600';
const typeLabel = (type: string) =>
  COMPONENT_TYPES.find(t => t.value === type)?.label ?? type;

const emptyForm = { name: '', category: 'Signature', price: '', image: '', description: '', isActive: true };

export default function GastronomyAdmin() {
  const { currentSite } = useSite();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modale
  const [editDish, setEditDish] = useState<Dish | null>(null);    // null = création
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Composant inline
  const [newComp, setNewComp] = useState({ name: '', type: 'GARNISH', optional: false });
  const [addingComp, setAddingComp] = useState(false);

  const siteId = currentSite === 'Azaguié' ? 'azaguie' : 'yopougon';

  const fetchDishes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/menu?siteId=${siteId}`);
      const data = await res.json();
      setDishes(data.dishes ?? []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [siteId]);

  useEffect(() => { fetchDishes(); }, [fetchDishes]);

  // ── Ouvrir modale ──────────────────────────────────────────────────
  const openCreate = () => {
    setEditDish(null);
    setForm(emptyForm);
    setNewComp({ name: '', type: 'GARNISH', optional: false });
    setIsModalOpen(true);
  };

  const openEdit = (dish: Dish) => {
    setEditDish(dish);
    setForm({
      name: dish.name,
      category: dish.category,
      price: dish.price ? String(dish.price) : '',
      image: dish.image ?? '',
      description: dish.description ?? '',
      isActive: dish.isActive,
    });
    setNewComp({ name: '', type: 'GARNISH', optional: false });
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditDish(null); };

  // ── Sauvegarder plat ──────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editDish ? 'PUT' : 'POST';
      const body = editDish
        ? { ...form, id: editDish.id }
        : { ...form, siteId };

      const res = await fetch('/api/admin/menu', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        // Mettre à jour la liste localement
        if (editDish) {
          setDishes(prev => prev.map(d => d.id === editDish.id ? data.dish : d));
          setEditDish(data.dish); // rafraîchir pour avoir les composants
        } else {
          setDishes(prev => [data.dish, ...prev]);
          closeModal();
        }
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // ── Supprimer plat ────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce plat définitivement ?')) return;
    const res = await fetch(`/api/admin/menu?id=${id}`, { method: 'DELETE' });
    if (res.ok) { setDishes(prev => prev.filter(d => d.id !== id)); closeModal(); }
  };

  // ── Ajouter composant ─────────────────────────────────────────────
  const handleAddComponent = async () => {
    if (!editDish || !newComp.name.trim()) return;
    setAddingComp(true);
    try {
      const res = await fetch('/api/admin/menu/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId: editDish.id, ...newComp }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated: Dish = { ...editDish, components: [...editDish.components, data.component] };
        setEditDish(updated);
        setDishes(prev => prev.map(d => d.id === editDish.id ? updated : d));
        setNewComp({ name: '', type: 'GARNISH', optional: false });
      }
    } catch (e) { console.error(e); }
    finally { setAddingComp(false); }
  };

  // ── Supprimer composant ───────────────────────────────────────────
  const handleDeleteComponent = async (compId: string) => {
    if (!editDish) return;
    const res = await fetch(`/api/admin/menu/components?id=${compId}`, { method: 'DELETE' });
    if (res.ok) {
      const updated: Dish = { ...editDish, components: editDish.components.filter(c => c.id !== compId) };
      setEditDish(updated);
      setDishes(prev => prev.map(d => d.id === editDish.id ? updated : d));
    }
  };

  // ── Upload Image ─────────────────────────────────────────────────
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image: data.url }));
      } else {
        alert("Erreur lors de l'upload de l'image.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary">Gestion Gastronomique</h1>
          <p className="text-gray-400 text-sm">Menus &amp; Carte du Restaurant — {currentSite}</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-[#6e2c12] transition-all"
        >
          + Ajouter un Plat
        </button>
      </header>

      {/* Tableau */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg">Menu Actuel</h3>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{dishes.length} Plats</span>
        </div>

        {isLoading ? (
          <div className="p-20 text-center text-gray-400">Chargement du menu...</div>
        ) : dishes.length === 0 ? (
          <div className="p-20 text-center text-gray-400 italic">Aucun plat configuré pour ce site.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                  <th className="px-8 py-4 font-bold">Plat</th>
                  <th className="px-8 py-4 font-bold">Catégorie</th>
                  <th className="px-8 py-4 font-bold">Prix</th>
                  <th className="px-8 py-4 font-bold">Composants</th>
                  <th className="px-8 py-4 font-bold">Statut</th>
                  <th className="px-8 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {dishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-[#FDF8F4] transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden relative flex-shrink-0">
                          <Image
                            src={dish.image || '/images/food/dish_default.png'}
                            alt={dish.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-primary">{dish.name}</p>
                          {dish.description && (
                            <p className="text-xs text-gray-400 max-w-[180px] truncate">{dish.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="px-3 py-1 bg-accent/10 text-accent text-[10px] font-bold rounded-full uppercase">
                        {dish.category}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-mono font-bold text-gray-500">
                      {dish.price ? `${dish.price.toLocaleString()} F` : 'Sur carte'}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-wrap gap-1">
                        {dish.components.length === 0 ? (
                          <span className="text-gray-300 text-xs italic">—</span>
                        ) : dish.components.slice(0, 3).map(c => (
                          <span key={c.id} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeStyle(c.type)}`}>
                            {c.name}
                          </span>
                        ))}
                        {dish.components.length > 3 && (
                          <span className="text-[10px] text-gray-400">+{dish.components.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`w-2 h-2 rounded-full inline-block mr-2 ${dish.isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-500">{dish.isActive ? 'Actif' : 'Masqué'}</span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button
                        onClick={() => openEdit(dish)}
                        className="bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all mr-2"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(dish.id)}
                        className="text-red-300 hover:text-red-600 font-bold text-xs px-2 py-2"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ MODALE ═══════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl my-8 relative">
            {/* Header modale */}
            <div className="flex justify-between items-center px-10 pt-10 pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold font-title text-primary">
                  {editDish ? 'Modifier le Plat' : 'Nouveau Plat'}
                </h2>
                {editDish && (
                  <p className="text-xs text-gray-400 mt-1">ID: {editDish.id.slice(0, 8)}…</p>
                )}
              </div>
              <button onClick={closeModal} className="text-gray-300 hover:text-red-500 text-2xl transition-colors">✕</button>
            </div>

            <div className="px-10 py-8 space-y-8">
              {/* ── Formulaire plat ────────────────────────────────── */}
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Nom du Plat *</label>
                  <input
                    type="text" required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Saint-Pierre Braisé"
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Description</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Courte description du plat..."
                    className="w-full border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-accent outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Catégorie</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Prix (FCFA)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="Ex: 5000"
                      className="w-full border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Image du Plat</label>
                  
                  <div className="flex gap-6 items-start">
                    {/* Preview */}
                    <div className="w-32 h-32 rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden relative shrink-0 shadow-inner">
                      <Image
                        src={form.image || '/images/food/dish_default.png'}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="relative">
                        <input
                          type="file"
                          id="dish-image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <label
                          htmlFor="dish-image-upload"
                          className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                            uploading ? 'bg-gray-50 border-gray-200' : 'bg-accent/5 border-accent/20 hover:border-accent hover:bg-accent/10'
                          }`}
                        >
                          <span className="text-xl">📷</span>
                          <span className="text-sm font-bold text-primary">
                            {uploading ? 'Envoi...' : 'Téléverser depuis cet appareil'}
                          </span>
                        </label>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs font-mono">URL</span>
                        </div>
                        <input
                          type="text"
                          value={form.image}
                          onChange={e => setForm({ ...form, image: e.target.value })}
                          placeholder="/images/food/plat.png"
                          className="w-full border border-gray-200 rounded-2xl pl-12 pr-5 py-2.5 text-xs focus:ring-2 focus:ring-accent outline-none font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 italic">
                        Les images sont sauvegardées dans <code>/public/uploads/menu/</code>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? 'bg-green-400' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-6' : ''}`} />
                  </button>
                  <span className="text-sm font-bold text-gray-600">
                    {form.isActive ? 'Visible sur le menu public' : 'Masqué du menu public'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-[#6e2c12] transition-all shadow-lg active:scale-95 disabled:opacity-60"
                >
                  {saving ? 'Sauvegarde...' : editDish ? '✓ Mettre à Jour' : '✓ Créer le Plat'}
                </button>
              </form>

              {/* ── Section Composants (seulement en mode édition) ─── */}
              {editDish && (
                <div className="border-t border-gray-100 pt-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-primary text-lg">Composants du Plat</h3>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                      {editDish.components.length} composant{editDish.components.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Liste existante */}
                  {editDish.components.length > 0 && (
                    <div className="space-y-2">
                      {editDish.components.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl group">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeStyle(comp.type)}`}>
                              {typeLabel(comp.type)}
                            </span>
                            <span className="font-bold text-sm text-[#1A1208]">{comp.name}</span>
                            {comp.optional && (
                              <span className="text-[10px] text-gray-400 italic">(optionnel)</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteComponent(comp.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulaire ajout composant */}
                  <div className="bg-[#FDF8F4] border border-accent/10 rounded-2xl p-5 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ajouter un composant</p>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newComp.name}
                        onChange={e => setNewComp({ ...newComp, name: e.target.value })}
                        placeholder="Ex: Attiéké, Riz blanc..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddComponent(); } }}
                      />
                      <select
                        value={newComp.type}
                        onChange={e => setNewComp({ ...newComp, type: e.target.value })}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                      >
                        {COMPONENT_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newComp.optional}
                          onChange={e => setNewComp({ ...newComp, optional: e.target.checked })}
                          className="rounded"
                        />
                        Composant optionnel
                      </label>
                      <button
                        type="button"
                        onClick={handleAddComponent}
                        disabled={addingComp || !newComp.name.trim()}
                        className="bg-[#2E7D1E] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1a4f0a] transition-all disabled:opacity-50"
                      >
                        {addingComp ? '...' : '+ Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Supprimer le plat */}
              {editDish && (
                <div className="border-t border-red-50 pt-6">
                  <button
                    onClick={() => handleDelete(editDish.id)}
                    className="w-full text-red-400 hover:text-red-600 font-bold text-sm py-3 rounded-2xl hover:bg-red-50 transition-all"
                  >
                    Supprimer ce plat définitivement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
