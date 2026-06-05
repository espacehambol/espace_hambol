import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: "Contact & Localisation",
  description: "Contactez Espace Hambol Azaguié (+225 07 87 17 95 66) ou Espace Hambol Yopougon (+225 01 40 26 75 34) pour vos demandes d'informations, devis d'événements, ou services conciergerie.",
  openGraph: {
    title: "Contact & Localisation | Espace Hambol",
    description: "Besoin d'informations ? Envoyez-nous un message directement ou contactez nos équipes par téléphone et WhatsApp.",
  }
};

export default function ContactPage() {
  return <ContactClient />;
}
