'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ClientRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 bg-[url('/images/azaguie/hero.jpg')] bg-cover bg-center relative">
        <div className="absolute inset-0 bg-[#1A1208]/80 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl text-center space-y-8 animate-fade-in">
           <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto">✓</div>
           <div className="space-y-4">
              <h2 className="text-3xl font-title font-bold text-primary">Bienvenue {name.split(' ')[0]} !</h2>
              <p className="text-gray-500">Votre compte a été créé et vous êtes désormais membre de notre programme de fidélité.</p>
           </div>
           <Link href="/auth/client" className="block w-full bg-primary text-white font-bold py-4 rounded-full shadow-lg hover:bg-primary-dk transition-all">
             Se Connecter
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 bg-[url('/images/azaguie/hero.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-[#1A1208]/80 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl space-y-8 animate-fade-in-up">
        <header className="text-center space-y-2">
           <Link href="/auth/client" className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs mb-4">
             ← Retour à la connexion
           </Link>
           <h1 className="text-4xl font-title font-bold text-primary italic">Rejoindre Hambol</h1>
           <p className="text-gray-400 text-sm">Inscrivez-vous au programme de fidélité</p>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Nom Complet</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-full px-6 py-4 text-primary focus:ring-2 focus:ring-accent transition-all"
                placeholder="Jean-Luc Dupont"
                required
              />
           </div>
           <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-full px-6 py-4 text-primary focus:ring-2 focus:ring-accent transition-all"
                placeholder="jean-luc@example.com"
                required
              />
           </div>
           <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Mot de passe</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-full px-6 py-4 text-primary focus:ring-2 focus:ring-accent transition-all"
                placeholder="••••••••"
                required
              />
           </div>
           <button 
             type="submit"
             disabled={loading}
             className="w-full bg-primary hover:bg-primary-dk text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
           >
             {loading ? 'Création...' : 'S\'inscrire'}
           </button>
        </form>
      </div>
    </div>
  );
}
