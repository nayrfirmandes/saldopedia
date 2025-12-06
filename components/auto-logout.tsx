'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function AutoLogout() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const isSetupRef = useRef<boolean>(false);
  const logoutRef = useRef(logout);
  const userRef = useRef(user);

  useEffect(() => {
    logoutRef.current = logout;
    userRef.current = user;
  }, [logout, user]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      isSetupRef.current = false;
      return;
    }

    if (isSetupRef.current) return;

    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const startTimer = () => {
      clearTimer();
      timeoutRef.current = setTimeout(async () => {
        console.log('[AutoLogout] Idle timeout reached, logging out...');
        await logoutRef.current();
        router.push('/login?reason=timeout');
      }, IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      startTimer();
    };

    const handleVisibilityChange = () => {
      if (!userRef.current) return;
      
      if (document.visibilityState === 'visible') {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        if (timeSinceLastActivity >= IDLE_TIMEOUT) {
          console.log('[AutoLogout] Tab visible after idle timeout, logging out...');
          logoutRef.current();
          router.push('/login?reason=timeout');
        } else {
          startTimer();
        }
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    startTimer();
    isSetupRef.current = true;
    console.log('[AutoLogout] Setup complete for user:', user.email);

    return () => {
      clearTimer();
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      isSetupRef.current = false;
    };
  }, [user, loading, router]);

  return null;
}
