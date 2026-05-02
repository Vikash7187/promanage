"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { AuthUser } from "@/types/auth";
import { getRoleRedirectPath } from "@/lib/role-redirect";

type LoginPayload = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

type SignupPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AuthUser["role"];
};

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<string>;
  signup: (payload: SignupPayload) => Promise<string>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_TOKEN_KEY = "tasknest_access_token";
const USER_KEY = "tasknest_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((token: string, userData: AuthUser) => {
    setAccessToken(token);
    setUser(userData);
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await api.post("/auth/refresh");
      setSession(data.accessToken, data.user);
    } catch {
      clearSession();
    }
  }, [setSession, clearSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { data } = await api.post("/auth/login", payload);
      setSession(data.accessToken, data.user);
      return getRoleRedirectPath(data.user.role);
    },
    [setSession]
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      const { data } = await api.post("/auth/signup", payload);
      setSession(data.accessToken, data.user);
      return getRoleRedirectPath(data.user.role);
    },
    [setSession]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const forgotPassword = useCallback(async (email: string) => {
    await api.post("/auth/forgot-password", { email });
  }, []);

  const resetPassword = useCallback(async (token: string, password: string, confirmPassword: string) => {
    await api.post("/auth/reset-password", { token, password, confirmPassword });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
        const storedUser = sessionStorage.getItem(USER_KEY);
        if (token && storedUser) {
          setAccessToken(token);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      refreshSession
    }),
    [user, accessToken, loading, login, signup, logout, forgotPassword, resetPassword, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
