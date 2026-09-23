"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, setAccessToken, getAccessToken } from "@/lib/api";
import { User } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isNewRegistration: boolean;
  clearNewRegistration: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewRegistration, setIsNewRegistration] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const clearNewRegistration = () => {
    setIsNewRegistration(false);
  };

  // 1. Initial Session Hydration (Runs ONCE on app startup/reload)
  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      setIsLoading(true);
      try {
        // api.auth.getMe uses request() which sends Bearer token if present,
        // and if missing / expired (401), automatically performs silent refresh via httpOnly cookie
        const currentUser = await api.auth.getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Client-side Route Guard (Runs when navigation occurs or user changes)
  useEffect(() => {
    if (isLoading) return;

    const isAuthPage =
      pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

    if (!user && !isAuthPage) {
      router.push("/sign-in");
    } else if (user && isAuthPage) {
      const target = isNewRegistration ? "/dashboard?onboarding=true" : "/dashboard";
      router.push(target);
    }
  }, [user, isLoading, pathname, router, isNewRegistration]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setUser(res.user);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register({ name, email, password });
      setIsNewRegistration(true);
      try {
        sessionStorage.setItem("myfin_new_user", "true");
      } catch {}
      setUser(res.user);
      router.push("/dashboard?onboarding=true");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setUser(null);
      router.push("/sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isNewRegistration,
        clearNewRegistration,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
