import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shopApi } from '@/services/api';

export interface User {
  id: string;
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    loadAuthData();

    // Listen for global 401 unauthorized events emitted from api.ts interceptor
    const subscription = DeviceEventEmitter.addListener('onUnauthorized', () => {
      logout();
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadAuthData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        // Optimistic UI update
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);

        // Verify token with backend
        try {
          const response = await shopApi.get('/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          const fetchedUser = response.data?.data || response.data;
          if (fetchedUser && fetchedUser.id) {
             setUser(fetchedUser);
             await AsyncStorage.setItem('user', JSON.stringify(fetchedUser));
          }
        } catch (error: any) {
          // If the backend rejects the token, force a logout
          if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
            await logout();
          }
        }
      }
    } catch (e) {
      console.error('Failed to load auth data:', e);
    }
  };

  const login = async (newToken: string, userData: User) => {
    try {
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error('Failed to save auth data:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (e) {
      console.error('Failed to logout:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
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
