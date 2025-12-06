'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, startTransition } from 'react';
import translationsId from '@/locales/id.json';
import translationsEn from '@/locales/en.json';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsMap = {
  id: translationsId,
  en: translationsEn,
};

export function LanguageProvider({ children, initialLanguage = 'id' }: { children: ReactNode; initialLanguage?: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'id' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
    hasHydratedRef.current = true;
  }, []);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    
    if (hasHydratedRef.current) {
      startTransition(() => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
      });
    } else {
      setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    const translations = translationsMap[language];
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
