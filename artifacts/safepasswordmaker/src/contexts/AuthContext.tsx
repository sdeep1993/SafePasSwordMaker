import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  drupalLogin, getDrupalToken, clearDrupalToken, getDrupalCurrentUser, registerDrupalUser,
} from "@/lib/drupal";

export interface AuthUser {
  id: string;
  drupalUid: number;
  username: string;
  email: string;
  role: "admin" | "contributor";
  status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapDrupalMe(me: any): AuthUser {
  return {
    id: me.uuid?.[0]?.value || String(me.uid?.[0]?.value || ""),
    drupalUid: me.uid?.[0]?.value || 0,
    username: me.name?.[0]?.value || me.display_name || "",
    email: me.mail?.[0]?.value || "",
    role: me.roles?.some((r: any) => r.target_id === "administrator") ? "admin" : "contributor",
    status: me.status?.[0]?.value ? "active" : "pending",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = getDrupalToken();
    if (!token) { setLoading(false); return; }
    try {
      const me = await getDrupalCurrentUser();
      setUser(mapDrupalMe(me));
    } catch {
      clearDrupalToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email: string, password: string) => {
    await drupalLogin(email, password);
    const me = await getDrupalCurrentUser();
    setUser(mapDrupalMe(me));
  };

  const register = async (username: string, email: string, password: string) => {
    await registerDrupalUser(username, email, password);
    // Registration succeeds but account is blocked until admin approves
    throw new Error("__PENDING__");
  };

  const logout = () => {
    clearDrupalToken();
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
