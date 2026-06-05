'use client';

import { useState } from 'react';

const CONCIERGE_SERVICES = [
  { id: '1', name: 'Room Service', icon: '🍽️', desc: 'Commandez vos plats préférés en chambre' },
  { id: '2', name: 'Blanchisserie', icon: '🧺', desc: 'Nettoyage et repassage de vos vêtements' },
  { id: '3', name: 'Spa & Détente', icon: '💆', desc: 'Réservez un massage ou un soin' },
  { id: '4', name: 'Navette Aéroport', icon: '🚐', desc: 'Planifiez vos transferts' },
  { id: '5', name: 'Réveil Express', icon: '⏰', desc: 'Demandez un appel matinal' },
  { id: '6', name: 'Maintenance', icon: '🛠️', desc: 'Signalez un problème technique' },
];

export default function ConciergePage() {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-4xl font-title font-bold text-primary italic">Conciergerie Digitale</h1>
           <p className="text-gray-400 text-sm font-medium">À votre service, 24h/24 et 7j/7</p>
        </div>
        <div className="flex bg-sand rounded-xl p-1 border border-primary/5">
           <button 
             onClick={() => setActiveTab('services')}
             className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'services' ? 'bg-primary text-white shadow-lg' : 'text-primary/60'}`}
           >
             Services
           </button>
           <button 
             onClick={() => setActiveTab('chat')}
             className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'chat' ? 'bg-primary text-white shadow-lg' : 'text-primary/60'}`}
           >
             Chat Direct
           </button>
        </div>
      </header>

      {activeTab === 'services' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {CONCIERGE_SERVICES.map((s) => (
             <div key={s.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 hover:border-accent hover:shadow-2xl transition-all cursor-pointer group">
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{s.icon}</div>
                <h3 className="text-xl font-bold text-primary mb-3">{s.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-8">{s.desc}</p>
                <button className="w-full py-4 rounded-2xl bg-sand text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                  Commander
                </button>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[600px]">
           {/* Chat Header */}
           <div className="p-8 bg-[#1A1208] text-white flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-xl">🛎️</div>
              <div>
                 <h4 className="font-bold">Réception — Espace Hambol</h4>
                 <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">En ligne</p>
              </div>
           </div>
           
           {/* Chat Messages */}
           <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-sand/10">
              <div className="flex gap-4">
                 <div className="min-w-[40px] h-10 rounded-full bg-accent flex items-center justify-center text-xs">🛎️</div>
                 <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-md">
                    <p className="text-sm text-gray-800">Bonjour Monsieur Gbagbo, comment puis-je vous aider aujourd&apos;hui ?</p>
                    <span className="text-[8px] text-gray-400 mt-2 block uppercase font-bold">11:42</span>
                 </div>
              </div>
           </div>

           {/* Chat Input */}
           <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-4">
                 <input 
                   type="text" 
                   placeholder="Écrivez votre message ici..." 
                   className="flex-1 bg-sand/30 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-accent outline-none"
                 />
                 <button className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                   ➔
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Instant Requests FAQ style */}
      <section className="space-y-6">
         <h3 className="text-xl font-bold text-primary italic">Demandes Instantanées</h3>
         <div className="flex flex-wrap gap-4">
            {['Demande de Serviettes', 'Réapprovisionner le Minibar', 'Late Check-out Request', 'Taxi pour 19h', 'Besoin d&apos;oreillers'].map((req, i) => (
              <button key={i} className="px-6 py-3 rounded-full border border-primary/10 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                {req}
              </button>
            ))}
         </div>
      </section>
    </div>
  );
}
