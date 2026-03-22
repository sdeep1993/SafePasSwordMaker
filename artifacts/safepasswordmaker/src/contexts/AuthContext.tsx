import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "contributor";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (!localStorage.getItem("spm_token")) { setLoading(false); return; }
    try {
      const me = await api.get<AuthUser>("/auth/me");
      setUser(me);
    } catch {
      localStorage.removeItem("spm_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
    localStorage.setItem("spm_token", data.token);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await api.post<{ token: string; user: AuthUser }>("/auth/register", { username, email, password });
    localStorage.setItem("spm_token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("spm_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
