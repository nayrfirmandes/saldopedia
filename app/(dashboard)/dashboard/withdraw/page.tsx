import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import WithdrawContent from './withdraw-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WithdrawPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  return <WithdrawContent user={user} />;
}
