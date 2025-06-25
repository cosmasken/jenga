
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  address: string;
  balance: number;
  isConnected: boolean;
  isFirstTime?: boolean;
  profile?: {
    name: string;
    location: string;
    dailyGoal: string;
    preferredCurrency: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (address: string) => void;
  logout: () => void;
  completeOnboarding: (profile: any) => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (address: string) => {
    // Mock wallet connection with random balance
    const mockBalance = Math.floor(Math.random() * 500000) + 50000; // 50k-550k sats
    const isReturningUser = localStorage.getItem(`user_${address}`);
    
    setUser({
      address,
      balance: mockBalance,
      isConnected: true,
      isFirstTime: !isReturningUser
    });
  };

  const completeOnboarding = (profile: any) => {
    if (user) {
      const updatedUser = {
        ...user,
        isFirstTime: false,
        profile
      };
      setUser(updatedUser);
      localStorage.setItem(`user_${user.address}`, JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, completeOnboarding, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
