'use client';

export default function LoyaltyPage() {
  const rewards = [
    { id: '1', title: 'Nuit Offerte - Suite Royale', cost: 5000, icon: '🌙' },
    { id: '2', title: 'Dîner Gastronomique (2 pers)', cost: 1500, icon: '🍷' },
    { id: '3', title: 'Soin Spa Signature', cost: 1200, icon: '💆' },
    { id: '4', title: 'Surclassement Garanti', cost: 800, icon: '⭐' },
  ];

  return (
    <div className="space-y-12">
      <header>
         <h1 className="text-4xl font-title font-bold text-primary italic">Programme de Fidélité</h1>
         <p className="text-gray-400 text-sm font-medium">Récompenser votre fidélité, séjour après séjour</p>
      </header>

      {/* Status Card */}
      <div className="bg-[#1A1208] text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <span className="px-4 py-1 bg-accent text-black text-[10px] font-bold rounded-full uppercase tracking-widest">Niveau Actuel</span>
               <h2 className="text-6xl font-bold font-title text-accent">GOLD</h2>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-white/40">
                     <span>Progression Platinum</span>
                     <span>75%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-accent" style={{ width: '75%' }} />
                  </div>
               </div>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Votre Solde</p>
               <span className="text-5xl font-bold">2,450 <span className="text-sm text-accent">PTS</span></span>
               <button className="mt-4 px-8 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-accent transition-all uppercase tracking-widest">
                 Parrainer un Ami
               </button>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Rewards Catalog */}
      <section className="space-y-8">
         <h3 className="text-2xl font-bold text-primary italic">Catalogue de Récompenses</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewards.map((r) => (
              <div key={r.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-xl transition-all cursor-pointer group">
                 <div className="text-4xl group-hover:rotate-12 transition-transform">{r.icon}</div>
                 <div>
                    <h4 className="font-bold text-primary text-sm">{r.title}</h4>
                    <p className="text-accent font-bold text-xs mt-1">{r.cost} Points</p>
                 </div>
                 <button className="w-full py-3 rounded-xl bg-sand text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                   Échanger
                 </button>
              </div>
            ))}
         </div>
      </section>

      {/* Benefits Tiers */}
      <section className="bg-sand/30 p-12 rounded-[4rem] border border-primary/5">
         <h3 className="text-xl font-bold text-primary mb-8 text-center italic">Vos Avantages Privilèges</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { tier: "Silver", color: "text-gray-400", perks: ["Check-in prioritaire", "Bouteille d'eau offerte"] },
              { tier: "Gold (Vous)", color: "text-accent", perks: ["Petit-déjeuner offert", "Surclassement (si dispo)", "Late check-out"] },
              { tier: "Platinum", color: "text-indigo-400", perks: ["Accès Lounge VIP", "Transfert Aéroport Offert", "Concierge dédié"] }
            ].map((t, i) => (
              <div key={i} className={`space-y-4 ${t.tier.includes('Vous') ? 'scale-110' : 'opacity-50'}`}>
                 <h4 className={`font-bold uppercase tracking-widest text-xs ${t.color}`}>{t.tier}</h4>
                 <ul className="space-y-3">
                    {t.perks.map((p, j) => (
                      <li key={j} className="text-xs text-gray-600 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                         {p}
                      </li>
                    ))}
                 </ul>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
