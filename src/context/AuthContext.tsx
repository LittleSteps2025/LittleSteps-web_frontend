import { createContext, useContext, useState, useMemo } from 'react';
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
  session_id?: string; // Added session_id for supervisors
  school_id?: string; // Optional school identifier
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isSupervisor: boolean;
  currentSession: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user data', e);
        return null;
      }
    }
    return null;
  });

  const login = (userData: User, token: string) => {
    const userWithToken = { 
      ...userData, 
      token,
      // Ensure session_id is preserved if present in userData
      session_id: userData.session_id || undefined
    };
    setUser(userWithToken);
    localStorage.setItem('user', JSON.stringify(userWithToken));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Memoized context value
  const value = useMemo(() => ({
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isSupervisor: user?.role === 'supervisor',
    currentSession: user?.session_id || null
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Type guard for checking if user is supervisor with session
export function isSupervisorWithSession(user: User | null): user is User & { role: 'supervisor', session_id: string } {
  return user?.role === 'supervisor' && !!user.session_id;
}