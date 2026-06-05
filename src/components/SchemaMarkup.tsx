import React from 'react';

export default function SchemaMarkup() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": "https://espacehambol.com/#hotel-yopougon",
        "name": "Espace Hambol Yopougon",
        "description": "L'Élégance à Ananeraie. Hôtel de standing à Yopougon avec chambres VIP, bar climatisé et terrasse panoramique au 4ème étage.",
        "url": "https://espacehambol.com",
        "telephone": "+2250140267534",
        "image": "https://espacehambol.com/logo.jpg",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Ananeraie, Yopougon",
          "addressLocality": "Abidjan",
          "addressRegion": "Yopougon",
          "addressCountry": "CI"
        },
        "priceRange": "10000FCFA - 25000FCFA"
      },
      {
        "@type": "Hotel",
        "@id": "https://espacehambol.com/#hotel-azaguie",
        "name": "Espace Hambol Azaguié",
        "description": "L'Évasion Naturelle à Ahoua. Bungalows de charme avec piscine, espaces événementiels et terrains de sport (Maracana).",
        "url": "https://espacehambol.com",
        "telephone": "+2250787179566",
        "image": "https://espacehambol.com/logo.jpg",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Ahoua, Azaguié",
          "addressLocality": "Azaguié",
          "addressRegion": "Azaguié",
          "addressCountry": "CI"
        },
        "priceRange": "10000FCFA - 35000FCFA"
      },
      {
        "@type": "Restaurant",
        "@id": "https://espacehambol.com/#restaurant",
        "name": "Restaurant Espace Hambol",
        "description": "Cuisine gastronomique ivoirienne et internationale. Spécialités braisées (carpes, pintades, poulets) et soupe de carpe (kédjénou).",
        "url": "https://espacehambol.com/restaurant",
        "telephone": "+2250140267534",
        "servesCuisine": "Ivoirienne, Africaine, Internationale",
        "priceRange": "2500FCFA - 12000FCFA",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Ananeraie, Yopougon",
          "addressLocality": "Abidjan",
          "addressRegion": "Yopougon",
          "addressCountry": "CI"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
