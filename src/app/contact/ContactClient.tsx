'use client';

import { useSite } from "@/context/SiteContext";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

function ContactForm() {
  const { currentSite } = useSite();
  const searchParams = useSearchParams();
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const contactInfo = {
    'Azaguié': {
      phone: "+225 07 87 17 95 66",
      address: "Ahoua, Azaguié, Côte d'Ivoire",
      email: "azaguie@espacehambol.com",
      mapImage: "/images/azaguie/hero.jpg",
      description: "Notre sanctuaire naturel situé à Azaguié. Évadez-vous dans nos jardins luxuriants et profitez d'une tranquillité absolue.",
    },
    'Yopougon': {
      phone: "+225 01 40 26 75 34",
      address: "Ananeraie, Yopougon, Abidjan, Côte d'Ivoire",
      email: "yopougon@espacehambol.com",
      mapImage: "/images/yopougon/hero.jpg",
      description: "Le confort urbain par excellence. Retrouvez-nous au cœur de Yopougon pour vos séjours, détentes et soirées exclusives.",
    }
  };

  const currentInfo = contactInfo[currentSite as keyof typeof contactInfo];
  const defaultSubject = searchParams.get('subject') || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('loading');
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      site: currentSite,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setFormStatus('success');
        form.reset();
        setTimeout(() => setFormStatus('idle'), 5000);
      } else {
        setErrorMsg(result.error || 'Une erreur est survenue.');
        setFormStatus('error');
      }
    } catch {
      setErrorMsg('Erreur de connexion. Veuillez réessayer.');
      setFormStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Header */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <Image 
          src={currentInfo.mapImage} 
          alt="Contact Hero" 
          fill 
          className="object-cover brightness-50"
        />
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="font-title text-6xl font-bold mb-4 animate-fade-in-up">Contact & Réservations</h1>
          <p className="font-body text-xl tracking-widest uppercase opacity-80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Site Espace Hambol {currentSite}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-24 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Information */}
          <section className="space-y-12 animate-fade-in">
            <div>
              <h2 className="font-title text-4xl text-[#8B3A1A] mb-4 border-b-2 border-[#D4956A] pb-4 inline-block">Nous Contacter</h2>
              <p className="text-lg text-[#1A1208]/70 mt-6 leading-relaxed">
                {currentInfo.description}
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2E7D1E]/10 flex items-center justify-center flex-shrink-0 text-[#2E7D1E]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1208] text-lg">Adresse Physique</h3>
                  <p className="text-[#1A1208]/70 text-lg">{currentInfo.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#8B3A1A]/10 flex items-center justify-center flex-shrink-0 text-[#8B3A1A]">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.213-3.913-6.809-6.809l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1208] text-lg">Téléphone / WhatsApp</h3>
                  <p className="text-[#1A1208]/70 text-lg">{currentInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1208] text-lg">Email</h3>
                  <p className="text-[#1A1208]/70 text-lg">{currentInfo.email}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="bg-white p-10 rounded-[2rem] shadow-xl border border-[#D4956A]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#8B3A1A]/5 rounded-bl-full pointer-events-none" />
            
            <h2 className="font-title text-3xl text-[#1A1208] mb-8">Envoyer un Message</h2>
            
            {formStatus === 'success' ? (
              <div className="bg-[#2E7D1E]/10 border border-[#2E7D1E] text-[#2E7D1E] p-6 rounded-2xl flex flex-col items-center justify-center h-[350px] animate-fade-in text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-title font-bold text-2xl mb-2">Message Envoyé !</h3>
                <p>Notre équipe vous recontactera très prochainement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formStatus === 'error' && errorMsg && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block font-bold text-sm text-[#1A1208] mb-2">Nom Complet</label>
                  <input type="text" id="name" name="name" required className="w-full bg-[#FDFBF7] border border-[#D4956A]/30 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A] transition-colors" placeholder="Jean-Luc Dupont" />
                </div>
                <div>
                  <label htmlFor="email" className="block font-bold text-sm text-[#1A1208] mb-2">Adresse Email</label>
                  <input type="email" id="email" name="email" required className="w-full bg-[#FDFBF7] border border-[#D4956A]/30 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A] transition-colors" placeholder="jean.luc@exemple.com" />
                </div>
                <div>
                  <label htmlFor="subject" className="block font-bold text-sm text-[#1A1208] mb-2">Objet</label>
                  <select id="subject" name="subject" required defaultValue={defaultSubject} className="w-full bg-[#FDFBF7] border border-[#D4956A]/30 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A] transition-colors">
                    <option value="">Sélectionnez un sujet</option>
                    <option value="reservation">Demande de Réservation</option>
                    <option value="event">Organisation d&apos;Événement</option>
                    <option value="concierge">Service Conciergerie</option>
                    <option value="other">Autre demande</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block font-bold text-sm text-[#1A1208] mb-2">Votre Message</label>
                  <textarea id="message" name="message" rows={5} required className="w-full bg-[#FDFBF7] border border-[#D4956A]/30 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B3A1A] focus:ring-1 focus:ring-[#8B3A1A] transition-colors" placeholder="Comment pouvons-nous vous aider ?"></textarea>
                </div>
                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="w-full bg-[#8B3A1A] hover:bg-[#6e2d14] disabled:opacity-60 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
                >
                  {formStatus === 'loading' ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <span>Envoyer la Demande</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function ContactClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-[#8B3A1A] font-bold animate-pulse">Chargement...</div>
      </div>
    }>
      <ContactForm />
    </Suspense>
  );
}
