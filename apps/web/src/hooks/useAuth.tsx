import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError, onUnauthorized } from '../lib/api';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  permissions: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasPerm: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const hasPermission = (user: AuthUser | null, permission: string): boolean => {
  if (!user) return false;
  return user.permissions.includes('*') || user.permissions.includes(permission);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.me();
      setUser({ id: data.userId, email: data.email, role: data.role, permissions: data.permissions });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser({ id: data.id, email: data.email, role: data.role, permissions: data.permissions });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const hasPerm = useCallback((permission: string) => hasPermission(user, permission), [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    onUnauthorized(() => setUser(null));
    return () => onUnauthorized(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh, hasPerm }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
