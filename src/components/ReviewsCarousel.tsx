'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/context/SiteContext';

const DEFAULT_REVIEWS = [
  // AVIS AZAGUIÉ
  {
    id: 1,
    name: "Marc K.",
    site: "Azaguié",
    text: "Un cadre exceptionnel et apaisant. La piscine est magnifique et le personnel aux petits soins. Idéal pour s'échapper du bruit d'Abidjan le week-end.",
    rating: 5
  },
  {
    id: 3,
    name: "Jean-Luc T.",
    site: "Azaguié",
    text: "Nous avons célébré notre mariage au bord du lac. L'organisation était parfaite, le domaine est somptueux. Merci à toute l'équipe de l'Espace Hambol.",
    rating: 5
  },
  {
    id: 5,
    name: "Didier Z.",
    site: "Azaguié",
    text: "Les bungalows sont spacieux et se fondent parfaitement dans la nature. Le poisson braisé du restaurant est probablement le meilleur de la région.",
    rating: 5
  },
  {
    id: 6,
    name: "Aline Y.",
    site: "Azaguié",
    text: "Le dépaysement total ! À peine arrivée, on se sent apaisée par la verdure et les bambous. Les enfants ont adoré la grande piscine.",
    rating: 5
  },
  {
    id: 7,
    name: "Cédric B.",
    site: "Azaguié",
    text: "L'espace est immense, parfait pour une retraite ou un séminaire d'entreprise. L'équipe est discrète et très professionnelle.",
    rating: 5
  },
  {
    id: 8,
    name: "Nina F.",
    site: "Azaguié",
    text: "Séjour reposant dans un bungalow propre et charmant. Mention spéciale pour la carpe braisée accompagnée d'alloco, un pur régal.",
    rating: 4
  },
  {
    id: 9,
    name: "Koffi M.",
    site: "Azaguié",
    text: "C'est l'endroit parfait pour fuir le stress d'Abidjan. L'air est pur, on y dort tellement bien. Je recommande vivement pour les couples.",
    rating: 5
  },

  // AVIS YOPOUGON
  {
    id: 2,
    name: "Awa D.",
    site: "Yopougon",
    text: "Le Kédjénou de poulet était incroyablement bon ! La chambre VIP est très propre avec une belle décoration. Je reviendrai sans hésiter.",
    rating: 5
  },
  {
    id: 4,
    name: "Sarah M.",
    site: "Yopougon",
    text: "Très bon hôtel en plein Yopougon. Le bar lounge offre une ambiance feutrée et les cocktails sont délicieux. Service très professionnel.",
    rating: 4
  },
  {
    id: 10,
    name: "Eric S.",
    site: "Yopougon",
    text: "Un endroit très discret et propre. Le personnel à l'accueil est souriant et le room-service est super rapide. Idéal pour se reposer.",
    rating: 5
  },
  {
    id: 11,
    name: "Patricia L.",
    site: "Yopougon",
    text: "Le bar VIP est génial, la musique n'est pas trop forte et on s'entend parler. L'endroit parfait pour un afterwork entre amis ou collègues.",
    rating: 5
  },
  {
    id: 12,
    name: "Stéphane O.",
    site: "Yopougon",
    text: "J'ai passé un très bon séjour. Le service de lavage auto pendant que je prenais mon repas est un très gros plus. Bravo à l'équipe !",
    rating: 5
  },
  {
    id: 13,
    name: "Bintou K.",
    site: "Yopougon",
    text: "Chambre spacieuse et lit extrêmement confortable. La climatisation fonctionne parfaitement. Une vraie suite VIP.",
    rating: 5
  },
  {
    id: 14,
    name: "Alexandre G.",
    site: "Yopougon",
    text: "Très pratique car situé en plein Yopougon Ananeraie, mais avec un calme impressionnant une fois à l'intérieur. Je suis un client fidèle.",
    rating: 5
  }
];

export default function ReviewsCarousel() {
  const { currentSite } = useSite();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dbReviews, setDbReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setDbReviews(data);
          }
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  // Use DB reviews if available, otherwise fallback to defaults
  const activeReviews = dbReviews.length > 0 ? [...dbReviews, ...DEFAULT_REVIEWS] : DEFAULT_REVIEWS;

  // Filtrer les avis en fonction du site sélectionné
  const filteredReviews = activeReviews.filter(review => review.site === currentSite);

  // S'assurer que l'index courant est toujours valide après un changement de site
  useEffect(() => {
    setCurrentIndex(0);
  }, [currentSite]);

  useEffect(() => {
    if (filteredReviews.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredReviews.length);
    }, 5000); // Défilement automatique toutes les 5 secondes

    return () => clearInterval(timer);
  }, [filteredReviews.length]);

  if (filteredReviews.length === 0) return null;

  return (
    <section className="py-24 bg-sand relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10">
        <span className="font-body text-accent font-bold tracking-widest uppercase text-xs">Livre d'Or</span>
        <h2 className="font-title text-4xl sm:text-5xl font-bold text-primary mt-4 mb-4">Ce que nos clients disent</h2>
        <p className="text-primary/60 max-w-xl mx-auto">La satisfaction de nos hôtes est notre plus belle récompense. Découvrez leurs expériences à Yopougon et Azaguié.</p>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Carousel Container */}
        <div className="relative h-[250px] sm:h-[200px] flex justify-center items-center">
          {filteredReviews.map((review, idx) => {
            // Calculer la position relative pour l'effet de carrousel 3D
            let offset = idx - currentIndex;
            if (offset < -2) offset += filteredReviews.length;
            if (offset > 2) offset -= filteredReviews.length;

            const isCenter = offset === 0;
            const isVisible = Math.abs(offset) <= 1;

            return (
              <div
                key={review.id}
                className={`absolute w-full max-w-2xl transition-all duration-700 ease-in-out ${
                  isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                  transform: `translateX(${offset * 100}%) scale(${isCenter ? 1 : 0.8})`,
                  zIndex: isCenter ? 20 : 10,
                  filter: isCenter ? 'blur(0px)' : 'blur(4px)'
                }}
              >
                <div className="bg-white p-8 rounded-3xl shadow-2xl border border-primary/5 text-center">
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="font-body text-lg text-primary italic mb-6">"{review.text}"</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {review.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-primary">{review.name}</p>
                      <p className="text-xs font-bold text-accent uppercase tracking-wider">Séjour à {review.site}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bullets Navigation */}
        <div className="flex justify-center gap-3 mt-12">
          {filteredReviews.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'bg-primary w-8' : 'bg-primary/20 hover:bg-primary/50'
              }`}
              aria-label={`Aller à l'avis ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
