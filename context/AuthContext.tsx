import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, UserRole } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
  login: (employee: AuthUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, 'Super Admin', 'Admin', 'Instructor'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_auth');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('lumina_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = (employee: AuthUser) => {
    setUser(employee);
    localStorage.setItem('lumina_auth', JSON.stringify(employee));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumina_auth');
  };

  const isAdmin = user !== null && ADMIN_ROLES.includes(user.role);
  const isEmployee = user !== null && !ADMIN_ROLES.includes(user.role);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      isAdmin,
      isEmployee,
      login,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
