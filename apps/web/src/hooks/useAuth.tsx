import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from '../lib/api';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.me();
      setUser({ id: data.userId, email: data.email, role: data.role });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setUser({ id: data.id, email: data.email, role: data.role });
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
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
