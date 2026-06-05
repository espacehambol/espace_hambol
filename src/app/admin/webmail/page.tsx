'use client';

import { useState } from 'react';
import { useSite } from '@/context/SiteContext';

export default function WebmailPage() {
  const { currentSite } = useSite();
  const [copied, setCopied] = useState(false);
  
  // L'URL de Hostinger avec le paramètre email pré-rempli si possible
  const email = currentSite === 'Azaguié' ? 'azaguie@espacehambol.com' : 'yopougon@espacehambol.com';
  const webmailUrl = `https://mail.hostinger.com/auth/login?_user=${encodeURIComponent(email)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up">
      {/* Header section with page title */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] text-accent font-bold uppercase tracking-widest bg-accent/10 px-3 py-1.5 rounded-full mb-3 inline-block">
            Site Actif : {currentSite}
          </span>
          <h1 className="font-title text-4xl font-bold text-primary">Webmail Professionnel</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez la correspondance et les réservations pour <span className="font-bold text-primary-dk">{email}</span>
          </p>
        </div>
        
        <a 
          href={webmailUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary-dk text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-primary/20 active:scale-95 text-sm shrink-0"
        >
          <span>🌐</span> Ouvrir le Webmail
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left/Middle Column: Primary CTA & Copy Interface */}
        <div className="md:col-span-2 bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 flex flex-col justify-between space-y-8 relative overflow-hidden group">
          {/* Subtle background decoration */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all duration-700" />
          
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl text-accent animate-float">
              📧
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">Accès Sécurisé Hostinger</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Par mesure de sécurité renforcée contre le piratage, l&apos;interface de messagerie Hostinger bloque l&apos;intégration directe (via iframe) au sein d&apos;autres applications. 
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Pour vous connecter de manière sécurisée, ouvrez l&apos;interface officielle dans un nouvel onglet en utilisant votre adresse professionnelle ci-dessous.
              </p>
            </div>

            {/* Email copying widget */}
            <div className="bg-sand/40 border border-gray-100 p-4 rounded-2xl flex items-center justify-between gap-4">
              <div className="truncate">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Votre adresse e-mail</p>
                <p className="font-mono text-sm font-bold text-primary-dk truncate select-all">{email}</p>
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  copied 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-black shadow-sm active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <span>✓</span> Copié !
                  </>
                ) : (
                  <>
                    <span>📋</span> Copier l&apos;adresse
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="text-base">🔒</span>
              <span>Connexion cryptée SSL/TLS</span>
            </div>
            <a
              href={webmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-primary-dk font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-md active:scale-95"
            >
              Se connecter maintenant ↗
            </a>
          </div>
        </div>

        {/* Right Column: Server Settings / Technical config */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <h3 className="font-title text-xl font-bold text-primary">Configuration Client</h3>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              Utilisez ces paramètres pour configurer cette boîte de messagerie sur vos appareils (Outlook, Apple Mail, Android, iPhone, etc.) :
            </p>

            <div className="space-y-4 pt-2">
              <div className="border-b border-gray-50 pb-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Serveur Entrant (IMAP)</p>
                <p className="font-mono text-xs font-bold text-primary-dk mt-0.5">imap.hostinger.com</p>
                <p className="text-[10px] text-gray-500">Port : <span className="font-bold">993</span> (SSL/TLS)</p>
              </div>

              <div className="border-b border-gray-50 pb-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Serveur Sortant (SMTP)</p>
                <p className="font-mono text-xs font-bold text-primary-dk mt-0.5">smtp.hostinger.com</p>
                <p className="text-[10px] text-gray-500">Port : <span className="font-bold">465</span> (SSL/TLS)</p>
              </div>

              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nom d&apos;utilisateur</p>
                <p className="font-mono text-xs font-bold text-primary-dk truncate mt-0.5">{email}</p>
              </div>
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-2xl border border-accent/10">
            <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1">💡 Astuce de Connexion</p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Pour une connexion plus rapide, copiez votre adresse e-mail ci-contre avant de cliquer sur ouvrir. Il ne vous restera plus qu&apos;à la coller et entrer votre mot de passe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
