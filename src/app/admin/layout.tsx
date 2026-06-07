'use client';

import { useSite } from '@/context/SiteContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

// Define which menu items each position can see
const ALL_MENU_ITEMS = [
  { name: 'Analytique & Stats', path: '/admin', icon: '📊', roles: ['ADMIN', 'MANAGER', 'RECEPTION', 'CHEF_CUISINIER', 'HOUSEKEEPING', 'STAFF'] },
  { name: 'Réservations', path: '/admin/reservations', icon: '📅', roles: ['ADMIN', 'MANAGER', 'RECEPTION'] },
  { name: 'Front Desk', path: '/admin/front-desk', icon: '🛎️', roles: ['ADMIN', 'MANAGER', 'RECEPTION'] },
  { name: 'Gouvernance', path: '/admin/housekeeping', icon: '🧹', roles: ['ADMIN', 'MANAGER', 'HOUSEKEEPING'] },
  { name: 'Restauration', path: '/admin/gastronomy', icon: '🍽️', roles: ['ADMIN', 'MANAGER', 'CHEF_CUISINIER'] },
  { name: 'Événements', path: '/admin/events', icon: '🎪', roles: ['ADMIN', 'MANAGER'] },
  { name: 'Stock / Inventaire', path: '/admin/inventory', icon: '📦', roles: ['ADMIN', 'MANAGER', 'CHEF_CUISINIER'] },
  { name: 'Comptabilité', path: '/admin/finance', icon: '💰', roles: ['ADMIN'] },
  { name: 'CRM & Marketing', path: '/admin/clients', icon: '🤝', roles: ['ADMIN', 'MANAGER', 'RECEPTION'] },
  { name: 'Ressources Humaines', path: '/admin/hr', icon: '👥', roles: ['ADMIN', 'MANAGER'] },
  { name: 'Webmail', path: '/admin/webmail', icon: '📧', roles: ['ADMIN', 'MANAGER'] },
  { name: 'Sécurité & Accès', path: '/admin/security', icon: '🔐', roles: ['ADMIN'] },
  { name: 'Promotions', path: '/admin/promotions', icon: '📢', roles: ['ADMIN', 'MANAGER'] },
];

const POSITION_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrateur',
  ADMIN: 'Direction',
  MANAGER: 'Manager',
  RECEPTION: 'Réception',
  CHEF_CUISINIER: 'Chef Cuisinier',
  HOUSEKEEPING: 'Gouvernance',
  STAFF: 'Agent',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentSite, setCurrentSite } = useSite();
  const { logout, user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // ── Protection des accès Admin ──────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (user?.role === 'CLIENT') {
        router.replace('/'); // Les clients n'ont rien à faire ici
      }
    } else {
      router.replace('/auth/admin'); 
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Pendant le chargement initial ou si non autorisé, on peut afficher un loader ou rien
  if (isLoading || !user || user.role === 'CLIENT') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const position = user?.position || 'STAFF';
  const menuItems = ALL_MENU_ITEMS.filter(item => 
    position === 'SUPER_ADMIN' || item.roles.includes(position)
  );

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#1A1208]">
      {/* Sidebar */}
      <aside className={`bg-[#1A1208] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shrink-0`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-title text-xl font-bold tracking-tighter">Hambol Admin</span>}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white/50 hover:text-white">
            {isSidebarOpen ? '❮' : '❯'}
          </button>
        </div>

        {/* Role Badge */}
        {isSidebarOpen && (
          <div className="mx-4 mb-4 px-4 py-2 bg-accent/10 border border-accent/20 rounded-xl">
            <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{POSITION_LABELS[position] || position}</p>
            <p className="text-white text-xs font-bold truncate">{user?.name}</p>
          </div>
        )}

        <nav className="flex-1 mt-2 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                pathname === item.path ? 'bg-accent text-black font-bold shadow-lg' : 'hover:bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
           {isSidebarOpen && <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Site Actif</p>}
           <div className={`flex flex-col gap-2 ${!isSidebarOpen && 'items-center'}`}>
             <button 
               onClick={() => setCurrentSite('Azaguié')}
               className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                 currentSite === 'Azaguié' ? 'bg-[#2E7D1E] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
               }`}
             >
               {isSidebarOpen ? '🌿 Azaguié' : 'A'}
             </button>
             <button 
               onClick={() => setCurrentSite('Yopougon')}
               className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                 currentSite === 'Yopougon' ? 'bg-[#8B3A1A] text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'
               }`}
             >
               {isSidebarOpen ? '🏙️ Yopougon' : 'Y'}
             </button>
           </div>
           <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
             <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-xs font-bold">
               <span>🏠</span>{isSidebarOpen && 'Accueil Public'}
             </Link>
             <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-xs font-bold">
               <span>🚪</span>{isSidebarOpen && 'Déconnexion'}
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Département :</span>
             <span className="font-bold text-primary">
               {ALL_MENU_ITEMS.find(i => i.path === pathname)?.name || 'Espace Admin'}
             </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold">{user?.name || 'Admin'}</span>
              <span className="text-[10px] text-accent uppercase font-bold">{POSITION_LABELS[position] || 'Agent'}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center font-bold text-primary border border-accent/20 uppercase">
              {user?.name?.[0] || 'A'}
            </div>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
