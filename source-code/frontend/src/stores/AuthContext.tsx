import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasMinRole: (role: string) => boolean;
}

const ROLE_LEVELS: Record<string, number> = {
  super_admin: 5,
  admin: 4,
  researcher: 3,
  analyst: 2,
  viewer: 1,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('geostratum_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('geostratum_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<User>('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('geostratum_user', JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem('geostratum_token');
        localStorage.removeItem('geostratum_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', { email, password });
    localStorage.setItem('geostratum_token', res.data.access_token);
    localStorage.setItem('geostratum_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('geostratum_token');
    localStorage.removeItem('geostratum_user');
    setUser(null);
  };

  const hasMinRole = (role: string) => {
    if (!user) return false;
    const req = ROLE_LEVELS[role] ?? 0;
    return user.roles.some((r) => (ROLE_LEVELS[r] ?? 0) >= req);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasMinRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
