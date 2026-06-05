'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Tableau de Bord', path: '/client', icon: '🏠' },
    { name: 'Mes Réservations', path: '/client/reservations', icon: '📅' },
    { name: 'Conciergerie', path: '/client/concierge', icon: '🛎️' },
    { name: 'Loisirs & Activités', path: '/client/leisure', icon: '🌴' },
    { name: 'Restaurant & Bar', path: '/client/gastronomy', icon: '🍽️' },
    { name: 'Fidélité', path: '/client/loyalty', icon: '🎁' },
    { name: 'Paiements', path: '/client/finance', icon: '💳' },
    { name: 'Mon Profil', path: '/client/profile', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-[#FDFBF9]">
      {/* Sidebar Lux */}
      <aside className="w-80 bg-[#1A1208] text-white flex flex-col p-8 border-r border-[#2E7D1E]/10">
        <div className="mb-12">
          <Link href="/" className="group flex items-center gap-3">
             <div className="relative w-10 h-10 overflow-hidden rounded-xl border-2 border-accent/40">
               <Image src="/logo_hambol.jpg" alt="Espace Hambol" fill className="object-cover" />
             </div>
             <span className="font-title text-xl font-bold tracking-widest uppercase">Espace<br/><span className="text-accent">Hambol</span></span>
          </Link>
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
             <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-2">Membre Privilege</p>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-bold text-sm">Status : Gold</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-body text-sm ${
                  isActive 
                    ? 'bg-accent text-black font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-white/10 mt-8 space-y-2">
           <Link href="/" className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all font-bold text-sm">
             🏠 Accueil Public
           </Link>
           <button onClick={logout} className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm">
             🚪 Se Déconnecter
           </button>
           {user && <p className="text-[10px] text-white/20 text-center pt-2">{user.name}</p>}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
        {children}
      </main>
    </div>
  );
}
