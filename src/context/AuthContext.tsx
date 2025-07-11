// frontend >> src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  firebaseUid: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'teacher' | 'parent';
  nic?: string;
  address?: string;
  phone?: string;
  image?: string;
  status: string;
  created_at: string;
  sup_id?: number;
  cv?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData: User, token: string) => {
    const userWithToken = { ...userData, token };
    setUser(userWithToken);
    localStorage.setItem('user', JSON.stringify(userWithToken));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };