'use client';

import { useSite } from '@/context/SiteContext';

const LEISURE_ACTIVITIES = [
  { id: '1', name: 'Tournoi de Maracana', site: 'Azaguié', price: 0, icon: '⚽' },
  { id: '2', name: 'Piscine Extérieure (Accès Jour)', site: 'Azaguié', price: 5000, icon: '🏊' },
  { id: '3', name: 'Dégustation Vin de Palme', site: 'Azaguié', price: 15000, icon: '🍶' },
  { id: '4', name: 'Bar Climatisé VIP', site: 'Yopougon', price: 0, icon: '🍸' },
  { id: '5', name: 'Terrasse Panoramique 4è Étage', site: 'Yopougon', price: 0, icon: '🌇' },
];

export default function LeisurePage() {
  const { currentSite } = useSite();

  return (
    <div className="space-y-12">
      <header>
         <h1 className="text-4xl font-title font-bold text-primary italic">Loisirs & Gastronomie</h1>
         <p className="text-gray-400 text-sm font-medium">Réservez vos expériences uniques à {currentSite}</p>
      </header>

      {/* Menu of the day */}
      <section className="bg-[#1A1208] text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="space-y-6 flex-1">
               <span className="px-4 py-1 bg-accent text-black text-[10px] font-bold rounded-full uppercase tracking-widest italic animate-pulse">Spécial du Chef</span>
               <h2 className="text-5xl font-bold font-title leading-tight">Le Plateau de Carpes Braisées de l&apos;Ananeraie</h2>
               <p className="text-white/60 text-sm leading-relaxed max-w-lg italic">
                 Accompagné d&apos;alloco croustillant, d&apos;attiéké frais et de notre sauce pimentée secrète.
               </p>
               <button className="px-10 py-4 bg-accent text-black rounded-full font-bold text-sm hover:scale-105 transition-all">
                 Commander Maintenant
               </button>
            </div>
            <div className="w-64 h-64 bg-sand/20 rounded-full flex items-center justify-center text-8xl group-hover:rotate-12 transition-transform duration-700">🥘</div>
         </div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/60 to-transparent" />
      </section>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {LEISURE_ACTIVITIES.filter(a => a.site === currentSite).map((a) => (
           <div key={a.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6 hover:border-accent hover:shadow-2xl transition-all group">
              <div className="text-5xl group-hover:scale-110 transition-transform">{a.icon}</div>
              <div className="space-y-1">
                 <h4 className="text-xl font-bold text-primary">{a.name}</h4>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{a.site}</p>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                 <span className="font-bold text-primary">{a.price === 0 ? 'Gratuit' : `${a.price.toLocaleString()} F`}</span>
                 <button className="px-6 py-2 rounded-xl bg-sand text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                   Réserver
                 </button>
              </div>
           </div>
         ))}
      </div>

      {/* Past Experiences */}
      <section className="space-y-6">
         <h3 className="text-xl font-bold text-primary italic">Vos délices passés</h3>
         <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[1, 2, 3].map(i => (
              <div key={i} className="min-w-[200px] h-32 bg-sand/20 rounded-[2rem] border border-primary/5 flex items-center justify-center text-4xl grayscale hover:grayscale-0 transition-all cursor-pointer opacity-50 hover:opacity-100">
                🍽️
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
