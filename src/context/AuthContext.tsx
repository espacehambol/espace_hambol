'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type StaffPosition = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'RECEPTION' | 'CHEF_CUISINIER' | 'HOUSEKEEPING' | 'STAFF' | null;
type Role = 'CLIENT' | 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | null;

interface AuthUser {
  id?: string;
  name: string;
  email?: string;
  role: Role;
  position: StaffPosition;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, role: Role, position?: StaffPosition, name?: string, id?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('hambol_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, role: Role, position: StaffPosition = null, name?: string, id?: string) => {
    const authUser: AuthUser = {
      id,
      name: name || email.split('@')[0],
      email,
      role,
      position: position || (role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : role === 'ADMIN' ? 'ADMIN' : null),
    };
    setUser(authUser);
    localStorage.setItem('hambol_user', JSON.stringify(authUser));

    if (role === 'CLIENT') router.push('/client');
    else router.push('/admin');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hambol_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
