import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User } from '@/lib/constants';
import { mockUsers } from '@/lib/mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userHasPermission: (permission: string) => boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user;

  const userHasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    if (permission.startsWith('role:')) return user.role === permission.substring(5);
    if (permission.startsWith('designation:')) return user.designation === permission.substring(12);
    return user.permissions?.includes(permission) ?? false;
  }, [user]);

  const login = async (email: string, password?: string): Promise<boolean> => {
    // This is a mock login. In a real app, you'd validate credentials.
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && foundUser.is_active) {
      setUser(foundUser);
      return true;
    }
    setUser(null);
    return false;
  };

  const logout = () => setUser(null);
  const isAdmin = user?.role === 'admin';

  const value = { user, isAuthenticated, login, logout, userHasPermission, isAdmin };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};