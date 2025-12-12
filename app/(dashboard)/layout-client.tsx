'use client';

import Header from '@/components/ui/header';
import FooterMinimal from '@/components/ui/footer-minimal';
import { SessionUser } from '@/lib/auth/session';
import { useLanguage } from '@/contexts/language-context';

interface DashboardLayoutClientProps {
  user: SessionUser;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const { isTransitioning, isHydrated } = useLanguage();

  return (
    <>
      <Header />
      <main 
        className={`grow pt-20 md:pt-24 transition-all duration-150 ease-out ${
          isHydrated && isTransitioning 
            ? 'blur-[1px] opacity-70 scale-[0.998]' 
            : 'blur-0 opacity-100 scale-100'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <FooterMinimal />
    </>
  );
}
