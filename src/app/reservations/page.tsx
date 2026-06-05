import type { Metadata } from 'next';
import ReservationsClient from './ReservationsClient';

export const metadata: Metadata = {
  title: "Réservations en Ligne",
  description: "Réservez votre séjour à Espace Hambol Azaguié ou Yopougon. Choisissez vos formules de nuitée, passage, long repos ou séjour 24h et réservez instantanément en ligne.",
  openGraph: {
    title: "Réservations en Ligne | Espace Hambol",
    description: "Planifiez votre séjour idéal. Réservez une chambre VIP ou un bungalow en quelques clics.",
  }
};

export default function ReservationPage() {
  return <ReservationsClient />;
}
