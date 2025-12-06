'use client';

import Header from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { SessionUser } from '@/lib/auth/session';

interface DashboardLayoutClientProps {
  user: SessionUser;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  return (
    <>
      <Header />
      <main className="grow pt-20 md:pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <Footer border={true} />
    </>
  );
}
