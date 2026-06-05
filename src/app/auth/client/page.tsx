'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function ClientLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, 'CLIENT');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 bg-[url('/images/azaguie/bungalow.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-[#1A1208]/80 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl space-y-8 animate-fade-in-up">
        <header className="text-center space-y-2">
           <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs mb-4">
             ← Retour à l&apos;accueil
           </Link>
           <h1 className="text-4xl font-title font-bold text-primary italic">Espace Client</h1>
           <p className="text-gray-400 text-sm">Bienvenue dans votre univers Palace</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-4">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-full px-6 py-4 text-primary focus:ring-2 focus:ring-accent transition-all"
                placeholder="jean-luc@hambol.com"
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
             className="w-full bg-primary hover:bg-primary-dk text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
           >
             Se Connecter
           </button>
        </form>

        <footer className="text-center">
           <p className="text-xs text-gray-400">
             Nouveau client ? <Link href="/auth/client/register" className="text-accent font-bold cursor-pointer hover:underline transition-all">Inscrivez-vous pour le programme de fidélité</Link>
           </p>
        </footer>
      </div>
    </div>
  );
}
