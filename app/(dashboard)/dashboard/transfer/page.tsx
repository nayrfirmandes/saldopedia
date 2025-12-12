import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import TransferContent from './transfer-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TransferPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  return <TransferContent user={user} />;
}
