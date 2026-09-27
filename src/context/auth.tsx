// src/context/auth.tsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// ========== ТИПЫ ==========

// Краткая информация о пользователе
export interface UserBrief {
  id?: string;
  name?: string;
  avatarUrl?: string;
  email?: string;
}

// Значение контекста авторизации
export interface AuthContextValue {
  user: UserBrief | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (profile: UserBrief) => void | Promise<void>;
  signOut: () => void | Promise<void>;
  updateUser: (updates: Partial<UserBrief>) => void;
}

// ========== КОНТЕКСТ ==========

const AuthContext = createContext<AuthContextValue | null>(null);

// Ключ для localStorage
const STORAGE_KEY = "rb:user";

// ========== ПРОВАЙДЕР ==========

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserBrief | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Восстановление сессии из localStorage при монтировании
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Синхронизация с localStorage при изменении пользователя
  useEffect(() => {
    if (loading) return; // Не пишем в localStorage во время загрузки

    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, loading]);

  // 3. Методы авторизации
  const signIn = (profile: UserBrief) => {
    setUser(profile);
  };

  const signOut = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<UserBrief>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  // 4. Значение контекста (мемоизированное)
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      signIn,
      signOut,
      updateUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ========== ХУК useAuth ==========

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return context;
}