'use client';

import { useSite } from '@/context/SiteContext';
import { useState, useEffect, useCallback } from 'react';

interface Room {
  id: string;
  number: string;
  status: string;
  roomType: {
    name: string;
  };
}

interface Incident {
  id: string;
  type: string;
  roomNumber: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function HousekeepingPage() {
  const { currentSite } = useSite();
  const [activeTab, setActiveTab] = useState<'CLEANING' | 'LOST_FOUND'>('CLEANING');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lostItems, setLostItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lostLoading, setLostLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', roomNumber: '', photoUrl: '' });
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});

  const fetchRoomsAndIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const siteMapping: Record<string, string> = { 'Azaguié': 'azaguie', 'Yopougon': 'yopougon' };
      const siteId = siteMapping[currentSite];
      
      const timestamp = Date.now();
      const [roomsRes, incidentsRes] = await Promise.all([
        fetch(`/api/admin/housekeeping?siteId=${siteId}&t=${timestamp}`),
        fetch(`/api/admin/incidents?siteId=${siteId}&t=${timestamp}`)
      ]);
      
      const roomsData = await roomsRes.json();
      const incidentsData = await incidentsRes.json();
      
      setRooms(roomsData.rooms || []);
      setIncidents(incidentsData.incidents || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  const fetchLostItems = useCallback(async () => {
    setLostLoading(true);
    try {
      const siteMapping: Record<string, string> = { 'Azaguié': 'azaguie', 'Yopougon': 'yopougon' };
      const siteId = siteMapping[currentSite] || 'azaguie';
      const res = await fetch(`/api/admin/lost-items?siteId=${siteId}`);
      const data = await res.json();
      setLostItems(data.lostItems || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLostLoading(false);
    }
  }, [currentSite]);

  useEffect(() => {
    if (activeTab === 'CLEANING') {
      fetchRoomsAndIncidents();
    } else {
      fetchLostItems();
    }
  }, [activeTab, fetchRoomsAndIncidents, fetchLostItems]);

  const updateStatus = async (roomId: string, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      'DIRTY': 'CLEANING',
      'CLEANING': 'AVAILABLE',
      'AVAILABLE': 'OCCUPIED', // Manual toggle for demo or specific cases
      'OCCUPIED': 'DIRTY',
    };
    
    const nextStatus = nextStatusMap[currentStatus] || 'AVAILABLE';
    
    try {
      const res = await fetch('/api/admin/housekeeping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, status: nextStatus })
      });
      
      if (res.ok) {
        fetchRoomsAndIncidents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateIncident = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchRoomsAndIncidents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const siteMapping: Record<string, string> = { 'Azaguié': 'azaguie', 'Yopougon': 'yopougon' };
      const siteId = siteMapping[currentSite] || 'azaguie';
      const res = await fetch('/api/admin/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, siteId })
      });
      if (res.ok) {
        setNewItem({ name: '', description: '', roomNumber: '', photoUrl: '' });
        fetchLostItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateLostItemStatus = async (id: string, status: string, trackingNumber?: string) => {
    try {
      const res = await fetch('/api/admin/lost-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, trackingNumber })
      });
      if (res.ok) {
        fetchLostItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLostItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/lost-items?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchLostItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary">Gouvernance & Entretien</h1>
          <p className="text-gray-400 text-sm">Gestion du Housekeeping — {currentSite}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={activeTab === 'CLEANING' ? fetchRoomsAndIncidents : fetchLostItems}
            className="px-6 py-2 bg-white border border-gray-100 text-primary rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            Actualiser
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-px">
        <button 
          onClick={() => setActiveTab('CLEANING')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'CLEANING' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
        >
          Chambres & Ménage
        </button>
        <button 
          onClick={() => setActiveTab('LOST_FOUND')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${activeTab === 'LOST_FOUND' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
        >
          Objets Trouvés (Lost & Found)
        </button>
      </div>

      {activeTab === 'CLEANING' ? (
        <>
          {/* Housekeeping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center text-gray-400">Synchronisation des données...</div>
            ) : rooms.map((room) => (
              <div key={room.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6 group hover:shadow-xl transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Chambre {room.number}</p>
                    <h4 className="font-bold text-primary mt-1">{room.roomType.name}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-bold ${
                    room.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    room.status === 'DIRTY' ? 'bg-red-100 text-red-700' :
                    room.status === 'CLEANING' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                    room.status === 'OCCUPIED' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {room.status}
                  </span>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between text-xs items-center">
                      <span className="text-gray-400">Priorité</span>
                      <span className={`font-bold ${room.status === 'DIRTY' ? 'text-red-500' : 'text-gray-900'}`}>
                        {room.status === 'DIRTY' ? 'HAUTE' : 'NORMALE'}
                      </span>
                   </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-50">
                   <button 
                     onClick={() => updateStatus(room.id, room.status)}
                     className="flex-1 py-3 rounded-xl bg-primary text-white text-[10px] font-bold hover:bg-primary-dk transition-all uppercase tracking-widest shadow-md"
                   >
                     Valider État
                   </button>
                </div>
              </div>
            ))}
            {!loading && rooms.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400 bg-white rounded-[3rem] border border-dashed border-gray-200">
                Aucune chambre configurée pour ce site.
              </div>
            )}
          </div>

          {/* Maintenance Alerts */}
          <div className="bg-[#1A1208] text-white p-10 rounded-[3rem] shadow-xl">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
               🛠️ Maintenance & Incidents
               {incidents.length > 0 && <span className="px-2 py-1 bg-red-500 text-white rounded text-[10px] uppercase font-bold tracking-widest">{incidents.length} Alerte{incidents.length > 1 ? 's' : ''}</span>}
             </h3>
             <div className="space-y-4">
                {incidents.length > 0 ? incidents.map(incident => (
                  <div key={incident.id} className="p-6 bg-white/5 rounded-2xl flex justify-between items-center border border-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center font-bold">!</div>
                       <div>
                         <h5 className="font-bold">{incident.description} — Suite {incident.roomNumber}</h5>
                         <p className="text-xs text-white/50">Signalé via Concierge Digital {new Date(incident.createdAt).toLocaleTimeString()}</p>
                       </div>
                    </div>
                    <button 
                       onClick={() => updateIncident(incident.id, 'COMPLETED')}
                       className="px-4 py-2 bg-white text-[#1A1208] rounded-xl text-[10px] font-bold hover:bg-accent hover:text-white transition-all"
                     >
                      Intervenir
                    </button>
                  </div>
                )) : (
                  <p className="text-white/30 italic text-sm">Aucun incident critique signalé.</p>
                )}
             </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Declare Lost Item Form */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-fit space-y-6">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <span>📝</span> Déclarer un objet
            </h3>
            <form onSubmit={saveLostItem} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Objet</label>
                <input required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="Ex: Lunettes de soleil, Smartphone" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description / Couleur / Marque</label>
                <textarea value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Ex: Lunettes de marque Ray-Ban noires, trouvées sur le lit." className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent h-24 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Chambre / Lieu</label>
                <input value={newItem.roomNumber} onChange={e => setNewItem({...newItem, roomNumber: e.target.value})} placeholder="Ex: Suite 101, Restaurant" className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">URL Photo (Facultatif)</label>
                <input value={newItem.photoUrl} onChange={e => setNewItem({...newItem, photoUrl: e.target.value})} placeholder="Ex: https://image-url..." className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dk transition-all mt-2 uppercase tracking-widest text-xs">
                Enregistrer l'objet
              </button>
            </form>
          </div>

          {/* Object List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
              {lostLoading ? (
                <div className="py-20 text-center text-gray-400">Recherche dans le registre...</div>
              ) : lostItems.length === 0 ? (
                <div className="py-20 text-center text-gray-400 space-y-4">
                  <span className="text-4xl">📦</span>
                  <p className="font-bold">Aucun objet trouvé enregistré.</p>
                  <p className="text-sm">Utilisez le formulaire ci-contre pour déclarer un objet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {lostItems.map(item => (
                    <div key={item.id} className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2 max-w-md">
                        <div className="flex gap-2 items-center">
                          <h4 className="font-bold text-lg text-primary">{item.name}</h4>
                          {item.roomNumber && <span className="bg-sand text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">Ch. {item.roomNumber}</span>}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{item.description || "Aucune description fournie."}</p>
                        <p className="text-[10px] text-gray-400 font-mono">Trouvé le {new Date(item.dateFound).toLocaleDateString()}</p>
                        
                        {item.status === 'SHIPPED' && item.trackingNumber && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-mono">
                            N° de suivi : {item.trackingNumber}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center w-full md:w-auto">
                        <div className="flex flex-col gap-1">
                          <span className={`text-center px-3 py-1 rounded-full text-[10px] font-bold border ${
                            item.status === 'FOUND' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            item.status === 'CLAIMED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            {item.status === 'FOUND' ? 'TROUVÉ / STOCK' :
                             item.status === 'CLAIMED' ? 'RÉCLAMÉ' : 'EXPÉDIÉ / REMIS'}
                          </span>
                        </div>

                        <div className="flex gap-2 justify-end">
                          {item.status === 'FOUND' && (
                            <button onClick={() => updateLostItemStatus(item.id, 'CLAIMED')} className="px-3 py-2 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition-all">
                              Réclamé
                            </button>
                          )}
                          {item.status === 'CLAIMED' && (
                            <div className="flex gap-2 items-center">
                              <input 
                                type="text" 
                                placeholder="N° Suivi Expédition" 
                                value={trackingInput[item.id] || ''}
                                onChange={(e) => setTrackingInput({...trackingInput, [item.id]: e.target.value})}
                                className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-accent"
                              />
                              <button 
                                onClick={() => updateLostItemStatus(item.id, 'SHIPPED', trackingInput[item.id])} 
                                className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-all whitespace-nowrap"
                              >
                                Expédier
                              </button>
                            </div>
                          )}
                          <button onClick={() => deleteLostItem(item.id)} className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
