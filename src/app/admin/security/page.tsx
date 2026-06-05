'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface AgentUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  staffProfile: { position: string } | null;
}

const POSITION_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  ADMIN: 'Direction',
  MANAGER: 'Manager',
  RECEPTION: 'Réception',
  CHEF_CUISINIER: 'Chef Cuisinier',
  HOUSEKEEPING: 'Gouvernance',
  STAFF: 'Agent',
};

export default function SecurityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Correcting the check: Allow both ADMIN and SUPER_ADMIN
    const pos = user?.position;
    if (pos !== 'ADMIN' && pos !== 'SUPER_ADMIN') {
      router.push('/admin');
      return;
    }
    fetch('/api/admin/agents')
      .then(r => r.json())
      .then(data => { setAgents(data.agents || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (newPassword.length < 6) {
      setStatus({ type: 'error', message: 'Minimum 6 caractères requis.' });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: selectedUserId, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: data.message });
        setNewPassword('');
        setConfirmPassword('');
        setSelectedUserId(null);
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur inconnue.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Erreur de connexion.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedUserId);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-title text-4xl font-bold text-primary">Sécurité & Gestion des Accès</h1>
        <p className="text-[#6B5C4E] mt-1">Gérez les mots de passe de tous les agents du système.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Agents List */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-bold text-lg text-primary">Liste des Agents</h2>
            <p className="text-xs text-gray-400 mt-1">Cliquez sur un agent pour modifier son mot de passe</p>
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-400">Chargement...</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* Current user at top */}
              {user && (
                <button
                  onClick={() => setSelectedUserId(user.id || null)}
                  className={`w-full flex items-center gap-4 p-5 text-left hover:bg-[#F5EDE0]/50 transition-all ${selectedUserId === user.id ? 'bg-[#8B3A1A]/5 border-l-4 border-[#8B3A1A]' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-primary uppercase shrink-0">
                    {user.name?.[0] || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary">{user.name} <span className="text-accent text-xs">(Moi)</span></p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className="text-xs font-bold bg-accent/10 text-accent px-3 py-1 rounded-full shrink-0">ADMIN</span>
                </button>
              )}
              {agents.filter(a => a.id !== user?.id).map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedUserId(agent.id)}
                  className={`w-full flex items-center gap-4 p-5 text-left hover:bg-[#F5EDE0]/50 transition-all ${selectedUserId === agent.id ? 'bg-[#8B3A1A]/5 border-l-4 border-[#8B3A1A]' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary uppercase shrink-0">
                    {(agent.name || agent.email)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary">{agent.name || 'Inconnu'}</p>
                    <p className="text-xs text-gray-400 truncate">{agent.email}</p>
                  </div>
                  <span className="text-xs font-bold bg-primary/5 text-primary/60 px-3 py-1 rounded-full shrink-0">
                    {POSITION_LABELS[agent.staffProfile?.position || ''] || agent.role}
                  </span>
                </button>
              ))}
              {agents.length === 0 && !loading && (
                <div className="p-10 text-center text-gray-400">Aucun autre agent trouvé.</div>
              )}
            </div>
          )}
        </div>

        {/* Password Change Form */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          {!selectedUserId ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
              <div className="text-6xl mb-4">🔐</div>
              <p className="font-bold text-lg">Sélectionnez un Agent</p>
              <p className="text-sm mt-2">Choisissez un agent dans la liste pour modifier son mot de passe.</p>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-[#F5EDE0] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl uppercase">
                  {(selectedAgent?.name || selectedAgent?.email || 'A')[0]}
                </div>
                <div>
                  <p className="font-bold text-primary">{selectedAgent?.name || 'Agent'}</p>
                  <p className="text-xs text-gray-500">{selectedAgent?.email}</p>
                </div>
              </div>

              <h2 className="font-title text-2xl font-bold text-primary">Nouveau Mot de Passe</h2>

              <div>
                <label className="block text-xs font-bold text-[#8B3A1A] uppercase tracking-wider mb-2">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8B3A1A] uppercase tracking-wider mb-2">Confirmer le Mot de Passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A]"
                />
              </div>

              {status && (
                <div className={`p-4 rounded-xl text-sm font-bold ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {status.message}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => { setSelectedUserId(null); setNewPassword(''); setConfirmPassword(''); setStatus(null); }}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] py-3 rounded-xl bg-[#8B3A1A] text-white font-bold hover:bg-[#6e2d14] transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Mise à jour...' : 'Changer le Mot de Passe'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
