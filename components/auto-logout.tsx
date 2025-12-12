'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes (stricter security)

export default function AutoLogout() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const listenersAttached = useRef(false);
  const setupLoggedRef = useRef<string | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timeoutRef.current = setTimeout(async () => {
      console.log('[AutoLogout] Idle timeout reached, logging out...');
      await logout();
      router.push('/login?reason=timeout');
    }, IDLE_TIMEOUT);
  }, [clearTimer, logout, router]);

  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (timeoutRef.current) {
      clearTimer();
      startTimer();
    }
  }, [clearTimer, startTimer]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      clearTimer();
      if (listenersAttached.current) {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => window.removeEventListener(event, handleActivity));
        listenersAttached.current = false;
      }
      setupLoggedRef.current = null;
      return;
    }

    if (!listenersAttached.current) {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, handleActivity, { passive: true });
      });
      listenersAttached.current = true;
    }

    startTimer();

    if (setupLoggedRef.current !== user.email) {
      console.log('[AutoLogout] Setup complete for user:', user.email);
      setupLoggedRef.current = user.email;
    }

    return () => {
      clearTimer();
    };
  }, [user, loading, handleActivity, clearTimer, startTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!user) return;
      
      if (document.visibilityState === 'visible') {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        if (timeSinceLastActivity >= IDLE_TIMEOUT) {
          console.log('[AutoLogout] Tab visible after idle timeout, logging out...');
          logout();
          router.push('/login?reason=timeout');
        } else {
          startTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, logout, router, startTimer]);

  return null;
}
