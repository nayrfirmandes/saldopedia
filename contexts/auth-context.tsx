'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const { user: cachedUser, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - timestamp < fiveMinutes) {
          return cachedUser;
        }
      }
    } catch (error) {
      console.error('Auth cache read error:', error);
    }
    
    return null;
  });
  
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshAuth = useCallback(async (showLoading = false, force = false) => {
    if (showLoading) {
      setLoading(true);
    }
    
    // Smart optimization: Skip API call only if we recently got 401
    // BUT allow force bypass for post-login scenarios
    if (!force) {
      const shouldSkip = (() => {
        if (user) return false; // Always check if we think we're logged in
        
        try {
          const last401 = localStorage.getItem(AUTH_LAST_401_KEY);
          if (!last401) return false; // No 401 history, do the check
          
          const last401Time = parseInt(last401, 10);
          const now = Date.now();
          const fiveMinutes = 5 * 60 * 1000;
          
          // Skip only if we got 401 within last 5 minutes (definitely anonymous)
          return now - last401Time < fiveMinutes;
        } catch {
          return false; // If error, better to check
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
        // Defensive JSON parsing with validation
        try {
          const data = await response.json();
          
          // ONLY update user if valid user data exists
          if (data && data.user && typeof data.user === 'object') {
            setUser(data.user);
            
            try {
              localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
                user: data.user,
                timestamp: Date.now()
              }));
              // Clear 401 marker since we're logged in
              localStorage.removeItem(AUTH_LAST_401_KEY);
            } catch (error) {
              console.error('Auth cache write error:', error);
            }
          } else {
            // Malformed response - keep existing user, log warning
            console.warn('Profile API returned 200 but invalid user data:', data);
          }
        } catch (jsonError) {
          // JSON parse error - keep existing user, log error
          console.error('Failed to parse profile response:', jsonError);
        }
      } else if (response.status === 401) {
        // ONLY logout on 401 (session expired), NOT on other errors
        setUser(null);
        try {
          localStorage.removeItem(AUTH_CACHE_KEY);
          // Mark timestamp of last 401 to skip subsequent calls for 5 minutes
          localStorage.setItem(AUTH_LAST_401_KEY, Date.now().toString());
        } catch (error) {
          console.error('Auth cache clear error:', error);
        }
      }
      // Ignore other errors (500, network blips) - keep user logged in
    } catch (error) {
      // Network errors - keep user logged in, don't clear session
      console.error('Auth refresh network error:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [user]);

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
    // Silent background refresh - no loading spinner
    refreshAuth(false, true);

    // AUTO LOGOUT: Periodic session check setiap 5 menit
    const intervalId = setInterval(() => {
      refreshAuth(false, false);
    }, 5 * 60 * 1000); // 5 minutes

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
