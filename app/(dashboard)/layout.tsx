import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import DashboardLayoutClient from './layout-client';

export const metadata = {
  title: 'Dashboard - Saldopedia',
  description: 'Kelola transaksi dan saldo Anda',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
