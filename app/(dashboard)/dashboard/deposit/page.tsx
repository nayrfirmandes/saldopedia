import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import DepositContent from './deposit-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DepositPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  return <DepositContent user={user} />;
}
