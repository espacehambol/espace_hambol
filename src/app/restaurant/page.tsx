import type { Metadata } from 'next';
import RestaurantClient from './RestaurantClient';

export const metadata: Metadata = {
  title: "Restaurant & Spécialités Culinaires",
  description: "Dégustez notre cuisine traditionnelle et internationale : Kédjénou de carpe mijoté, poissons braisés frais (carpes, Saint-Pierre), grillades ivoiriennes et boissons fraîches au restaurant Espace Hambol.",
  openGraph: {
    title: "Restaurant & Spécialités Culinaires | Espace Hambol",
    description: "Une aventure gastronomique unique. Découvrez la carte du jour et nos spécialités locales préparées par notre Chef.",
  }
};

export default function RestaurantPage() {
  return <RestaurantClient />;
}
