'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/context/SiteContext';
import Image from 'next/image';

export default function ClientDashboard() {
  const { currentSite } = useSite();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSite, setReviewSite] = useState(currentSite);
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewStatus('loading');
    try {
      const res = await fetch('/api/client/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment, site: reviewSite })
      });
      if (res.ok) {
        setReviewStatus('success');
        setReviewComment('');
      } else {
        setReviewStatus('error');
      }
    } catch {
      setReviewStatus('error');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/client/data');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full text-primary font-bold animate-pulse">Chargement de votre univers...</div>;
  if (!data) return <div className="p-12 text-center text-red-500 font-bold">Erreur de connexion. Veuillez réessayer.</div>;

  const guestName = data.name || 'Invité';
  const loyalty = data.loyalty || { points: 0, tier: 'STANDARD' };

  return (
    <div className="space-y-12">
      {/* Header / Welcome */}
      <header className="flex justify-between items-end">
        <div>
           <h4 className="text-accent font-bold tracking-[0.3em] uppercase text-xs mb-2">Heureux de vous revoir</h4>
           <h1 className="text-5xl font-title font-bold text-primary italic">Bonjour, {guestName.split(' ')[0]}</h1>
        </div>
        <div className="text-right">
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Météo à {currentSite}</p>
           <div className="flex items-center gap-3 justify-end">
              <span className="text-3xl">☀️</span>
              <span className="text-2xl font-bold text-primary">31°C</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Next Stay Card */}
        <div className="xl:col-span-2 relative h-[450px] rounded-[3.5rem] overflow-hidden shadow-2xl group">
           <Image 
             src={currentSite === 'Azaguié' ? '/images/azaguie/bungalow.jpg' : '/images/yopougon/rooms/room_3.jpg'} 
             alt="Prochain Séjour" 
             fill 
             className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000"
           />
           <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                 <span className="px-4 py-1 bg-accent text-black text-[10px] font-bold rounded-full uppercase tracking-widest">Confirmation #RH-4920</span>
                 <div className="text-right">
                    <p className="text-5xl font-bold font-title">J-12</p>
                    <p className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Avant votre arrivée</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="text-4xl font-bold font-title">Votre Suite Horizon vous attend</h3>
                 <div className="flex gap-8 text-sm font-medium text-white/80">
                    <div className="flex items-center gap-2"><span>📅</span> 15 Juin — 18 Juin</div>
                    <div className="flex items-center gap-2"><span>📍</span> Espace Hambol {currentSite}</div>
                 </div>
              </div>
           </div>
        </div>

        {/* Loyalty Jauge */}
        <div className="bg-[#1A1208] text-white p-10 rounded-[3.5rem] shadow-xl flex flex-col justify-between">
           {/* ... loyalty info (unchanged) ... */}
           <div>
              <h3 className="text-xl font-bold mb-8">Statut Fidélité</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-end">
                    <span className="text-3xl font-bold text-accent">{loyalty.tier}</span>
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{loyalty.points.toLocaleString()} Points</span>
                 </div>
                 <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-accent animate-pulse" style={{ width: `${Math.min((loyalty.points / 5000) * 100, 100)}%` }} />
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Privilèges Actuels</h4>
              <ul className="space-y-2 text-xs">
                 <li className="flex items-center gap-2">✨ Petit-déjeuner Signature offert</li>
                 <li className="flex items-center gap-2">✨ Accès VIP Piscine & Spa</li>
              </ul>
           </div>
        </div>
      </div>

      {/* Luxury Pre-Arrival Section */}
      <section className="bg-sand/30 rounded-[3.5rem] p-12 border border-accent/10">
         <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="max-w-xl">
               <h3 className="text-3xl font-title font-bold text-primary mb-4">Préparez votre arrivée</h3>
               <p className="text-gray-600 leading-relaxed">
                  Pour un accueil sans attente, remplissez vos informations de sécurité et personnalisez votre confort dès maintenant. Nos équipes s&apos;occuperont du reste.
               </p>
            </div>
            <div className="flex flex-wrap gap-4">
               <a href="/client/checkin" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-primary-dk transition-all flex items-center gap-3">
                  Check-in Digital 
                  <span className="px-2 py-0.5 bg-accent text-black text-[9px] rounded-full">À FAIRE</span>
               </a>
               <a href="/client/preferences" className="px-8 py-4 bg-white text-primary border border-primary/10 rounded-2xl font-bold text-sm shadow-sm hover:shadow-lg transition-all">
                  Mes Préférences
               </a>
            </div>
         </div>
      </section>

      {/* Recommended for you */}
      <section className="space-y-8">
         <h3 className="text-2xl font-bold text-primary flex items-center gap-4">
           Recommandé pour vous 
           <span className="h-[1px] flex-1 bg-primary/10" />
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Escapade Gastronomique", icon: "🍱", desc: "Menu dégustation 5 services" },
              { title: "Soin Spa Hibiscus", icon: "🌺", desc: "Détente absolue sous les tropiques" },
              { title: "Safari Azaguié", icon: "🐘", desc: "Explorez la faune locale" }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
                 <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                 <h4 className="font-bold text-primary mb-2">{item.title}</h4>
                 <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Testimonials Submission Form */}
      <section className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-12">
          <div className="md:w-1/3">
            <h3 className="text-3xl font-title font-bold text-primary mb-4">Votre avis compte</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Aidez-nous à nous améliorer ou partagez votre expérience avec les futurs visiteurs de l'Espace Hambol. 
              Votre témoignage sera visible dans notre Livre d'Or.
            </p>
          </div>
          
          <div className="md:w-2/3">
            {reviewStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 p-8 rounded-3xl flex flex-col items-center justify-center text-center animate-fade-in h-full">
                <span className="text-4xl mb-4">✨</span>
                <p className="font-bold text-lg mb-2">Merci pour votre témoignage !</p>
                <p className="text-sm">Il a été soumis avec succès et sera publié après validation par notre équipe.</p>
                <button onClick={() => setReviewStatus('idle')} className="mt-6 text-green-600 font-bold text-sm underline">Soumettre un autre avis</button>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Site concerné</label>
                    <select 
                      value={reviewSite} 
                      onChange={(e) => setReviewSite(e.target.value as "Azaguié" | "Yopougon")}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent text-primary font-bold"
                    >
                      <option value="Azaguié">Hambol Azaguié</option>
                      <option value="Yopougon">Hambol Yopougon</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Votre Note</label>
                    <div className="flex gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`w-8 h-8 focus:outline-none transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <svg fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Commentaire</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Partagez les détails de votre expérience..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-accent text-primary placeholder:text-gray-400 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-red-500">{reviewStatus === 'error' && 'Une erreur est survenue.'}</p>
                  <button 
                    type="submit" 
                    disabled={reviewStatus === 'loading' || !reviewComment.trim()}
                    className="bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-md hover:bg-primary-dk hover:shadow-xl transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {reviewStatus === 'loading' ? 'Envoi...' : 'Soumettre mon avis'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      </section>
    </div>
  );
}
