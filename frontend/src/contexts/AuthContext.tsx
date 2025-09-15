import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, role?: 'explorer' | 'creator') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Validate token by fetching current user
        try {
          const currentUser = await authAPI.getCurrentUser(storedToken);
          setUser(currentUser);
        } catch (error) {
          // Token is invalid, clear stored auth
          await clearAuth();
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response;
      
      // Get user info
      const userData = await authAPI.getCurrentUser(access_token);
      
      // Store auth data
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, fullName?: string, role: 'explorer' | 'creator' = 'explorer') => {
    try {
      await authAPI.register(email, password, fullName, role);
      // After registration, automatically log in
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const clearAuth = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const logout = async () => {
    await clearAuth();
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
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
