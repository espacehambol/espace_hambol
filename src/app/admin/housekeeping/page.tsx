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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomsAndIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const siteMapping: Record<string, string> = { 'Azaguié': 'azaguie', 'Yopougon': 'yopougon' };
      const siteId = siteMapping[currentSite];
      
      const [roomsRes, incidentsRes] = await Promise.all([
        fetch(`/api/admin/housekeeping?siteId=${siteId}`),
        fetch(`/api/admin/incidents?siteId=${siteId}`)
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

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
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
        </div>
      </header>

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
                <button className="px-4 py-2 bg-white text-[#1A1208] rounded-xl text-[10px] font-bold hover:bg-accent hover:text-white transition-all">
                  Intervenir
                </button>
              </div>
            )) : (
              <p className="text-white/30 italic text-sm">Aucun incident critique signalé.</p>
            )}
         </div>
      </div>
    </div>
  );
}

