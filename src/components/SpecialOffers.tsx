'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SpecialOffers() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 48,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Faux compte à rebours pour la rareté (démarre à 48h)
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + 48);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-[#1A1208] to-[#2A1D0E] relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Text and Offer */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full font-bold text-xs uppercase tracking-widest border border-red-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Dernière Minute
          </div>
          
          <h2 className="font-title text-4xl sm:text-5xl font-bold text-white leading-tight">
            Escapade Romantique <br/>
            <span className="text-[#D4956A] italic">-15% sur les Suites VIP</span>
          </h2>
          
          <p className="text-white/70 max-w-lg mx-auto md:mx-0 text-lg">
            Réservez un Séjour Complet (24h) ce week-end et profitez d'une réduction exclusive ainsi que d'un cocktail de bienvenue offert.
          </p>

          <Link href="/reservations" className="inline-block bg-white text-[#1A1208] px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl mt-4">
            Profiter de l'Offre
          </Link>
        </div>

        {/* Countdown Timer */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4 bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-2xl">
          <p className="text-white/60 text-sm font-bold uppercase tracking-widest">L'offre expire dans :</p>
          <div className="flex items-center gap-4 text-white text-center">
            <div className="flex flex-col items-center">
              <span className="font-title text-5xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-widest text-accent mt-1">Heures</span>
            </div>
            <span className="text-3xl font-bold opacity-50 pb-5">:</span>
            <div className="flex flex-col items-center">
              <span className="font-title text-5xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-widest text-accent mt-1">Minutes</span>
            </div>
            <span className="text-3xl font-bold opacity-50 pb-5">:</span>
            <div className="flex flex-col items-center">
              <span className="font-title text-5xl font-bold text-red-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="text-xs uppercase tracking-widest text-red-400/70 mt-1">Secondes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
    </section>
  );
}
