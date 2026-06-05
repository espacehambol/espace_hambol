import type { Metadata } from 'next';
import ChambresClient from './ChambresClient';

export const metadata: Metadata = {
  title: "Chambres & Suites de Luxe",
  description: "Séjournez dans nos chambres tout confort et suites VIP à Yopougon Ananeraie, ou nos bungalows avec terrasse piscine à Azaguié Ahoua. Climatisation, Canal+ et Wifi inclus.",
  openGraph: {
    title: "Chambres & Suites de Luxe | Espace Hambol",
    description: "Réservez vos nuitées ou séjours de repos dans nos chambres de standing. Profitez de tout le confort moderne au meilleur tarif.",
  }
};

export default function ChambresPage() {
  return <ChambresClient />;
}
