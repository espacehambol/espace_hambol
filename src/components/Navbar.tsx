'use client';

import Image from "next/image";
import Link from "next/link";
import SiteSwitcher from "./SiteSwitcher";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSite } from "@/context/SiteContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const { currentSite } = useSite();

  // Hide navbar inside dashboards and auth pages
  const isDashboard = pathname.startsWith('/admin') || pathname.startsWith('/client') || pathname.startsWith('/auth');
  if (isDashboard) return null;

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Hébergement", href: "/chambres" },
    { name: "Restaurant", href: "/restaurant" },
    ...(currentSite !== 'Yopougon' ? [{ name: "Loisirs", href: "/loisirs" }] : []),
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-white/80 backdrop-blur-md border-b border-[#D4956A]/20 shadow-sm">
      {/* Top Utility Bar */}
      <div className="flex justify-end items-center gap-6 px-8 py-2 bg-[#1A1208] text-white">
        {isAuthenticated ? (
          <>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {user?.name} — {user?.role}
            </span>
            <Link
              href={user?.role === 'CLIENT' ? '/client' : '/admin'}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent hover:text-white transition-colors"
            >
              Mon Espace
            </Link>
            <button
              onClick={logout}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-red-400 transition-colors"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/client" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors">
              Espace Client
            </Link>
            <Link href="/auth/admin" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
              Staff Portal
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl border-2 border-[#8B3A1A] transition-transform group-hover:scale-105">
              <Image
                src="/logo_hambol.jpg"
                alt="Espace Hambol Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-title text-lg font-bold tracking-tight text-[#8B3A1A] hidden sm:block">
              ESPACE HAMBOL
            </span>
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 font-body text-sm font-semibold text-[#6B5C4E]">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`transition-colors hover:text-[#8B3A1A] ${
                pathname === link.href ? "text-[#8B3A1A] border-b-2 border-[#8B3A1A]" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <SiteSwitcher />
          <Link 
            href="/reservations"
            className="bg-[#8B3A1A] hover:bg-[#5C2410] text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            RÉSERVER
          </Link>
        </div>
      </div>
    </header>
  );
}
