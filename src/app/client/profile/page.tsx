'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || 'Membre Hambol',
    email: user?.email || '',
    phone: '+225 07 00 00 00 00',
    nationality: 'Ivoirien(ne)',
    language: 'Français',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profil mis à jour avec succès !');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-title font-bold text-[#2A241F]">Mon Profil</h1>
          <p className="text-[#6B5C4E] mt-2">Gérez vos informations personnelles et préférences.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[#1A1208] text-white rounded-xl font-bold text-sm hover:bg-[#2A241F] transition-all"
          >
            Modifier le Profil
          </button>
        )}
      </div>

      {/* Avatar Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#2E7D1E]/10 flex items-center gap-8">
        <div className="w-24 h-24 rounded-2xl bg-[#F5F0EB] flex items-center justify-center text-4xl font-bold text-[#8B3A1A] shadow-inner">
          {form.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="font-title text-2xl font-bold text-[#2A241F]">{form.name}</h2>
          <p className="text-[#6B5C4E] text-sm mt-1">{form.email}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold tracking-widest uppercase">
            Membre Gold ✦
          </span>
        </div>
      </div>

      {/* Info Form */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#2E7D1E]/10">
        <h3 className="font-title text-xl font-bold text-[#2A241F] mb-6">Informations Personnelles</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Nom Complet', key: 'name' },
            { label: 'Adresse Email', key: 'email', type: 'email' },
            { label: 'Téléphone', key: 'phone', type: 'tel' },
            { label: 'Nationalité', key: 'nationality' },
            { label: 'Langue Préférée', key: 'language' },
          ].map(({ label, key, type = 'text' }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-[#6B5C4E] mb-1 uppercase tracking-widest">
                {label}
              </label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                disabled={!isEditing}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 text-sm border transition-all outline-none ${
                  isEditing
                    ? 'border-[#2E7D1E]/40 bg-white focus:ring-2 focus:ring-[#2E7D1E]/20'
                    : 'border-transparent bg-[#F5F0EB] text-[#2A241F] cursor-default'
                }`}
              />
            </div>
          ))}

          {isEditing && (
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 py-4 bg-[#1A1208] text-white font-bold rounded-xl hover:bg-[#2A241F] transition-all"
              >
                Sauvegarder
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-4 border border-[#2A241F]/20 text-[#2A241F] font-bold rounded-xl hover:bg-[#F5F0EB] transition-all"
              >
                Annuler
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#2E7D1E]/10">
        <h3 className="font-title text-xl font-bold text-[#2A241F] mb-6">Sécurité</h3>
        <button
          onClick={() => alert('Fonctionnalité de changement de mot de passe (à venir).')}
          className="w-full py-4 border border-[#2A241F]/20 text-[#2A241F] font-bold rounded-xl hover:bg-[#F5F0EB] transition-all text-sm"
        >
          🔒 Changer le mot de passe
        </button>
      </div>
    </div>
  );
}
