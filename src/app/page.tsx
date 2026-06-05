import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: "Espace Hambol - Restaurant, Hébergement & Loisirs à Yopougon & Azaguié",
  description: "Découvrez l'Espace Hambol. Hôtel de standing à Yopougon Ananeraie et bungalows de charme avec piscine à Azaguié Ahoua. Profitez de nos spécialités culinaires locales.",
  openGraph: {
    title: "Espace Hambol - Restaurant, Hébergement & Loisirs à Yopougon & Azaguié",
    description: "Hôtel et restaurant d'exception en Côte d'Ivoire. Découvrez nos suites confortables et nos espaces de loisirs en plein air.",
  }
};

export default function Home() {
  return <HomeClient />;
}
