'use client';

import { useLanguage } from '@/contexts/language-context';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isTransitioning, isHydrated } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div 
        className={`w-full flex justify-center transition-all duration-150 ease-out ${
          isHydrated && isTransitioning 
            ? 'blur-[1px] opacity-70 scale-[0.998]' 
            : 'blur-0 opacity-100 scale-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
