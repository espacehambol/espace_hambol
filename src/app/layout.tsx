import type { Metadata } from "next";
import { Playfair_Display, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/context/SiteContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import VirtualConcierge from "@/components/VirtualConcierge";
import SocialMediaFloat from "@/components/SocialMediaFloat";
import GlobalPopup from "@/components/GlobalPopup";
import FloatingAd from "@/components/FloatingAd";
import SchemaMarkup from "@/components/SchemaMarkup";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-title",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://espacehambol.com"),
  title: {
    default: "Espace Hambol - Hôtel, Restaurant & Loisirs (Azaguié & Yopougon)",
    template: "%s | Espace Hambol"
  },
  description: "Espace Hambol vous accueille à Yopougon Ananeraie et Azaguié Ahoua. Chambres & suites de standing, cuisine gastronomique ivoirienne (kédjénou, braisés), piscine de détente, espaces mariage et séminaires.",
  keywords: ["hôtel côte d'ivoire", "hôtel yopougon", "hôtel azaguié", "restaurant abidjan", "kédjénou de carpe", "piscine azaguié", "salle de mariage yopougon", "hébergement abidjan"],
  icons: {
    icon: "/favicon.jpg",
  },
  openGraph: {
    title: "Espace Hambol - Hôtel, Restaurant & Loisirs",
    description: "Découvrez l'élégance hospitalière de l'Espace Hambol à Yopougon Ananeraie et Azaguié Ahoua. Piscine, gastronomie locale raffinée et hébergements de luxe.",
    url: "https://espacehambol.com",
    siteName: "Espace Hambol",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
        alt: "Logo Espace Hambol",
      }
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Espace Hambol - Hôtel, Restaurant & Loisirs",
    description: "Évasion naturelle à Azaguié et élégance urbaine à Yopougon. Suites VIP, restaurant de spécialités locales et piscine.",
    images: ["/logo.jpg"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <SchemaMarkup />
        <SiteProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <VirtualConcierge />
            <SocialMediaFloat />
            <GlobalPopup />
            <FloatingAd />
          </AuthProvider>
        </SiteProvider>
      </body>
    </html>
  );
}
