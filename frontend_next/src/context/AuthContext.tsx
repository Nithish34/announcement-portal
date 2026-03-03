"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginUser } from '@/lib/api';

interface AuthUser {
  id: string;
  teamId: string;
  role: 'PARTICIPANT' | 'ADMIN';
  result?: 'WINNER' | 'LOSER';
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setWorkflowState: (teamId: string, result: 'WINNER' | 'LOSER') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_USER_KEY = 'auth_user';
const SESSION_TOKEN_KEY = 'token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // isLoading = true while we're restoring state from sessionStorage.
  // Auth guards MUST NOT redirect while isLoading is true.
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_USER_KEY);
      const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
      if (stored && token) {
        setUser(JSON.parse(stored) as AuthUser);
      }
    } catch {
      // sessionStorage not available (e.g. SSR) — ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await loginUser(email, password);

      // Backend returns { error } on failure — no token present
      if (!data.token || !data.user) return false;

      // Map backend shape → AuthUser
      // Backend: { id, email, role, team: { id, name } }
      const authUser: AuthUser = {
        id: data.user.id,
        teamId: data.user.team?.id ?? '',
        role: data.user.role,
        email: data.user.email,
      };

      sessionStorage.setItem(SESSION_TOKEN_KEY, data.token);
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(authUser));

      setUser(authUser);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
    setUser(null);
  };

  // ── Workflow helper (for /workflow test page) ─────────────────────────────
  const setWorkflowState = (teamId: string, result: 'WINNER' | 'LOSER') => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, teamId, result };
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setWorkflowState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
