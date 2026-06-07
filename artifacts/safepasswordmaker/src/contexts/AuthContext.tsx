import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { drupalLogin, getDrupalToken, clearDrupalToken, getDrupalCurrentUser } from "@/lib/drupal";

const CMS_MODE = import.meta.env.VITE_CMS_MODE || "local"; // "local" | "drupal"

export interface AuthUser {
  id: number | string;
  username: string;
  email: string;
  role: "admin" | "contributor";
  status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  cmsMode: "local" | "drupal";
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    if (CMS_MODE === "drupal") {
      const token = getDrupalToken();
      if (!token) { setLoading(false); return; }
      try {
        const me = await getDrupalCurrentUser();
        setUser({
          id: me.uid?.[0]?.value,
          username: me.name?.[0]?.value || me.display_name,
          email: me.mail?.[0]?.value,
          role: me.roles?.some((r: any) => r.target_id === "administrator") ? "admin" : "contributor",
        });
      } catch {
        clearDrupalToken();
      } finally {
        setLoading(false);
      }
    } else {
      if (!localStorage.getItem("spm_token")) { setLoading(false); return; }
      try {
        const me = await api.get<AuthUser>("/auth/me");
        setUser(me);
      } catch {
        localStorage.removeItem("spm_token");
      } finally {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email: string, password: string) => {
    if (CMS_MODE === "drupal") {
      await drupalLogin(email, password);
      const me = await getDrupalCurrentUser();
      setUser({
        id: me.uid?.[0]?.value,
        username: me.name?.[0]?.value || me.display_name,
        email: me.mail?.[0]?.value,
        role: me.roles?.some((r: any) => r.target_id === "administrator") ? "admin" : "contributor",
      });
    } else {
      const data = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
      localStorage.setItem("spm_token", data.token);
      setUser(data.user);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    if (CMS_MODE === "drupal") {
      // Register via Drupal REST API (no auto-login — admin must approve)
      const drupalUrl = import.meta.env.VITE_DRUPAL_URL;
      const res = await fetch(`${drupalUrl}/user/register?_format=json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: [{ value: username }], mail: [{ value: email }], pass: [{ value: password }] }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Registration failed. Contact the administrator.");
      }
      // Don't auto-login — Drupal contributors need admin approval (blocked by default)
      throw new Error("__PENDING__"); // caught by Register page to show pending message
    } else {
      const data = await api.post<{ token: string; user: AuthUser }>("/auth/register", { username, email, password });
      localStorage.setItem("spm_token", data.token);
      setUser(data.user);
    }
  };

  const logout = () => {
    if (CMS_MODE === "drupal") {
      clearDrupalToken();
    } else {
      localStorage.removeItem("spm_token");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, cmsMode: CMS_MODE as "local" | "drupal", login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
