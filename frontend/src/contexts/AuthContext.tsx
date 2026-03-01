import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';

const EXPO_PUBLIC_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://citytrail.onrender.com';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, phone: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function loadAuth() {
      if (!isLoaded) return;
      if (isSignedIn && clerkUser) {
        const t = await getToken();
        setToken(t);
        const role = (clerkUser.unsafeMetadata?.role as string) || 'passenger';
        const userData = {
          id: clerkUser.id,
          name: clerkUser.fullName || clerkUser.username || '',
          email: clerkUser.primaryEmailAddress?.emailAddress || '',
          phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
          role: role
        };
        setUser(userData);

        // No need to sync with backend explicitly, backend uses Clerk SDK directly
      } else {
        setToken(null);
        setUser(null);
      }
    }
    loadAuth();
  }, [isLoaded, isSignedIn, clerkUser]);

  const logout = async () => {
    await signOut();
  };

  const login = async () => { };
  const register = async () => { };

  return (
    <AuthContext.Provider value={{ user, token, loading: !isLoaded, logout, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
