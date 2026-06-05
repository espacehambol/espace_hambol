'use client';

const RESERVATIONS = [
  { id: 'RH-4920', site: 'Azaguié', room: 'Suite Horizon', dates: '15 Juin - 18 Juin 2026', status: 'CONFIRMED', price: 60000 },
  { id: 'RH-3810', site: 'Yopougon', room: 'Chambre VIP', dates: '02 Mai - 04 Mai 2026', status: 'COMPLETED', price: 45000 },
  { id: 'RH-2250', site: 'Azaguié', room: 'Bungalow Nature', dates: '10 Mars - 12 Mars 2026', status: 'COMPLETED', price: 30000 },
];

export default function ReservationsPage() {
  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-4xl font-title font-bold text-primary italic">Mes Réservations</h1>
           <p className="text-gray-400 text-sm font-medium">Historique et gestion de vos séjours</p>
        </div>
        <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-primary-dk transition-all">
          + Nouvelle Réservation
        </button>
      </header>

      {/* Booking List */}
      <div className="space-y-8">
        {RESERVATIONS.map((res) => (
          <div key={res.id} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 hover:shadow-2xl transition-all group">
             <div className="flex gap-8 items-center">
                <div className="w-20 h-20 bg-sand rounded-[2rem] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏨</div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-accent uppercase tracking-widest">{res.site}</p>
                   <h3 className="text-xl font-bold text-primary">{res.room}</h3>
                   <p className="text-sm text-gray-500 font-medium">{res.dates}</p>
                </div>
             </div>

             <div className="flex items-center gap-10">
                <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Montant</p>
                   <p className="font-bold text-primary">{res.price.toLocaleString()} F</p>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Statut</p>
                   <span className={`px-3 py-1 rounded text-[10px] font-bold ${
                     res.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                   }`}>
                     {res.status === 'CONFIRMED' ? 'CONFIRMÉ' : 'TERMINÉ'}
                   </span>
                </div>
                <div className="flex gap-2">
                   <button className="p-4 bg-sand/30 rounded-2xl hover:bg-primary hover:text-white transition-all" title="Télécharger PDF">📄</button>
                   <button className="p-4 bg-sand/30 rounded-2xl hover:bg-primary hover:text-white transition-all" title="Gérer">⚙️</button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Calendar Placeholder */}
      <div className="bg-[#1A1208] text-white p-12 rounded-[4rem] text-center space-y-6">
         <h3 className="text-2xl font-bold font-title">Vue Calendrier</h3>
         <div className="grid grid-cols-7 gap-4 opacity-20">
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className="aspect-square border border-white/20 rounded-xl flex items-center justify-center text-xs">{i+1}</div>
            ))}
         </div>
         <p className="text-white/40 text-xs uppercase font-bold tracking-widest">Fonctionnalité en cours de déploiement</p>
      </div>
    </div>
  );
}
