'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSite } from '@/context/SiteContext';

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  checkInStatus: string;
  totalPrice: number;
  client: { name: string; email: string };
  room: { 
    number: string; 
    site: { name: string };
    roomType: { name: string };
  };
  kycData?: {
    id: string;
    idType: string;
    idNumber: string;
    idExpiry?: string;
    idImage?: string;
  } | null;
}

export default function FrontDeskDashboard() {
  const { currentSite } = useSite();
  const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'REVIEWS'>('RESERVATIONS');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const siteMapping: Record<string, string> = { 'Azaguié': 'azaguie', 'Yopougon': 'yopougon' };
      const siteId = siteMapping[currentSite] || 'azaguie';
      const timestamp = Date.now();
      const res = await fetch(`/api/admin/reservations?siteId=${siteId}&t=${timestamp}`);
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews`);
      const data = await res.json();
      setReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'RESERVATIONS') fetchReservations();
    else fetchReviews();
  }, [activeTab, fetchReservations, fetchReviews]);

  const updateStatus = async (id: string, status: string) => {
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchReservations();
        setSelectedRes(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const updateCheckInStatus = async (id: string, checkInStatus: string, status?: string) => {
    setProcessing(true);
    try {
      const body: any = { id, checkInStatus };
      if (status) body.status = status;

      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchReservations();
        setSelectedRes(null);
      } else {
        alert('Erreur lors de la mise à jour.');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur de connexion.');
    } finally {
      setProcessing(false);
    }
  };

  const updateReviewStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="font-title text-3xl font-bold text-[#8B3A1A]">Réception & Avis</h1>
            <p className="text-gray-500 text-sm">Tableau de bord de la Réception (Front Desk)</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => activeTab === 'RESERVATIONS' ? fetchReservations() : fetchReviews()}
              className="px-4 py-2 bg-white border border-[#D4956A] text-[#8B3A1A] rounded-lg text-sm font-bold hover:bg-[#F5EDE0] transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Rafraîchir
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('RESERVATIONS')}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'RESERVATIONS' ? 'border-[#8B3A1A] text-[#8B3A1A]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Arrivées & Départs
          </button>
          <button 
            onClick={() => setActiveTab('REVIEWS')}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'REVIEWS' ? 'border-[#8B3A1A] text-[#8B3A1A]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            Modération Avis
            {reviews.filter(r => r.status === 'PENDING').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{reviews.filter(r => r.status === 'PENDING').length}</span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#8B3A1A]"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === 'RESERVATIONS' ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-gray-100 text-gray-600 font-bold">
                    <tr>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Site / Chambre</th>
                      <th className="px-6 py-4">Dates & Tarifs</th>
                      <th className="px-6 py-4">Statuts (Booking / Check-In)</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reservations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Aucune réservation trouvée.</td>
                      </tr>
                    ) : (
                      reservations.map((res) => (
                        <tr 
                          key={res.id} 
                          onClick={() => setSelectedRes(res)} 
                          className="hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-5">
                            <div className="font-bold text-gray-900">{res.client.name}</div>
                            <div className="text-gray-500 text-xs">{res.client.email}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-gray-900 font-medium">{res.room.site.name}</div>
                            <div className="text-gray-500 text-xs">Ch. {res.room.number} ({res.room.roomType.name})</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-gray-900 font-mono text-xs">
                              {new Date(res.checkIn).toLocaleDateString()} → {new Date(res.checkOut).toLocaleDateString()}
                            </div>
                            <div className="text-[#8B3A1A] font-bold mt-1">
                              {res.totalPrice.toLocaleString()} FCFA
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border w-fit ${getStatusColor(res.status)}`}>
                                {res.status}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border w-fit ${
                                res.checkInStatus === 'KYC_SUBMITTED' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                res.checkInStatus === 'READY_FOR_KEY' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                res.checkInStatus === 'CHECKED_IN' ? 'bg-green-100 text-green-800 border-green-200' :
                                res.checkInStatus === 'CHECKED_OUT' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                                'bg-gray-50 text-gray-500 border-gray-100'
                              }`}>
                                {res.checkInStatus === 'KYC_SUBMITTED' && '📄 ID Soumise'}
                                {res.checkInStatus === 'READY_FOR_KEY' && '🔑 Prêt pour Clé'}
                                {res.checkInStatus === 'CHECKED_IN' && '✅ Check-In Fait'}
                                {res.checkInStatus === 'CHECKED_OUT' && '🚪 Check-Out Fait'}
                                {(!res.checkInStatus || res.checkInStatus === 'NOT_STARTED') && 'Pas démarré'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2 text-[10px]" onClick={(e) => e.stopPropagation()}>
                              {res.status === 'PENDING' && (
                                <button 
                                  onClick={() => updateStatus(res.id, 'CONFIRMED')}
                                  className="px-2.5 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-all font-bold"
                                >
                                  Confirmer
                                </button>
                              )}
                              {res.checkInStatus === 'KYC_SUBMITTED' && (
                                <button 
                                  onClick={() => updateCheckInStatus(res.id, 'READY_FOR_KEY')}
                                  className="px-2.5 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-all font-bold"
                                >
                                  Valider ID
                                </button>
                              )}
                              {res.checkInStatus === 'READY_FOR_KEY' && (
                                <button 
                                  onClick={() => updateCheckInStatus(res.id, 'CHECKED_IN')}
                                  className="px-2.5 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all font-bold"
                                >
                                  Remettre Clé (Check-In)
                                </button>
                              )}
                              {res.checkInStatus === 'CHECKED_IN' && (
                                <button 
                                  onClick={() => updateCheckInStatus(res.id, 'CHECKED_OUT', 'COMPLETED')}
                                  className="px-2.5 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-800 transition-all font-bold"
                                >
                                  Check-Out
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F9FA] border-b border-gray-100 text-gray-600 font-bold">
                    <tr>
                      <th className="px-6 py-4">Date & Site</th>
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Note & Commentaire</th>
                      <th className="px-6 py-4 text-center">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reviews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Aucun témoignage trouvé.</td>
                      </tr>
                    ) : (
                      reviews.map((rev) => (
                        <tr key={rev.id} className={`hover:bg-[#F8F9FA] transition-colors ${rev.status === 'PENDING' ? 'bg-amber-50/30' : ''}`}>
                          <td className="px-6 py-5 align-top">
                            <div className="font-mono text-xs text-gray-500 mb-1">{new Date(rev.createdAt).toLocaleDateString()}</div>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{rev.site}</span>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="font-bold text-gray-900">{rev.user?.name || 'Inconnu'}</div>
                            <div className="text-gray-500 text-xs">{rev.user?.email}</div>
                          </td>
                          <td className="px-6 py-5 align-top max-w-md">
                            <div className="flex gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={star <= rev.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                              ))}
                            </div>
                            <p className="text-gray-700 italic text-sm line-clamp-3">"{rev.comment}"</p>
                          </td>
                          <td className="px-6 py-5 text-center align-top">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${rev.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : rev.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {rev.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right align-top">
                            <div className="flex justify-end gap-2 text-[10px]">
                              {rev.status === 'PENDING' && (
                                <>
                                  <button onClick={() => updateReviewStatus(rev.id, 'APPROVED')} className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 font-bold">Approuver</button>
                                  <button onClick={() => updateReviewStatus(rev.id, 'REJECTED')} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 font-bold">Rejeter</button>
                                </>
                              )}
                              <button onClick={() => deleteReview(rev.id)} className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 font-bold">Supprimer</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation & KYC Modal */}
      {selectedRes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedRes(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-lg font-bold"
            >
              ✕
            </button>
            
            <header className="mb-6">
              <h2 className="text-2xl font-bold font-title text-[#8B3A1A] flex items-center gap-2">
                <span>🛎️</span> Validation Réception / Check-In
              </h2>
              <p className="text-xs text-gray-400">Réservation #{selectedRes.id}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reservation Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informations Client</h4>
                  <div>
                    <p className="text-[10px] text-gray-400">Nom Complet</p>
                    <p className="text-sm font-bold text-primary">{selectedRes.client.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Email</p>
                    <p className="text-sm font-bold text-primary truncate">{selectedRes.client.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Séjour & Tarif</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-gray-400">Chambre Assigned</p>
                      <p className="text-sm font-bold text-primary">Ch. {selectedRes.room.number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Type de Chambre</p>
                      <p className="text-xs font-bold text-primary">{selectedRes.room.roomType.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/50">
                    <div>
                      <p className="text-[10px] text-gray-400">Dates</p>
                      <p className="text-xs font-bold text-primary">
                        {new Date(selectedRes.checkIn).toLocaleDateString()} → {new Date(selectedRes.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Tarif Total</p>
                      <p className="text-sm font-bold text-[#8B3A1A]">{selectedRes.totalPrice.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC Verification */}
              <div className="space-y-4">
                <div className="bg-[#1A1208] text-white p-5 rounded-2xl space-y-4 border border-white/5 relative overflow-hidden">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-widest">Vérification d'Identité (KYC)</h4>
                  {selectedRes.kycData ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold">Type de Document</p>
                        <p className="text-xs font-bold text-white uppercase">{selectedRes.kycData.idType}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/40 uppercase font-bold">Numéro de Document</p>
                        <p className="text-xs font-bold text-white font-mono">{selectedRes.kycData.idNumber}</p>
                      </div>
                      {selectedRes.kycData.idExpiry && (
                        <div>
                          <p className="text-[9px] text-white/40 uppercase font-bold">Date d'Expiration</p>
                          <p className="text-xs font-bold text-white font-mono">{new Date(selectedRes.kycData.idExpiry).toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      {/* Interactive mock ID graphic */}
                      <div className="mt-4 border border-white/10 rounded-xl p-3 bg-white/5 flex items-center justify-between text-xs text-white/50">
                        <span className="text-lg">🪪</span>
                        <span className="font-mono text-[9px] truncate max-w-[150px]">{selectedRes.kycData.idImage || 'Scap_Piece_ID.jpg'}</span>
                        <a 
                          href={selectedRes.kycData.idImage || '#'} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => { if (!selectedRes.kycData?.idImage) { e.preventDefault(); alert("Fichier image simulé."); } }}
                          className="text-accent underline font-bold hover:text-yellow-400"
                        >
                          Voir scan
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <p className="text-xs text-white/60 italic">Aucun document d'identité numérique soumis en ligne par le client.</p>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center text-xs text-white/40">
                        Enregistrement manuel requis à la réception lors de la remise de la clé.
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">État du Check-In</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 font-medium">Statut d'accueil :</span>
                    <span className="text-xs font-bold text-primary">
                      {selectedRes.checkInStatus === 'KYC_SUBMITTED' && '📄 Pièce d\'identité soumise'}
                      {selectedRes.checkInStatus === 'READY_FOR_KEY' && '🔑 Prêt pour clé (ID validée)'}
                      {selectedRes.checkInStatus === 'CHECKED_IN' && '✅ Client installé en chambre'}
                      {selectedRes.checkInStatus === 'CHECKED_OUT' && '🚪 Client parti'}
                      {(!selectedRes.checkInStatus || selectedRes.checkInStatus === 'NOT_STARTED') && 'Pas démarré'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-3" onClick={(e) => e.stopPropagation()}>
              {/* ID Validation action */}
              {selectedRes.checkInStatus === 'KYC_SUBMITTED' && (
                <button
                  disabled={processing}
                  onClick={() => updateCheckInStatus(selectedRes.id, 'READY_FOR_KEY')}
                  className="px-5 py-3 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
                >
                  ☑️ Valider la pièce & Autoriser la clé
                </button>
              )}

              {/* Check-In / Key assignment action */}
              {(selectedRes.checkInStatus === 'READY_FOR_KEY' || selectedRes.checkInStatus === 'KYC_SUBMITTED' || !selectedRes.checkInStatus || selectedRes.checkInStatus === 'NOT_STARTED') && selectedRes.status === 'CONFIRMED' && (
                <button
                  disabled={processing}
                  onClick={() => updateCheckInStatus(selectedRes.id, 'CHECKED_IN')}
                  className="px-5 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  🔑 Remettre la clé & Ouvrir la chambre (Check-In)
                </button>
              )}

              {/* Check-Out action */}
              {selectedRes.checkInStatus === 'CHECKED_IN' && (
                <button
                  disabled={processing}
                  onClick={() => updateCheckInStatus(selectedRes.id, 'CHECKED_OUT', 'COMPLETED')}
                  className="px-5 py-3 bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
                >
                  🚪 Libérer la chambre & Check-Out
                </button>
              )}

              {selectedRes.status === 'PENDING' && (
                <button
                  disabled={processing}
                  onClick={() => updateStatus(selectedRes.id, 'CONFIRMED')}
                  className="px-5 py-3 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
                >
                  Confirmer la Réservation
                </button>
              )}

              {selectedRes.status !== 'CANCELLED' && selectedRes.status !== 'COMPLETED' && (
                <button
                  disabled={processing}
                  onClick={() => updateStatus(selectedRes.id, 'CANCELLED')}
                  className="px-5 py-3 bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 text-xs font-bold rounded-xl transition-all"
                >
                  Annuler la Réservation
                </button>
              )}

              <button
                onClick={() => setSelectedRes(null)}
                className="px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
