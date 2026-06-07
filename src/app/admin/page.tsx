'use client';

import { useEffect, useState } from 'react';
import { useSite } from '@/context/SiteContext';
import Link from 'next/link';

interface Stats {
  overall: {
    occupancy: number;
    revenue: number;
    adr: number;
    revpar: number;
    pendingReservations: number;
  };
  sites: Array<{
    siteId: string;
    siteName: string;
    occupiedRooms: number;
    totalRooms: number;
    occupancyRate: number;
    projectedOccupancy?: number;
    revenue: number;
    adr: number;
    revpar: number;
    rooms?: Array<{
      number: string;
      status: string;
    }>;
  }>;
  recentActivity?: Array<{
    id: string;
    clientName: string;
    roomNumber: string;
    siteName: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { currentSite } = useSite();

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchStats();
    };
    init();
    const interval = setInterval(fetchStats, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Check if stats are missing or contain an error response
  const hasError = !stats || 'error' in stats || !stats.sites || !stats.overall;

  if (hasError) {
    return (
      <div className="space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-title font-bold text-primary">Analytique & Stats</h1>
            <p className="text-gray-400 text-sm mt-2">Vue d&apos;ensemble de l&apos;Espace Hambol — {currentSite}</p>
          </div>
        </header>

        <div className="bg-[#FFF5F5] border border-red-200/50 p-10 rounded-[3rem] space-y-6 max-w-3xl shadow-sm">
          <div className="flex items-center gap-4 text-red-800">
            <span className="text-3xl">⚠️</span>
            <h2 className="text-xl font-bold font-title">Erreur de connexion à la base de données</h2>
          </div>
          <p className="text-red-700/80 text-sm leading-relaxed">
            Les données statistiques en temps réel n&apos;ont pas pu être récupérées. Cela se produit généralement si les tables de la base de données SQLite ne sont pas encore créées ou si le schéma de base de données en production n&apos;est pas à jour.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <a 
              href="/api/setup?reset=true" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-6 py-3 bg-red-600 text-white rounded-2xl text-xs font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
            >
              Initialiser / Réinitialiser la Base de Données
            </a>
            <button 
              onClick={fetchStats} 
              className="px-6 py-3 bg-white border border-red-200 text-red-700 rounded-2xl text-xs font-bold hover:bg-red-50 transition-all"
            >
              Réessayer la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSiteStats = stats?.sites?.find(s => s.siteName === currentSite);

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-title font-bold text-primary">Analytique & Stats</h1>
          <p className="text-gray-400 text-sm mt-2">Vue d&apos;ensemble de l&apos;Espace Hambol — {currentSite}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchStats} 
            disabled={refreshing}
            className="px-4 py-2 bg-white border border-accent/20 rounded-lg text-xs font-bold hover:bg-accent/5 transition-all flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Actualisation...
              </>
            ) : (
              'Actualiser les données'
            )}
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>Occupation</span>
            <span className="text-accent">Live</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-primary">{currentSiteStats?.occupancyRate || 0}%</span>
            <span className="text-xs text-gray-400 mb-1">/ 11 ch.</span>
          </div>
          <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full transition-all duration-1000" 
              style={{ width: `${currentSiteStats?.occupancyRate || 0}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-2 mt-2">
            <span title="Taux d'occupation prévisionnel (30 jours)">Prévisionnel (30J)</span>
            <span className="text-primary">{currentSiteStats?.projectedOccupancy || 0}%</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>Chiffre d&apos;Affaires</span>
            <span className="text-green-500">Mois</span>
          </div>
          <div className="flex items-end gap-1 text-primary font-bold">
            <span className="text-3xl">{(currentSiteStats?.revenue || 0).toLocaleString()}</span>
            <span className="text-[10px] mb-1 uppercase">FCFA</span>
          </div>
          <p className="text-[10px] text-gray-400">+12% vs mois dernier</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span title="Average Daily Rate (Prix Moyen)">ADR</span>
            <span className="text-accent">KPI</span>
          </div>
          <div className="flex items-end gap-1 text-primary font-bold">
            <span className="text-3xl">{(currentSiteStats?.adr || 0).toLocaleString()}</span>
            <span className="text-[10px] mb-1 uppercase">FCFA</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-50 pt-2 mt-2">
            <span title="Revenue Per Available Room">RevPAR</span>
            <span className="text-primary">{(currentSiteStats?.revpar || 0).toLocaleString()} FCFA</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <span>En attente</span>
            <span className="p-1 px-2 bg-amber-100 text-amber-700 rounded text-[10px]">Alerte</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-primary">{stats?.overall?.pendingReservations || 0}</span>
            <span className="text-xs text-gray-400 mb-1">Demandes</span>
          </div>
          <Link href="/admin/front-desk" className="text-accent text-xs font-bold underline block text-left pt-1">
            Traiter maintenant
          </Link>
        </div>
      </div>

      {/* Grid: Room status (11 Rooms) */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-primary mb-8 flex items-center gap-3">
          État des Chambres (11 Suites)
          <span className="text-[10px] font-bold px-2 py-1 bg-sand text-accent rounded-full">Temps Réel</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {currentSiteStats?.rooms && currentSiteStats.rooms.length > 0 ? (
            currentSiteStats.rooms.map((room: any) => {
              const isOccupied = room.status === 'OCCUPIED';
              return (
                <div key={room.number} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  isOccupied ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white border-gray-100 hover:border-accent'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Numéro</span>
                  <span className="text-2xl font-bold font-title">{room.number}</span>
                  <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${
                    isOccupied ? 'bg-white/10' :
                    room.status === 'CLEANING' ? 'bg-amber-100 text-amber-700' :
                    room.status === 'MAINTENANCE' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {room.status}
                  </span>
                </div>
              );
            })
          ) : (
            Array.from({ length: 11 }).map((_, i) => {
              const roomNum = (i + 1 < 10 ? '0' + (i + 1) : '' + (i + 1));
              const isOccupied = i < (currentSiteStats?.occupiedRooms || 0);
              return (
                <div key={i} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  isOccupied ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white border-gray-100 hover:border-accent'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Numéro</span>
                  <span className="text-2xl font-bold font-title">{roomNum}</span>
                  <span className={`text-[8px] font-bold px-2 py-1 rounded-full ${
                    isOccupied ? 'bg-white/10' : 'bg-green-100 text-green-700'
                  }`}>
                    {isOccupied ? 'OCCUPÉ' : 'LIBRE'}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold text-primary mb-6">Activité Récente</h2>
           <div className="space-y-6">
             {stats?.recentActivity && stats.recentActivity.length > 0 ? (
               stats.recentActivity.map((res: any) => (
                 <div key={res.id} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                   <div className="w-10 h-10 rounded-xl bg-sand flex items-center justify-center font-bold text-accent">
                     {res.clientName?.[0]?.toUpperCase() || 'R'}
                   </div>
                   <div className="space-y-1">
                     <p className="text-sm font-bold text-primary">Réservation Ch. {res.roomNumber} ({res.siteName})</p>
                     <p className="text-xs text-gray-400">
                       Par {res.clientName} • {new Date(res.createdAt).toLocaleDateString('fr-FR', {
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </p>
                   </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                        res.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' :
                        res.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                        'bg-red-50 text-red-700'
                      }`}>{res.status === 'CONFIRMED' ? 'Confirmé' : res.status === 'PENDING' ? 'En attente' : res.status}</span>
                      
                      {res.status === 'PENDING' && (
                        <Link 
                          href="/admin/front-desk" 
                          className="px-2 py-1 bg-accent hover:bg-accent/90 text-primary-dk rounded text-[10px] font-bold shadow-sm transition-all"
                        >
                          Traiter
                        </Link>
                      )}
                    </div>
                 </div>
               ))
             ) : (
               <p className="text-gray-400 text-sm italic text-center py-6">Aucune activité récente.</p>
             )}
           </div>
        </div>

        <div className="bg-[#1A1208] p-10 rounded-[3rem] text-white overflow-hidden relative">
           <div className="relative z-10 space-y-6">
             <h2 className="text-xl font-bold">Performances du Site</h2>
             <div className="space-y-8">
               <div>
                  <div className="flex justify-between text-xs mb-2"><span>Objectif Mensuel CA</span><span>75%</span></div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent w-3/4 h-full" />
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs mb-2"><span>Satisfaction Client</span><span>9.8/10</span></div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 w-[98%] h-full" />
                  </div>
               </div>
             </div>
           </div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-accent opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>
    </div>
  );
}
