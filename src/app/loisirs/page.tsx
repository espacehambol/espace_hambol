import type { Metadata } from 'next';
import LoisirsClient from './LoisirsClient';

export const metadata: Metadata = {
  title: "Détente, Piscine & Loisirs",
  description: "Profitez de nos activités à Espace Hambol : Piscine adulte & enfant, bar VIP immergé, terrain de Maracana (football), pétanque, lits balinais, massages traditionnels et balades en forêt guidées.",
  openGraph: {
    title: "Détente, Piscine & Loisirs | Espace Hambol",
    description: "Échappez à la routine avec notre offre de loisirs complète pour adultes et enfants à Azaguié et Yopougon.",
  }
};

export default function LoisirsPage() {
  return <LoisirsClient />;
}
