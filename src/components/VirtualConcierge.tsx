'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  type: 'bot' | 'user';
  text: string | React.ReactNode;
  options?: { label: string; action: () => void }[];
};

export default function VirtualConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Initialisation du chat
  useEffect(() => {
    const initialMessage: Message = {
      id: 'init',
      type: 'bot',
      text: "Bonjour et bienvenue à l'espace Hambole ! Je suis votre concierge virtuel. Comment puis-je rendre votre séjour exceptionnel ?",
      options: [
        { label: "🏨 Réserver une Chambre", action: () => handleAction("🏨 Réserver une Chambre", "RESERVER") },
        { label: "💰 Tarifs des Séjours", action: () => handleAction("💰 Tarifs des Séjours", "TARIFS") },
        { label: "🍽️ Voir la Gastronomie", action: () => handleAction("🍽️ Voir la Gastronomie", "GASTRONOMIE") },
        { label: "📍 Où êtes-vous situés ?", action: () => handleAction("📍 Où êtes-vous situés ?", "LOCATION") },
        { label: "🛎️ Contacter la Réception", action: () => handleAction("🛎️ Contacter la Réception", "CONTACT") }
      ]
    };
    setMessages([initialMessage]);
  }, []);

  const handleAction = (userText: string, actionType: string) => {
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: userText }]);

    // Réponse du bot simulée avec un petit délai
    setTimeout(() => {
      let botResponse: Message;

      switch (actionType) {
        case "RESERVER":
          botResponse = {
            id: Date.now().toString(),
            type: 'bot',
            text: "Très bon choix ! Je vous redirige vers notre espace de réservation.",
          };
          setTimeout(() => {
            router.push('/reservations');
            setIsOpen(false);
          }, 1500);
          break;
        case "TARIFS":
          botResponse = {
            id: Date.now().toString(),
            type: 'bot',
            text: "Voici nos différents tarifs pour les chambres VIP :\n- Passage (1h30) : 10.000 FCFA\n- Long repos (10h) : 15.000 FCFA\n- Nuitée (22h-12h) : 15.000 FCFA\n- Séjour 24h (Standard) : 20.000 FCFA\n- Séjour 24h (Complet avec repas) : 25.000 FCFA",
            options: [
              { label: "🏨 Passer à la réservation", action: () => handleAction("🏨 Réserver une Chambre", "RESERVER") },
              { label: "🔙 Retour au menu principal", action: () => resetToMain() }
            ]
          };
          break;
        case "GASTRONOMIE":
          botResponse = {
            id: Date.now().toString(),
            type: 'bot',
            text: "Notre restaurant propose de délicieuses spécialités. Redirection en cours...",
          };
          setTimeout(() => {
            router.push('/restaurant');
            setIsOpen(false);
          }, 1500);
          break;
        case "LOCATION":
          botResponse = {
            id: Date.now().toString(),
            type: 'bot',
            text: "Nous avons deux sites magnifiques pour vous accueillir :",
            options: [
              { 
                label: "🗺️ Voir Azaguié Ahoua", 
                action: () => { window.open('https://maps.app.goo.gl/g6z9G5jBvN6h5BvN6', '_blank'); resetToMain(); } 
              },
              { 
                label: "🗺️ Voir Yopougon Ananeraie", 
                action: () => { window.open('https://maps.app.goo.gl/Qx9vK2jBvN6h5BvN6', '_blank'); resetToMain(); } 
              },
              {
                label: "🔙 Retour au menu principal",
                action: () => resetToMain()
              }
            ]
          };
          break;
        case "CONTACT":
          botResponse = {
            id: Date.now().toString(),
            type: 'bot',
            text: "Quel site souhaitez-vous contacter ?",
            options: [
              { 
                label: "📱 Réception Yopougon (0140267534)", 
                action: () => { window.open('https://wa.me/2250140267534', '_blank'); resetToMain(); } 
              },
              { 
                label: "📱 Réception Azaguié (0787179566)", 
                action: () => { window.open('https://wa.me/2250787179566', '_blank'); resetToMain(); } 
              },
              {
                label: "🔙 Retour au menu principal",
                action: () => resetToMain()
              }
            ]
          };
          break;
        default:
          botResponse = {
            id: Date.now().toString(),
            type: 'bot',
            text: "Je n'ai pas compris cette demande."
          };
      }

      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const resetToMain = () => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'bot',
        text: "Comment puis-je vous aider d'autre ?",
        options: [
          { label: "🏨 Réserver une Chambre", action: () => handleAction("🏨 Réserver une Chambre", "RESERVER") },
          { label: "💰 Tarifs des Séjours", action: () => handleAction("💰 Tarifs des Séjours", "TARIFS") },
          { label: "🍽️ Voir la Gastronomie", action: () => handleAction("🍽️ Voir la Gastronomie", "GASTRONOMIE") },
          { label: "📍 Où êtes-vous situés ?", action: () => handleAction("📍 Où êtes-vous situés ?", "LOCATION") },
          { label: "🛎️ Contacter la Réception", action: () => handleAction("🛎️ Contacter la Réception", "CONTACT") }
        ]
      }
    ]);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      
      {/* Fenêtre de Chat */}
      <div 
        className={`bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 origin-bottom-right mb-4 flex flex-col ${isOpen ? 'opacity-100 scale-100 h-[500px] max-h-[80vh]' : 'opacity-0 scale-90 h-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-[#8B3A1A] p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🛎️
            </div>
            <div>
              <h3 className="font-bold font-title">Hambole Concierge</h3>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                En ligne
              </div>
            </div>
          </div>
          <button onClick={toggleOpen} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm whitespace-pre-wrap ${msg.type === 'user' ? 'bg-[#2E7D1E] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                <div className="text-sm">{msg.text}</div>
                
                {/* Options (boutons) */}
                {msg.options && (
                  <div className="flex flex-col gap-2 mt-3">
                    {msg.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={opt.action}
                        className="text-left text-sm py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors text-[#8B3A1A] font-medium"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bouton Flottant (Toggle) */}
      <button 
        onClick={toggleOpen}
        className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative ${isOpen ? 'bg-gray-800 text-white' : 'bg-[#8B3A1A] text-white'}`}
      >
        {hasUnread && !isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
        )}
        <span className="text-3xl relative z-10 transition-transform">
          {isOpen ? '✕' : '🛎️'}
        </span>
        {!isOpen && <span className="absolute inset-0 rounded-full animate-ping bg-[#8B3A1A] opacity-20 pointer-events-none" />}
      </button>

    </div>
  );
}
