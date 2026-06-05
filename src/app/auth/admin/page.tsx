'use client';

import { useState } from 'react';
import { useAuth, StaffPosition } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.user.email, data.user.role, data.user.position as StaffPosition, data.user.name, data.user.id);
      } else {
        setError(data.error || 'Identifiants incorrects');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1208] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('/logo.jpg')] bg-[length:200px] opacity-[0.03] grayscale pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl space-y-8 animate-fade-in">
        <header className="text-center space-y-2">
           <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white font-bold uppercase tracking-widest text-[10px] mb-4 transition-colors">
             ← Retour au Site Public
           </Link>
           <h1 className="text-3xl font-title font-bold text-white tracking-tight">Hambol HMS</h1>
           <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Portail Administration</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Identifiant Personnel</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                placeholder="agent@hambol.com"
                required
              />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-4">Clé de Sécurité</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                placeholder="••••••••"
                required
              />
           </div>
           {error && (
             <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center py-3 px-6 rounded-2xl font-bold">
               {error}
             </div>
           )}
           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-accent hover:bg-yellow-600 text-black font-bold py-4 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
           >
             {loading ? 'Vérification...' : 'Accéder au Management'}
           </button>
        </form>

        <footer className="text-center">
           <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
             Système de Gestion Centralisé — Azaguié & Yopougon
           </p>
        </footer>
      </div>
    </div>
  );
}
