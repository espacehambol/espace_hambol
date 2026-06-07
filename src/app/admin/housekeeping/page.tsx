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

interface LostItem {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
}

export default function HousekeepingPage() {
  const { currentSite } = useSite();
  const [activeTab, setActiveTab] = useState<'ROOMS' | 'LOST'>('ROOMS');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', location: '' });

  const fetchRoomsAndIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const siteMapping: Record<string, string> = { 'Azaguié': 'azaguie', 'Yopougon': 'yopougon' };
      const siteId = siteMapping[currentSite];
      
      const timestamp = Date.now();
      const [roomsRes, incidentsRes, lostRes] = await Promise.all([
        fetch(`/api/admin/housekeeping?siteId=${siteId}&t=${timestamp}`),
        fetch(`/api/admin/incidents?siteId=${siteId}&t=${timestamp}`),
        fetch(`/api/admin/housekeeping/lost?siteId=${siteMapping[currentSite]}&t=${timestamp}`)
      ]);
      
      const roomsData = await roomsRes.json();
      const incidentsData = await incidentsRes.json();
      const lostData = await lostRes.json();
      
      setRooms(roomsData.rooms || []);
      setIncidents(incidentsData.incidents || []);
      setLostItems(lostData.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentSite]);

  useEffect(() => {
    fetchRoomsAndIncidents();
  }, [fetchRoomsAndIncidents]);

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

  const submitLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/housekeeping/lost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, siteId: currentSite })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setForm({ name: '', description: '', location: '' });
        fetchRoomsAndIncidents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateLostItemStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/housekeeping/lost', {
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

  return (
    <div className="space-y-10 relative">
      <header className="flex justify-between items-center border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-title font-bold text-primary">Gouvernance & Entretien</h1>
          <p className="text-gray-400 text-sm">Gestion du Housekeeping — {currentSite}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchRoomsAndIncidents}
            className="px-6 py-2 bg-white border border-gray-100 text-primary rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            Actualiser
          </button>
          {activeTab === 'LOST' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              + Déclarer Objet Trouvé
            </button>
          )}
        </div>
      </header>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-max">
        <button 
          onClick={() => setActiveTab('ROOMS')} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'ROOMS' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
        >
          Chambres & Entretien
        </button>
        <button 
          onClick={() => setActiveTab('LOST')} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'LOST' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-primary'}`}
        >
          Objets Trouvés (Lost & Found)
          {lostItems.filter(i => i.status === 'FOUND').length > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">
              {lostItems.filter(i => i.status === 'FOUND').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'ROOMS' ? (
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
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 min-h-[500px]">
          <h2 className="text-2xl font-bold font-title text-primary mb-6">Registre des Objets Trouvés</h2>
          
          {lostItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <span className="text-4xl mb-4 block">🔍</span>
              Aucun objet trouvé n'a été déclaré sur ce site.
            </div>
          ) : (
            <div className="grid gap-4">
              {lostItems.map(item => (
                <div key={item.id} className="flex justify-between items-center p-6 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 bg-sand rounded-xl flex items-center justify-center text-xl">👜</div>
                    <div>
                      <h4 className="font-bold text-primary">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">📍 {item.location}</span>
                        <span className="flex items-center gap-1">📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                      item.status === 'FOUND' ? 'bg-red-100 text-red-700' :
                      item.status === 'CLAIMED' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.status === 'FOUND' ? 'TROUVÉ' : item.status === 'CLAIMED' ? 'RÉCLAMÉ' : 'EXPÉDIÉ'}
                    </span>
                    {item.status === 'FOUND' && (
                      <button onClick={() => updateLostItemStatus(item.id, 'CLAIMED')} className="text-xs text-accent font-bold hover:underline">Marquer comme Réclamé</button>
                    )}
                    {item.status === 'CLAIMED' && (
                      <button onClick={() => updateLostItemStatus(item.id, 'SHIPPED')} className="text-xs text-accent font-bold hover:underline">Marquer comme Expédié</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Déclarer Objet Trouvé */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500">✕</button>
            <h2 className="text-2xl font-bold font-title text-primary mb-6">Déclarer un objet</h2>
            <form onSubmit={submitLostItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nom de l'objet</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Portefeuille en cuir" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Lieu (Chambre / Espace)</label>
                <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Ex: Chambre 03 ou Réception" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Description (Couleur, marque...)</label>
                <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Détails pour aider à l'identification..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none min-h-[100px]" />
              </div>
              <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-xl mt-4 hover:bg-primary-dk transition-all">
                Enregistrer l'objet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

