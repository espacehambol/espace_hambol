'use client';

import { useSite } from "@/context/SiteContext";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoisirsClient() {
  const { currentSite } = useSite();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pool');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (currentSite === 'Yopougon') {
      router.replace('/');
    }
  }, [currentSite, router]);

  const heroSlides = {
    'Azaguié': ["/images/azaguie/outdoor_slide_1.jpg", "/images/azaguie/outdoor_slide_2.jpg", "/images/azaguie/outdoor_slide_3.jpg"],
    'Yopougon': ["/images/yopougon/hero.jpg", "/images/yopougon/lavage_parking.jpg", "/images/yopougon/nightlife.jpg"]
  };

  const currentSlides = heroSlides[currentSite as keyof typeof heroSlides];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  const leisureData = {
    'pool': [
      { name: 'Piscine Adulte (Grand Bain)', price: '2000 F / adulte', category: 'Aqua', site: 'Azaguié', img: '/images/azaguie/outdoor_slide_1.jpg' },
      { name: 'Piscine Enfant', price: '3000 F / enfant', category: 'Aqua', site: 'Azaguié', img: '/images/azaguie/outdoor_slide_2.jpg' },
      { name: 'Bar VIP Immergé', price: 'Accès Libre', category: 'Aqua', site: 'Azaguié', img: '/images/azaguie/outdoor_slide_3.jpg' },
    ],
    'sports': [
      { name: 'Maracana (Football)', price: '15000 F / heure', category: 'Sport', site: 'all', img: '/images/azaguie/outdoor_1.jpg' },
      { name: 'Pétanque', price: 'Gratuit pour les résidents', category: 'Sport', site: 'all', img: '/images/azaguie/outdoor_2.jpg' },
      { name: 'Espace Jeux de Société (Ludo, Awalé, Dames)', price: 'Gratuit', category: 'Animation', site: 'all', img: '/images/yopougon/hero.jpg' },
    ],
    'relax': [
      { name: 'Espace Détente & Lits Balinais', price: '10000 F / jour', category: 'Relaxation', site: 'Azaguié', img: '/images/azaguie/bungalow.jpg' },
      { name: 'Massages Traditionnels', price: '25000 F / séance', category: 'Bien-être', site: 'Azaguié', img: '/images/azaguie/room.jpg' },
      { name: 'Balade en Forêt Guidée', price: '5000 F', category: 'Nature', site: 'Azaguié', img: '/images/azaguie/outdoor_3.jpg' },
      { name: 'Soirée Night Club VIP', price: 'Sur Réservation', category: 'Divertissement', site: 'Yopougon', img: '/images/yopougon/nightlife.jpg' },
    ],
    'events': [
      { name: 'Sorties Détente & Pique-nique', price: 'Tarifs Groupes / Devis', category: 'Détente', site: 'Azaguié', img: '/images/azaguie/outdoor_slide_2.jpg' },
      { name: 'Team Building (Cohésion d\'Équipe)', price: 'Sur Devis', category: 'Entreprise', site: 'Azaguié', img: '/images/azaguie/team_building.jpg' },
      { name: 'Séminaires d\'Entreprise au Vert', price: 'Sur Devis', category: 'Professionnel', site: 'Azaguié', img: '/images/azaguie/seminaire_vert.jpg' },
      { name: 'Mariages en Plein Air au Bord du Lac', price: 'Sur Devis', category: 'Événementiel', site: 'Azaguié', img: '/images/azaguie/lake_wedding.jpg' },
    ],
    'adventure': [
      { name: 'Écotourisme & Biodécouverte', price: 'Visites Guidées', category: 'Nature', site: 'Azaguié', img: '/images/azaguie/greanland.png' },
      { name: 'Trekking & Randonnées Pédestres', price: '5000 F / personne', category: 'Aventure', site: 'Azaguié', img: '/images/azaguie/trekking_forest.jpg' },
    ],
    'kids': [
      { name: 'Aire de Jeux Extérieure', price: 'Gratuit', category: 'Enfants', site: 'all', img: '/images/azaguie/outdoor_1.jpg' },
      { name: 'Animations Découvertes', price: 'Sur Programme', category: 'Enfants', site: 'Azaguié', img: '/images/azaguie/outdoor_2.jpg' },
    ]
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Dynamic Slide Hero Header */}
      <div className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        {currentSlides.map((src, index) => (
          <Image 
            key={src}
            src={src} 
            alt="Loisirs Hero Slide" 
            fill 
            className={`object-cover brightness-50 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="font-title text-6xl font-bold mb-4 animate-fade-in-up">Détente & Loisirs</h1>
          <p className="font-body text-xl tracking-widest uppercase opacity-80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>Les Activités de {currentSite}</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-20 px-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            onClick={() => setActiveTab('pool')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'pool' ? 'bg-[#8B3A1A] text-white shadow-xl scale-105' : 'bg-white text-[#8B3A1A] hover:bg-[#FDFBF7] border border-[#D4956A]/20'}`}
          >
            Piscine & Aqua
          </button>
          <button 
            onClick={() => setActiveTab('sports')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'sports' ? 'bg-[#8B3A1A] text-white shadow-xl scale-105' : 'bg-white text-[#8B3A1A] hover:bg-[#FDFBF7] border border-[#D4956A]/20'}`}
          >
            Sports & Jeux
          </button>
          <button 
            onClick={() => setActiveTab('relax')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'relax' ? 'bg-[#8B3A1A] text-white shadow-xl scale-105' : 'bg-white text-[#8B3A1A] hover:bg-[#FDFBF7] border border-[#D4956A]/20'}`}
          >
            Détente & Spécialités
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'events' ? 'bg-[#8B3A1A] text-white shadow-xl scale-105' : 'bg-white text-[#8B3A1A] hover:bg-[#FDFBF7] border border-[#D4956A]/20'}`}
          >
            Événements & Séminaires
          </button>
          <button 
            onClick={() => setActiveTab('adventure')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'adventure' ? 'bg-[#8B3A1A] text-white shadow-xl scale-105' : 'bg-white text-[#8B3A1A] hover:bg-[#FDFBF7] border border-[#D4956A]/20'}`}
          >
            Nature & Aventure
          </button>
          <button 
            onClick={() => setActiveTab('kids')}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'kids' ? 'bg-[#8B3A1A] text-white shadow-xl scale-105' : 'bg-white text-[#8B3A1A] hover:bg-[#FDFBF7] border border-[#D4956A]/20'}`}
          >
            Espace Enfants
          </button>
        </div>

        {/* Content with Illustration Cards */}
        <div className="animate-fade-in max-w-5xl mx-auto space-y-8">
          <h2 className="font-title text-4xl text-[#8B3A1A] border-b-2 border-[#D4956A] pb-4">
            {activeTab === 'pool' ? 'Complexe Aquatique' : 
             activeTab === 'sports' ? 'Défis & Cohésion' : 
             activeTab === 'relax' ? 'Moments de Grâce' : 
             activeTab === 'events' ? 'Événements & Séminaires' : 
             activeTab === 'adventure' ? 'Nature & Écotourisme' : 
             'Activités Juniors'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {leisureData[activeTab as keyof typeof leisureData]
                .filter(item => item.site === 'all' || item.site === currentSite)
                .map((item, id) => (
                  <div key={id} className="relative flex flex-col justify-end h-80 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer">
                    <Image 
                      src={item.img} 
                      alt={item.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1208]/90 via-[#1A1208]/40 to-transparent" />
                    
                    <div className="relative z-10 p-8 flex flex-col justify-end h-full">
                      <p className="inline-block text-[10px] text-accent font-bold tracking-[0.2em] mb-2 uppercase">{item.category}</p>
                      <h3 className="font-title text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors">{item.name}</h3>
                      <div className="w-full flex justify-between items-center mt-auto border-t border-white/20 pt-4">
                         <span className="text-white/80 text-sm font-medium">Tarif</span>
                         <span className="font-bold text-accent bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                           {item.price}
                         </span>
                      </div>
                    </div>
                  </div>
              ))}
          </div>

          {leisureData[activeTab as keyof typeof leisureData].filter(item => item.site === 'all' || item.site === currentSite).length === 0 && (
            <p className="text-center text-gray-400 italic py-12">
              Cette activité n&apos;est pas disponible sur le site de {currentSite}.
            </p>
          )}

        </div>

        <div className="mt-32 text-center p-16 bg-[#1A1208] text-[#FDFBF7] rounded-[4rem] relative overflow-hidden">
           <h2 className="font-title text-5xl font-bold mb-8 italic">Réserver une Activité</h2>
           <p className="max-w-2xl mx-auto mb-10 opacity-70">Privatisez un espace ou réservez un terrain pour vos événements sportifs et vos journées d&apos;entreprise.</p>
           <Link href="/reservations?type=loisirs" className="inline-block bg-[#8B3A1A] text-white px-12 py-5 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-3xl">
             Voir les Disponibilités
           </Link>
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32" />
        </div>
      </main>
    </div>
  );
}
