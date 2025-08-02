import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    // Initialize user from localStorage if available
    const savedUser = localStorage.getItem('krishakSure_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user exists in localStorage immediately
    const savedUser = localStorage.getItem('krishakSure_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('krishakSure_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('krishakSure_user');
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      // Mock authentication
      setUser({ email, uid: 'mock-user-id' });
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to KrishakSure.",
      });
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Mock authentication
      setUser({ email, uid: 'mock-user-id' });
      toast({
        title: "Welcome to KrishakSure!",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};