"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthUser {
  teamId: string;
  role: 'participant';
  result: 'winner' | 'loser';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (teamId: string, password: string) => void;
  logout: () => void;
  setWorkflowState: (teamId: string, result: 'winner' | 'loser') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (teamId: string, password: string) => {
    // Default to winner if logging in normally, can be changed via admin control
    setUser({
      teamId,
      role: 'participant',
      result: 'winner',
    });
  };

  const logout = () => {
    setUser(null);
  };

  const setWorkflowState = (teamId: string, result: 'winner' | 'loser') => {
    setUser({
      teamId,
      role: 'participant',
      result,
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setWorkflowState }}>
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
