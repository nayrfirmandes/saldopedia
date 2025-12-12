'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  saldo: number;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  mounted: boolean;
  refreshAuth: (showLoading?: boolean, force?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_CACHE_KEY = 'saldopedia_auth_cache';
const AUTH_LAST_401_KEY = 'saldopedia_auth_last_401';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userRef = useRef(user);
  const initialCheckDone = useRef(false);
  
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  
  useEffect(() => {
    setMounted(true);
    
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const { user: cachedUser, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - timestamp < fiveMinutes) {
          setUser(cachedUser);
        }
      }
    } catch (error) {
      console.error('Auth cache read error:', error);
    }
  }, []);

  const refreshAuth = useCallback(async (showLoading = false, force = false) => {
    if (showLoading) {
      setLoading(true);
    }
    
    if (!force) {
      const shouldSkip = (() => {
        if (userRef.current) return false;
        
        try {
          const last401 = localStorage.getItem(AUTH_LAST_401_KEY);
          if (!last401) return false;
          
          const last401Time = parseInt(last401, 10);
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          
          return now - last401Time < fiveMinutes;
        } catch {
          return false;
        }
      })();
      
      if (shouldSkip) {
        if (showLoading) {
          setLoading(false);
        }
        return;
      }
    }
    
    try {
      const response = await fetch('/api/user/profile', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (response.ok) {
        try {
          const data = await response.json();
          
          if (data && data.user && typeof data.user === 'object') {
            setUser(data.user);
            
            try {
              localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
                user: data.user,
                timestamp: Date.now()
              }));
              localStorage.removeItem(AUTH_LAST_401_KEY);
            } catch (error) {
              console.error('Auth cache write error:', error);
            }
          } else {
            console.warn('Profile API returned 200 but invalid user data:', data);
          }
        } catch (jsonError) {
          console.error('Failed to parse profile response:', jsonError);
        }
      } else if (response.status === 401) {
        setUser(null);
        try {
          localStorage.removeItem(AUTH_CACHE_KEY);
          localStorage.setItem(AUTH_LAST_401_KEY, Date.now().toString());
        } catch (error) {
          console.error('Auth cache clear error:', error);
        }
      }
    } catch (error) {
      console.error('Auth refresh network error:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      try {
        localStorage.removeItem(AUTH_CACHE_KEY);
      } catch (error) {
        console.error('Auth cache clear error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;
    
    refreshAuth(false, true);

    const intervalId = setInterval(() => {
      refreshAuth(false, false);
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [refreshAuth]);

  return (
    <AuthContext.Provider value={{ user, loading, mounted, refreshAuth, logout }}>
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
