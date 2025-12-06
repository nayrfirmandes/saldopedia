'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function AutoLogout() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isSetupRef = useRef<boolean>(false);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    clearTimer();

    timeoutRef.current = setTimeout(async () => {
      console.log('[AutoLogout] Idle timeout reached, logging out...');
      await logout();
      router.push('/login?reason=timeout');
    }, IDLE_TIMEOUT);
  }, [clearTimer, logout, router]);

  const handleVisibilityChange = useCallback(() => {
    if (!user) return;
    
    if (document.visibilityState === 'visible') {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity >= IDLE_TIMEOUT) {
        console.log('[AutoLogout] Tab visible after idle timeout, logging out...');
        logout();
        router.push('/login?reason=timeout');
      } else {
        resetTimer();
      }
    }
  }, [user, logout, router, resetTimer]);

  // Main effect for setting up/cleaning up auto-logout
  useEffect(() => {
    // Still loading auth state - wait
    if (loading) {
      return;
    }

    // No user - cleanup and wait
    if (!user) {
      clearTimer();
      isSetupRef.current = false;
      return;
    }

    // User exists - setup auto-logout if not already setup
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Setup event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the timer
    resetTimer();
    isSetupRef.current = true;
    console.log('[AutoLogout] Setup complete for user:', user.email);

    return () => {
      clearTimer();
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      isSetupRef.current = false;
    };
  }, [user, loading, resetTimer, handleVisibilityChange, clearTimer]);

  // Additional effect to handle route changes - ensure timer persists across navigation
  useEffect(() => {
    if (user && isSetupRef.current) {
      // Reset activity timestamp on any route change to prevent false timeouts
      lastActivityRef.current = Date.now();
    }
  }, [user]);

  return null;
}
