'use client';

import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/language-context';

interface LangBlurProps {
  children: ReactNode;
  className?: string;
}

export function LangBlur({ children, className = '' }: LangBlurProps) {
  const { isTransitioning, isHydrated } = useLanguage();

  return (
    <div
      className={`transition-all duration-150 ease-out ${
        isHydrated && isTransitioning 
          ? 'blur-[1px] opacity-70' 
          : 'blur-0 opacity-100'
      } ${className}`}
    >
      {children}
    </div>
  );
}
