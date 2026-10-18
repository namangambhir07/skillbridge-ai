import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  profile: any;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User, profile?: any) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickDemoLogin: (role: 'candidate' | 'employer' | 'mentor' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('skillbridge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('skillbridge_token');
    if (!savedToken) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<{ user: User; profile: any }>('/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      localStorage.removeItem('skillbridge_token');
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: User, newProfile?: any) => {
    localStorage.setItem('skillbridge_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile || null);
  };

  const logout = () => {
    localStorage.removeItem('skillbridge_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const quickDemoLogin = async (role: 'candidate' | 'employer' | 'mentor' | 'admin') => {
    setIsLoading(true);
    try {
      const credentials: Record<string, { email: string; password: string }> = {
        candidate: { email: 'candidate@skillbridge.ai', password: 'Candidate123!' },
        employer: { email: 'employer@skillbridge.ai', password: 'Employer123!' },
        mentor: { email: 'mentor@skillbridge.ai', password: 'Mentor123!' },
        admin: { email: 'admin@skillbridge.ai', password: 'Admin123!' },
      };

      const cred = credentials[role];
      const res = await api.post<{ token: string; user: User; profile: any }>('/auth/login', cred);
      login(res.token, res.user, res.profile);
    } catch (err) {
      console.error('Demo login error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        logout,
        refreshUser,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
