'use client';

export default function ClientFinancePage() {
  const transactions = [
    { id: 'TX-491', date: '2026-05-15', desc: 'Acompte Séjour RH-4920', amount: 30000, status: 'PAID' },
    { id: 'TX-482', date: '2026-05-04', desc: 'Dîner Gastronomique', amount: 15400, status: 'PAID' },
    { id: 'TX-473', date: '2026-05-02', desc: 'Bar & Lounge', amount: 8500, status: 'PAID' },
  ];

  return (
    <div className="space-y-12">
      <header>
         <h1 className="text-4xl font-title font-bold text-primary italic">Mes Paiements & Factures</h1>
         <p className="text-gray-400 text-sm font-medium">Historique de vos transactions et documents fiscaux</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-2">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Dépensé</p>
           <h3 className="text-3xl font-bold text-primary">2,450,000 <span className="text-sm font-normal">FCFA</span></h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-2">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acomptes Versés</p>
           <h3 className="text-3xl font-bold text-green-600">30,000 <span className="text-sm font-normal">FCFA</span></h3>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-2">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Solde en Attente</p>
           <h3 className="text-3xl font-bold text-accent">0 <span className="text-sm font-normal">FCFA</span></h3>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-[#1A1208] text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-bold italic">Historique des Transactions</h3>
              <button className="text-[10px] font-bold text-accent tracking-widest uppercase underline">Filtrer par année</button>
           </div>
           
           <div className="space-y-4">
              {transactions.map(tx => (
                <div key={tx.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all gap-4">
                   <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-xl">💳</div>
                      <div>
                         <p className="font-bold">{tx.desc}</p>
                         <p className="text-[10px] text-white/40 uppercase tracking-widest">{tx.date} • {tx.id}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-8">
                      <p className="font-bold">{tx.amount.toLocaleString()} F</p>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                        Facture PDF
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Payment methods */}
      <section className="bg-sand/30 p-10 rounded-[3rem] border border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="space-y-2 text-center md:text-left">
            <h3 className="font-bold text-primary">Moyens de paiement enregistrés</h3>
            <p className="text-xs text-gray-500">Gérez vos cartes et comptes Mobile Money pour un check-out express.</p>
         </div>
         <button className="px-8 py-3 bg-primary text-white rounded-2xl font-bold text-xs shadow-xl hover:bg-primary-dk transition-all">
           + Ajouter un moyen
         </button>
      </section>
    </div>
  );
}
