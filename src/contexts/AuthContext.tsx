// src/contexts/AuthContext.tsx
// The refresh-to-login bug is caused by three things working against each other:
//   1. AuthContext starts with user=null and blocks ALL rendering with a spinner
//      until /auth/refresh resolves — AppLayout never even renders.
//   2. AppLayout reads isAuthenticated (false during refresh) and redirects.
//   3. No localStorage cache means there's nothing to show during the ~200ms window.
//
// Fix strategy:
//   A. Save user to localStorage on login. Restore it IMMEDIATELY on mount.
//   B. Expose `initialising` (true while refresh is in-flight).
//   C. Never block rendering inside AuthContext — let AppLayout handle the spinner.
//   D. If refresh fails → clear storage → force login.
//   E. In dev mode, if backend is unreachable, keep localStorage user (allows
//      frontend-only work without the backend running).

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/lib/constants';
import { setAccessToken, api } from '@/lib/api';

const STORAGE_KEY = 'hmis_user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  initialising: boolean;   // true while /auth/refresh is in flight on page load
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

// ── Storage helpers ───────────────────────────────────────────────────────────
function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch { return null; }
}

function persistUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Restore cached user IMMEDIATELY — no flash, no blank screen
  const [user, setUser]               = useState<User | null>(() => loadStoredUser());
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Attempt silent token refresh using the httpOnly cookie
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.data?.accessToken ?? null);

          // Re-fetch full user profile to get latest permissions/role
          try {
            const userRes = await api.get<{ data: User }>('/users/me');
            if (!cancelled) {
              setUser(userRes.data);
              persistUser(userRes.data);
            }
          } catch {
            // /users/me failed but token is valid — keep the cached user
          }
        } else {
          // Refresh token invalid or expired — must log in again
          if (!cancelled) {
            setAccessToken(null);
            setUser(null);
            persistUser(null);
          }
        }
      } catch {
        // Network error — backend is not reachable.
        if (process.env.NODE_ENV === 'development') {
          // In dev: keep the localStorage user so frontend work is not blocked.
          console.warn('[Auth] Backend unreachable — using cached session for development.');
        } else {
          // In production: a network error means the session is gone.
          if (!cancelled) {
            setAccessToken(null);
            setUser(null);
            persistUser(null);
          }
        }
      } finally {
        if (!cancelled) setInitialising(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<{ data: { accessToken: string; user: User } }>(
        '/auth/login',
        { email, password },
      );
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      persistUser(res.data.user);
      return true;
    } catch { return false; }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    finally {
      setAccessToken(null);
      setUser(null);
      persistUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      initialising,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};