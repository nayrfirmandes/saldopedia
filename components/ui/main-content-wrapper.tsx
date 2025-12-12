'use client';

import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface MainContentWrapperProps {
  children: ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { isTransitioning, isHydrated } = useLanguage();

  return (
    <main 
      className={`grow transition-all duration-150 ease-out ${
        isHydrated && isTransitioning 
          ? 'blur-[1px] opacity-70 scale-[0.998]' 
          : 'blur-0 opacity-100 scale-100'
      }`}
    >
      {children}
    </main>
  );
}
