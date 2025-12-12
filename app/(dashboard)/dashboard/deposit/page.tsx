import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getAdminPaymentConfig } from '@/lib/payment-config';
import DepositContent from './deposit-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DepositPage() {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  const paymentConfig = getAdminPaymentConfig();
  return <DepositContent user={user} paymentConfig={paymentConfig} />;
}
