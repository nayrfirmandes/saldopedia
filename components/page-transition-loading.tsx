'use client';

import { useEffect, useState, useRef, createContext, useContext, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface LoadingContextType {
  showLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export function usePageLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('usePageLoading must be used within PageTransitionLoading');
  }
  return context;
}

function TelegramSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-9 h-9">
        <svg
          className="w-full h-full"
          viewBox="0 0 36 36"
          style={{
            animation: 'telegram-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        >
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="70 30"
            className="text-blue-600 dark:text-blue-400"
          />
        </svg>
      </div>
      <span 
        className="text-sm font-medium text-gray-500 dark:text-gray-400"
        style={{
          animation: 'telegram-fade-text 1.5s ease-in-out infinite'
        }}
      >
        Loading...
      </span>
      <style jsx>{`
        @keyframes telegram-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes telegram-fade-text {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function PageTransitionLoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const loadingRef = useRef(false);

  const triggerLoading = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    requestAnimationFrame(() => setVisible(true));
    
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, 500);
    
    const hideTimer = setTimeout(() => {
      setLoading(false);
      loadingRef.current = false;
    }, 700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      loadingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!loadingRef.current) {
      return triggerLoading();
    }
  }, [pathname, triggerLoading]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (!href) return;
      
      if (
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        anchor.getAttribute('target') === '_blank' ||
        anchor.getAttribute('download') !== null ||
        e.ctrlKey || e.metaKey || e.shiftKey
      ) {
        return;
      }
      
      if (href === pathname || href === pathname + '/') {
        return;
      }
      
      triggerLoading();
    };

    document.addEventListener('click', handleClick, true);
    
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [pathname, triggerLoading]);

  const showLoading = useCallback(() => {
    triggerLoading();
  }, [triggerLoading]);

  return (
    <LoadingContext.Provider value={{ showLoading }}>
      {loading && (
        <div 
          className="fixed inset-0 z-[9999] bg-gray-50/98 dark:bg-gray-900/98 backdrop-blur-sm flex items-center justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <TelegramSpinner />
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export default function PageTransitionLoading() {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    setLoading(true);
    requestAnimationFrame(() => setVisible(true));
    
    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, 500);
    
    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-gray-50/98 dark:bg-gray-900/98 backdrop-blur-sm flex items-center justify-center"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <TelegramSpinner />
    </div>
  );
}
