import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import AddressesContent from './addresses-content';

export const revalidate = 0;

export default async function AddressesPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  return <AddressesContent />;
}
