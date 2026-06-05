'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/context/SiteContext';

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  client: { 
    name: string;
    email: string;
  };
  room: { 
    number: string;
  };
}

interface Room {
  id: string;
  number: string;
}

export default function ReservationsGrid() {
  const { currentSite } = useSite();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [processing, setProcessing] = useState(false);

  const daysCount = 14; 
  const days = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const siteId = currentSite.toLowerCase().includes('azaguie') || currentSite.toLowerCase().includes('azaguié') 
        ? 'azaguie' 
        : 'yopougon';
      const res = await fetch(`/api/admin/reservations?siteId=${siteId}`);
      const data = await res.json();
      setReservations(data.reservations || []);
      setRooms(data.rooms || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSite, viewDate]);

  const updateStatus = async (id: string, status: string) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await loadData();
        setSelectedRes(null);
      } else {
        alert('Erreur lors de la mise à jour du statut.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de connexion.');
    } finally {
      setProcessing(false);
    }
  };

  const getOccupancy = (roomNum: string, date: Date) => {
    return reservations.find(res => {
      if (res.status === 'CANCELLED') return false;
      const start = new Date(res.checkIn);
      const end = new Date(res.checkOut);
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return res.room.number === roomNum && d >= start && d < end;
    });
  };


  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary text-primary-content">Planning des Chambres</h1>
          <p className="text-gray-400 text-sm">Gestion visuelle des {rooms.length} suites — {currentSite}</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg hover:bg-primary-dk transition-all">
            + Nouvelle Réservation
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-sand/20">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const d = new Date(viewDate);
                d.setDate(d.getDate() - 7);
                setViewDate(d);
              }}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              ◀
            </button>
            <button 
              onClick={() => setViewDate(new Date())}
              className="px-4 py-1 bg-white rounded-lg text-xs font-bold border border-gray-100"
            >
              Aujourd&apos;hui
            </button>
            <button 
              onClick={() => {
                const d = new Date(viewDate);
                d.setDate(d.getDate() + 7);
                setViewDate(d);
              }}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              ▶
            </button>
          </div>
          <span className="text-sm font-bold text-primary">
            {viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 border-r border-gray-100 sticky left-0 bg-gray-50 z-10 w-24 text-left text-[10px] font-bold text-gray-400 uppercase">Chambre</th>
                {days.map((day, i: number) => (
                  <th key={i} className={`p-4 border-r border-gray-100 min-w-[120px] text-center ${day.toDateString() === new Date().toDateString() ? 'bg-accent/5' : ''}`}>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                    <div className={`text-lg font-bold ${day.toDateString() === new Date().toDateString() ? 'text-accent' : 'text-primary'}`}>
                      {day.getDate()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={daysCount + 1} className="p-12 text-center text-gray-400">Chargement du planning...</td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={daysCount + 1} className="p-12 text-center text-gray-400">Aucune chambre trouvée pour ce site.</td>
                </tr>
              ) : rooms.map((room) => {
                return (
                  <tr key={room.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                    <td className="p-4 border-r border-gray-100 sticky left-0 bg-white z-10 font-bold text-primary">
                      Suite {room.number}
                    </td>
                    {days.map((day, j: number) => {
                      const res = getOccupancy(room.number, day);

                      return (
                        <td key={j} className="p-2 border-r border-gray-50 relative h-16">
                          {res && (
                            <div 
                              onClick={() => setSelectedRes(res)}
                              className={`absolute inset-1 rounded-lg p-2 text-[10px] font-bold flex flex-col justify-center overflow-hidden transition-all hover:scale-[1.02] cursor-pointer shadow-sm ${
                                res.status === 'CONFIRMED' ? 'bg-primary text-white' : 
                                res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <span className="truncate">{res.client.name}</span>
                              <span className="opacity-70 font-normal">#{res.id.slice(-4)}</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      <div className="flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-gray-500 font-medium">Confirmée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-100" />
          <span className="text-xs text-gray-500 font-medium">En attente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100" />
          <span className="text-xs text-gray-500 font-medium">Terminée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-gray-100" />
          <span className="text-xs text-gray-500 font-medium">Libre</span>
        </div>
      </div>

      {/* Action Modal (New Reservation) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold font-title text-primary mb-6">Nouvelle Réservation</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Action simulée avec succès.'); setIsModalOpen(false); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nom du client</label>
                <input type="text" required placeholder="Ex: Koffi Marc" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:bg-primary-dk transition-all">
                Créer la Réservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail & Action Modal */}
      {selectedRes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative border border-gray-100 mx-4">
            <button 
              onClick={() => setSelectedRes(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold transition-all text-lg"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🛎️</span>
              <div>
                <h2 className="text-2xl font-bold font-title text-primary">Détails de la Réservation</h2>
                <p className="text-xs text-gray-400">ID: #{selectedRes.id}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-sand/20 p-5 rounded-2xl border border-gray-100 space-y-3">
                <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Informations Client</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Nom complet</p>
                    <p className="text-sm font-bold text-primary">{selectedRes.client.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Adresse E-mail</p>
                    <p className="text-sm font-bold text-primary truncate">{selectedRes.client.email || 'Non spécifié'}</p>
                  </div>
                </div>
              </div>

              {/* Stay Info */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Détails du Séjour</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Chambre</p>
                    <p className="text-sm font-bold text-primary">Suite {selectedRes.room.number}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Arrivée (Check-In)</p>
                    <p className="text-xs font-mono font-bold text-primary">
                      {new Date(selectedRes.checkIn).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Départ (Check-Out)</p>
                    <p className="text-xs font-mono font-bold text-primary">
                      {new Date(selectedRes.checkOut).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Statut Actuel</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mt-1 ${
                      selectedRes.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      selectedRes.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      selectedRes.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedRes.status === 'PENDING' ? 'En attente' :
                       selectedRes.status === 'CONFIRMED' ? 'Confirmé' :
                       selectedRes.status === 'COMPLETED' ? 'Terminé' : 'Annulé'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium">Montant Total</p>
                    <p className="text-lg font-bold text-[#8B3A1A] mt-1">
                      {selectedRes.totalPrice.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-3">
                {selectedRes.status !== 'CANCELLED' && selectedRes.status !== 'COMPLETED' && (
                  <button
                    disabled={processing}
                    onClick={() => updateStatus(selectedRes.id, 'CANCELLED')}
                    className="px-4 py-2.5 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 text-xs font-bold rounded-xl transition-all active:scale-95"
                  >
                    Annuler la Réservation
                  </button>
                )}

                {selectedRes.status === 'PENDING' && (
                  <button
                    disabled={processing}
                    onClick={() => updateStatus(selectedRes.id, 'CONFIRMED')}
                    className="px-5 py-2.5 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    Confirmer la Réservation
                  </button>
                )}

                {selectedRes.status === 'CONFIRMED' && (
                  <button
                    disabled={processing}
                    onClick={() => updateStatus(selectedRes.id, 'COMPLETED')}
                    className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                  >
                    Terminer le séjour (Check-Out)
                  </button>
                )}

                <button
                  onClick={() => setSelectedRes(null)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-xl transition-all active:scale-95"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
