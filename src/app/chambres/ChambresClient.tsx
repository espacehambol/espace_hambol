'use client';

import { useSite } from '@/context/SiteContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface RoomType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  image?: string;
  features?: string[];
}

export default function ChambresClient() {
  const { currentSite } = useSite();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allRooms: Record<string, RoomType[]> = {
      'Yopougon': [
        {
          id: 'y1',
          name: 'Chambre VIP Ananeraie',
          description: 'Luxe urbain avec literie premium, ambiance feutrée et décoration moderne. Salle de bain privative avec finitions haut de gamme.',
          price: 25000,
          capacity: 2,
          image: '/images/yopougon/rooms/room_1.png',
          features: ['Frigidaire', 'Climatisation', 'TV Canal+']
        },
        {
          id: 'y2',
          name: 'Chambre Premium avec Balcon',
          description: 'Profitez d\'une vue dégagée sur le quartier depuis votre balcon privé. Équipée d\'un téléphone interne et d\'un mini-bar.',
          price: 20000,
          capacity: 2,
          image: '/images/yopougon/rooms/room_2.png',
          features: ['Balcon Privé', 'Téléphone', 'Mini-frigo']
        },
        {
          id: 'y3',
          name: 'Classic Comfort',
          description: 'L\'équilibre parfait entre prix et confort pour vos séjours d\'affaires ou de détente à Yopougon.',
          price: 15000,
          capacity: 2,
          image: '/images/yopougon/rooms/room_3.png',
          features: ['Wi-Fi', 'Climatisation', 'Bureau']
        },
        {
          id: 'y4',
          name: 'Chambre Supérieure',
          description: 'Espace généreux et lumière naturelle au cœur d\'Ananeraie. Parfaite pour un séjour prolongé en toute quiétude.',
          price: 20000,
          capacity: 2,
          image: '/images/yopougon/rooms/room_4.png',
          features: ['Climatisation', 'TV', 'Grand Lit']
        }
      ],
      'Azaguié': [
        {
          id: 'a1',
          name: 'Bungalow Évasion Piscine',
          description: 'Accès direct à la piscine dans un cadre verdoyant. Literie artisanale et calme absolu pour une détente totale.',
          price: 25000,
          capacity: 2,
          image: '/images/azaguie/rooms/room_1.jpg',
          features: ['Accès Piscine', 'Terrasse', 'Calme']
        },
        {
          id: 'a2',
          name: 'Chambre Jardin Nature',
          description: 'Immersion au cœur de la palmeraie d\'Ahoua. Confort moderne dans un écrin de biodiversité.',
          price: 20000,
          capacity: 2,
          image: '/images/azaguie/rooms/room_2.jpg',
          features: ['Vue Jardin', 'Climatisation', 'TV']
        },
        {
          id: 'a3',
          name: 'Chambre Climatisée Ahoua',
          description: 'Fraîcheur et sérénité garanties. Idéale pour un repos profond après une journée de détente au bord de la piscine.',
          price: 15000,
          capacity: 2,
          image: '/images/azaguie/rooms/room_3.jpg',
          features: ['Climatisation', 'TV', 'Wi-Fi']
        },
        {
          id: 'a4',
          name: 'Chambre Familiale Ahoua',
          description: 'Spacieuse et fraîche, idéale pour les groupes et les familles venant profiter des terrains de sport.',
          price: 35000,
          capacity: 4,
          image: '/images/azaguie/rooms/room_3.jpg',
          features: ['4 Personnes', 'Grande Douche', 'Proche Sport']
        }
      ]
    };

    setRoomTypes(allRooms[currentSite] || allRooms['Yopougon']);
    setLoading(false);
  }, [currentSite]);

  return (
    <div className="bg-[#F5EDE0] min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center sm:text-left">
          <h2 className="font-body text-[#D4956A] font-bold tracking-[0.2em] uppercase text-sm mb-4">
            Hébergement - {currentSite}
          </h2>
          <h1 className="font-title text-4xl sm:text-6xl font-bold text-[#8B3A1A] mb-6">
            Nos Chambres & Suites
          </h1>
          <p className="font-body text-lg text-[#6B5C4E] max-w-2xl">
            {currentSite === 'Yopougon' 
              ? "L'élégance urbaine au cœur d'Ananeraie. Découvrez nos chambres VIP et profitez d'un confort moderne unique."
              : "L'évasion naturelle à Azaguié Ahoua. Détente au bord de la piscine et repos dans nos bungalows de charme."}
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B3A1A]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {roomTypes.map((room) => (
              <div key={room.id} className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-[#D4956A]/10 flex flex-col">
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={room.image || "/logo.jpg"}
                    alt={room.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 right-6 bg-[#8B3A1A] text-white px-6 py-2 rounded-full text-sm font-bold shadow-2xl backdrop-blur-sm border border-white/20">
                    {room.price.toLocaleString()} FCFA / nuit
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-title text-2xl font-bold text-[#8B3A1A] leading-tight">{room.name}</h3>
                  </div>
                  
                  <p className="text-[#6B5C4E] text-sm leading-relaxed mb-8 flex-1">
                    {room.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {room.features?.map((f) => (
                      <span key={f} className="text-[10px] font-bold uppercase tracking-widest bg-[#2E7D1E]/10 text-[#2E7D1E] px-3 py-1 rounded-md">
                        {f}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-auto">
                    <Link href="/reservations" className="flex-1 bg-[#8B3A1A] hover:bg-[#5C2410] text-white py-4 rounded-2xl font-bold text-center transition-all shadow-lg active:scale-95">
                      Réserver
                    </Link>
                    <button 
                      aria-label="Plus d'informations"
                      className="p-4 rounded-2xl border-2 border-[#D4956A]/30 text-[#8B3A1A] hover:bg-[#8B3A1A] hover:text-white transition-all group/btn"
                    >
                       <svg className="w-5 h-5 transition-transform group-hover/btn:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
