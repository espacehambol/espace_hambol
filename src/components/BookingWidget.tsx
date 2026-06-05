'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingWidget() {
  const router = useRouter();
  const [tab, setTab] = useState<'rooms' | 'food' | 'activities' | 'events'>('rooms');
  const [dateTime, setDateTime] = useState('');
  const [guests, setGuests] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'rooms') {
      // Pass the selected arrival time to the reservation page
      router.push(`/reservations?arrival=${dateTime}&guests=${guests}`);
    } else if (tab === 'food') {
      router.push('/contact?subject=reservation');
    } else if (tab === 'activities') {
      router.push('/contact?subject=other');
    } else {
      router.push('/contact?subject=event');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl mx-auto relative z-30 border border-[#D4956A]/20">
      <div className="flex border-b border-gray-100 p-2 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'rooms', label: 'Hébergement' },
          { id: 'food', label: 'Restaurant' },
          { id: 'activities', label: 'Loisirs' },
          { id: 'events', label: 'Événements' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold transition-all text-sm ${
              tab === t.id ? 'bg-[#8B3A1A] text-white shadow-md' : 'text-[#6B5C4E] hover:bg-[#F5EDE0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end bg-[#Fdfbf7]">
        <div className="w-full md:w-1/2">
          <label className="block text-xs font-bold text-[#8B3A1A] uppercase tracking-wider mb-2">
            {tab === 'rooms' ? 'Arrivée (Date & Heure)' : 'Date souhaitée'}
          </label>
          <input 
            type={tab === 'rooms' ? "datetime-local" : "date"}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A]" 
            value={dateTime}
            onChange={e => setDateTime(e.target.value)}
          />
        </div>

        <div className="w-full md:w-1/4">
          <label className="block text-xs font-bold text-[#8B3A1A] uppercase tracking-wider mb-2">Personnes</label>
          <select 
            value={guests}
            onChange={e => setGuests(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A]"
          >
            {[1,2,3,4,5,'6+'].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'personne' : 'personnes'}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="w-full md:w-auto bg-[#2E7D1E] hover:bg-[#1A4F0A] text-white px-10 py-3 rounded-xl font-bold shadow-xl transition-all">
          Vérifier les disponibilités
        </button>  
      </form>
    </div>
  );
}

