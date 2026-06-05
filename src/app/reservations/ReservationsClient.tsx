'use client';

import { useSite } from '@/context/SiteContext';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Step = 'search' | 'selection' | 'confirmation' | 'success';

interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
}

function RouterBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="inline-block bg-[#8B3A1A] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#5C2410] transition-all shadow-lg"
    >
      Retour à l&apos;Accueil
    </button>
  );
}

function ReservationForm() {
  const { currentSite } = useSite();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('search');
  
  const [formData, setFormData] = useState({
    checkIn: searchParams.get('arrival') || '',
    checkOut: '',
    guests: searchParams.get('guests') || '1',
    roomTypeId: '',
    clientName: '',
    clientEmail: '',
  });

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/room-types')
      .then(res => res.json())
      .then(data => {
        setRoomTypes(data.roomTypes || []);
        setFetchingTypes(false);
      })
      .catch(err => {
        console.error(err);
        setFetchingTypes(false);
      });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('selection');
  };

  const handleSelectRoom = (id: string) => {
    const selected = roomTypes.find(r => r.id === id);
    if (!selected) return;

    // Logic for durations based on name
    let checkOut = formData.checkOut;
    const now = formData.checkIn ? new Date(formData.checkIn) : new Date();
    
    if (selected.name.includes('Passage')) {
      const end = new Date(now.getTime() + 1.5 * 60 * 60 * 1000);
      checkOut = end.toISOString().slice(0, 16);
    } else if (selected.name.includes('Long Repos')) {
      const end = new Date(now.getTime() + 10 * 60 * 60 * 1000);
      checkOut = end.toISOString().slice(0, 16);
    } else if (selected.name.includes('Nuitée')) {
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      end.setHours(12, 0, 0, 0);
      checkOut = end.toISOString().slice(0, 16);
    } else if (selected.name.includes('Séjour 24h')) {
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      checkOut = end.toISOString().slice(0, 16);
    }

    setFormData({ ...formData, roomTypeId: id, checkOut });
    setStep('confirmation');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const selectedRoom = roomTypes.find(r => r.id === formData.roomTypeId);
    const totalPrice = selectedRoom ? selectedRoom.price : 0;

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          siteName: currentSite,
          totalPrice,
          guestCount: parseInt(formData.guests)
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        setError(data.error || 'Aucune chambre disponible pour ce type sur ce site.');
      }
    } catch {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5EDE0] min-h-screen pt-32 pb-20 px-6 font-body">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="font-title text-4xl sm:text-5xl font-bold text-[#8B3A1A] mb-4">
            Réserver votre Séjour
          </h1>
          <p className="text-[#6B5C4E] text-lg">
            Vivez l&apos;expérience Espace Hambol à <span className="font-bold text-[#2E7D1E]">{currentSite}</span>.
          </p>
        </header>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 max-w-lg mx-auto">
          {['search', 'selection', 'confirmation', 'success'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                step === s ? 'bg-[#8B3A1A] text-white scale-110 shadow-lg' : 
                i < ['search', 'selection', 'confirmation', 'success'].indexOf(step) ? 'bg-[#2E7D1E] text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                {i + 1}
              </div>
              {i < 3 && <div className={`w-12 sm:w-20 h-1 mx-2 rounded-full ${
                i < ['search', 'selection', 'confirmation', 'success'].indexOf(step) ? 'bg-[#2E7D1E]' : 'bg-gray-300'
              }`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-[#D4956A]/10">
          {step === 'search' && (
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#8B3A1A] mb-2">Arrivée (Date & Heure)</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B3A1A] outline-none"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#8B3A1A] mb-2">Personnes</label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B3A1A] outline-none"
                    value={formData.guests}
                    onChange={(e) => setFormData({...formData, guests: e.target.value})}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4+</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-[#8B3A1A] hover:bg-[#5C2410] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-[0.98]">
                Vérifier les Formules Disponibles
              </button>
            </form>
          )}

          {step === 'selection' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-title font-bold text-[#8B3A1A] mb-4">Choisissez votre formule</h2>
              {fetchingTypes ? (
                <div className="py-12 text-center text-gray-400">Chargement des tarifs...</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {roomTypes.map((type) => (
                    <button 
                      key={type.id}
                      onClick={() => handleSelectRoom(type.id)}
                      className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border-2 border-gray-100 hover:border-[#D4956A] transition-all hover:bg-[#F5EDE044] text-left group"
                    >
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#8B3A1A] group-hover:text-[#2E7D1E] transition-colors">{type.name}</h3>
                        <p className="text-sm text-[#6B5C4E] mt-1">{type.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[#8B3A1A]">{type.price.toLocaleString()} FCFA</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <button 
                onClick={() => setStep('search')}
                className="text-[#8B3A1A] font-bold hover:underline"
              >
                ← Retour
              </button>
            </div>
          )}

          {step === 'confirmation' && (
            <form onSubmit={handleConfirm} className="space-y-6">
              <h2 className="text-2xl font-title font-bold text-[#8B3A1A] mb-4">Vos Coordonnées</h2>
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
              <div>
                <label className="block text-sm font-bold text-[#8B3A1A] mb-2">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  placeholder="Jean Dupont"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B3A1A] outline-none"
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#8B3A1A] mb-2">Adresse Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="jean.dupont@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B3A1A] outline-none"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                />
              </div>
              <div className="p-6 bg-[#F5EDE0] rounded-2xl border border-[#D4956A]/20">
                <h3 className="font-bold text-[#8B3A1A] mb-2">Récapitulatif</h3>
                <div className="flex justify-between text-sm text-[#6B5C4E]">
                  <span>Site:</span><span className="font-bold">{currentSite}</span>
                </div>
                <div className="flex justify-between text-sm text-[#6B5C4E]">
                  <span>Formule:</span><span className="font-bold text-[#8B3A1A]">{roomTypes.find(r => r.id === formData.roomTypeId)?.name}</span>
                </div>
                <div className="flex justify-between text-sm text-[#6B5C4E] mt-2 pt-2 border-t border-[#D4956A]/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Arrivée</span>
                    <span className="font-bold font-mono">{formData.checkIn ? new Date(formData.checkIn).toLocaleString('fr-FR') : '-'}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Départ Prévu</span>
                    <span className="font-bold font-mono">{formData.checkOut ? new Date(formData.checkOut).toLocaleString('fr-FR') : '-'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setStep('selection')}
                  className="flex-1 text-[#8B3A1A] font-bold py-4 rounded-2xl border-2 border-[#8B3A1A] hover:bg-[#F5EDE0] transition-all"
                >
                  Précédent
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-[2] bg-[#2E7D1E] hover:bg-[#1E5614] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Confirmer la Réservation'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-12 space-y-6 animate-fade-in">
              <div className="w-24 h-24 bg-[#2E7D1E] text-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-title font-bold text-[#8B3A1A]">Demande Confirmée !</h2>
              <p className="text-[#6B5C4E] max-w-md mx-auto font-medium">
                Votre demande de réservation pour <span className="font-bold">{currentSite}</span> a été transmise à notre équipe. 
                Vous recevrez une confirmation par email très prochainement.
              </p>
              <RouterBackButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReservationsClient() {
  return (
    <Suspense fallback={
      <div className="bg-[#F5EDE0] min-h-screen pt-32 flex items-center justify-center">
        <div className="text-[#8B3A1A] font-bold animate-pulse">Chargement du système de réservation...</div>
      </div>
    }>
      <ReservationForm />
    </Suspense>
  );
}
