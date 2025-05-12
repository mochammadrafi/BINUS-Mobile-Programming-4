import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define user interface
export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// Dummy user data
const DUMMY_USER: User = {
  id: 'user123',
  name: 'User Demo',
  email: 'user@example.com',
  picture: 'https://ui-avatars.com/api/?name=User+Demo&background=0D8ABC&color=fff'
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from storage on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Sign in with dummy user
  const signIn = async () => {
    try {
      setIsLoading(true);
      
      // Save dummy user data to storage
      await AsyncStorage.setItem('user', JSON.stringify(DUMMY_USER));
      
      setUser(DUMMY_USER);
      
      // Use direct navigation rather than replace to avoid navigation issues
      router.navigate('/(app)/home');
    } catch (error) {
      console.error('Sign In Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      
      // Navigate without replace to prevent issues
      router.navigate('/(auth)/login');
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
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
