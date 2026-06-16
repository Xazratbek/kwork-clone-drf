"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, auth, type AuthState } from "@/lib/api";

interface AuthContextType {
  user: Record<string, unknown> | null;
  loading: boolean;
  login: (payload: { login: string; password: string }) => Promise<void>;
  signup: (payload: Record<string, string>) => Promise<void>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  reloadUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    if (!auth.get()?.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      auth.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    const off = auth.onChange(() => loadUser());
    return off;
  }, []);

  const login = async (payload: { login: string; password: string }) => {
    await api.login(payload);
    await loadUser();
  };

  const signup = async (payload: Record<string, string>) => {
    await api.signup(payload);
    await loadUser();
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
