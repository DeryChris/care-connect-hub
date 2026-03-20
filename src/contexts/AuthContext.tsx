// src/contexts/AuthContext.tsx
// Real JWT authentication — replaces the mock version.
// The EXTERNAL interface (useAuth, isAuthenticated, isAdmin, user shape) is
// IDENTICAL to the mock version so no page components need to change.

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/lib/constants';
import { setAccessToken, api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialised, setInitialised] = useState(false);

  // On mount — attempt silent token refresh using the httpOnly refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          const { accessToken } = data.data;
          setAccessToken(accessToken);

          // Fetch full user profile
          const userRes = await api.get<{ data: User }>('/users/me');
          setUser(userRes.data);
        }
      } catch {
        // No valid session — user must log in
      } finally {
        setInitialised(true);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<{ data: { accessToken: string; user: User } }>(
        '/auth/login',
        { email, password },
      );
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore — clear local state regardless
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  // Show a spinner while we check for an existing session
  if (!initialised) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
