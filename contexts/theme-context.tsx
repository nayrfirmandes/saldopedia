'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isAutoMode: boolean;
  resetToAutoMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemPreference(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (mediaQuery.media === 'not all') {
    return null;
  }
  return mediaQuery.matches ? 'dark' : 'light';
}

function getThemeBasedOnTime(): Theme {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

function getAutoTheme(): Theme {
  const systemPref = getSystemPreference();
  if (systemPref !== null) {
    return systemPref;
  }
  return getThemeBasedOnTime();
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const savedTheme = localStorage.getItem('theme');
  const manualOverride = localStorage.getItem('theme-manual-override');
  
  if (manualOverride === 'true' && savedTheme) {
    return savedTheme as Theme;
  }
  
  return getAutoTheme();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const manualOverride = localStorage.getItem('theme-manual-override');
    
    if (manualOverride === 'true' && savedTheme) {
      setThemeState(savedTheme as Theme);
      setIsAutoMode(false);
    } else {
      setThemeState(getAutoTheme());
      setIsAutoMode(true);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const updateThemeColor = (bgColor: string) => {
      let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      if (meta.content !== bgColor) {
        meta.content = bgColor;
      }
    };

    const updateTheme = (newTheme: Theme) => {
      const isDark = newTheme === 'dark';
      const bgColor = isDark ? '#111827' : '#f9fafb';
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      document.documentElement.style.backgroundColor = bgColor;
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      
      updateThemeColor(bgColor);
      
      localStorage.setItem('theme', newTheme);
    };

    updateTheme(theme);
    
    const syncInterval = setInterval(() => {
      const isDark = theme === 'dark';
      const bgColor = isDark ? '#111827' : '#f9fafb';
      updateThemeColor(bgColor);
    }, 1000);
    
    return () => clearInterval(syncInterval);
  }, [theme]);

  useEffect(() => {
    if (!isAutoMode) return;

    const checkAndUpdateTheme = () => {
      const autoTheme = getAutoTheme();
      if (autoTheme !== theme) {
        setThemeState(autoTheme);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndUpdateTheme();
      }
    };

    const handleSystemPreferenceChange = (e: MediaQueryListEvent) => {
      if (isAutoMode) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    checkAndUpdateTheme();
    
    const interval = setInterval(checkAndUpdateTheme, 60 * 1000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemPreferenceChange);
    } else {
      mediaQuery.addListener(handleSystemPreferenceChange);
    }

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemPreferenceChange);
      } else {
        mediaQuery.removeListener(handleSystemPreferenceChange);
      }
    };
  }, [isAutoMode, theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme-manual-override', 'true');
    setIsAutoMode(false);
  };

  const resetToAutoMode = useCallback(() => {
    localStorage.removeItem('theme-manual-override');
    setIsAutoMode(true);
    const autoTheme = getAutoTheme();
    setThemeState(autoTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isAutoMode, resetToAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
