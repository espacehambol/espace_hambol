'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSite } from '@/context/SiteContext';

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  client: { name: string; email: string };
  room: { 
    number: string; 
    site: { name: string };
    roomType: { name: string };
  };
}

export default function FrontDeskDashboard() {
  const { currentSite } = useSite();
  const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'REVIEWS'>('RESERVATIONS');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await fetch('/api/admin/reservations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchReservations();
    } catch (err) {
      console.error(err);
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
            Réservations
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
                      <th className="px-6 py-4">Dates</th>
                      <th className="px-6 py-4">Statut</th>
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
                        <tr key={res.id} className="hover:bg-[#F8F9FA] transition-colors">
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
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(res.status)}`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2 text-[10px]">
                              {res.status === 'PENDING' && (
                                <button 
                                  onClick={() => updateStatus(res.id, 'CONFIRMED')}
                                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all font-bold"
                                >
                                  Confirmer
                                </button>
                              )}
                              {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                                <button 
                                  onClick={() => updateStatus(res.id, 'CANCELLED')}
                                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all font-bold"
                                >
                                  Annuler
                                </button>
                              )}
                              {res.status === 'CONFIRMED' && (
                                <button 
                                  onClick={() => updateStatus(res.id, 'COMPLETED')}
                                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all font-bold"
                                >
                                  Terminer
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
    </div>
  );
}
