import { getSessionUser } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { formatDateWIB } from '@/lib/formatters';
import { getDepositById } from '@/lib/deposits';
import { getAdminPaymentConfig } from '@/lib/payment-config';
import DepositDetailContent from './deposit-detail-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function computeDepositStatus(status: string, expiresAt: Date | string | null): string {
  if (status === 'completed') return 'completed';
  if (status === 'rejected') return 'rejected';
  if (status === 'expired') return 'expired';
  
  if ((status === 'pending' || status === 'pending_proof') && expiresAt) {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    if (expiryTime < now) {
      return 'expired';
    }
  }
  
  return status;
}

interface PageProps {
  params: Promise<{
    depositId: string;
  }>;
}

export default async function DepositDetailPage({ params }: PageProps) {
  const { depositId } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/deposits/${depositId}`);
  }

  const deposit = await getDepositById(depositId);

  if (!deposit) {
    notFound();
  }

  if (deposit.user_id !== user.id) {
    notFound();
  }

  const actualStatus = computeDepositStatus(deposit.status, deposit.expires_at);
  
  const createdAtDate = deposit.created_at instanceof Date ? deposit.created_at : new Date(deposit.created_at);
  const expiresAtDate = deposit.expires_at instanceof Date ? deposit.expires_at : (deposit.expires_at ? new Date(deposit.expires_at) : null);
  const completedAtDate = deposit.completed_at instanceof Date ? deposit.completed_at : (deposit.completed_at ? new Date(deposit.completed_at) : null);
  
  const serializedDeposit = {
    depositId: deposit.deposit_id,
    userId: deposit.user_id,
    amount: deposit.amount.toString(),
    fee: deposit.fee?.toString() || '0',
    uniqueCode: deposit.unique_code || 0,
    totalAmount: deposit.total_amount?.toString() || deposit.amount.toString(),
    method: deposit.method,
    bankCode: deposit.bank_code,
    status: actualStatus,
    adminNotes: deposit.admin_notes,
    createdAt: formatDateWIB(createdAtDate),
    expiresAt: expiresAtDate ? formatDateWIB(expiresAtDate) : null,
    completedAt: completedAtDate ? formatDateWIB(completedAtDate) : null,
  };

  const paymentConfig = getAdminPaymentConfig();
  return <DepositDetailContent deposit={serializedDeposit} paymentConfig={paymentConfig} />;
}
