import { getSessionUser } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { formatDateWIB } from '@/lib/formatters';
import { getWithdrawalById } from '@/lib/withdrawals';
import WithdrawalDetailContent from './withdrawal-detail-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    withdrawalId: string;
  }>;
}

export default async function WithdrawalDetailPage({ params }: PageProps) {
  const { withdrawalId } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/withdrawals/${withdrawalId}`);
  }

  const withdrawal = await getWithdrawalById(withdrawalId);

  if (!withdrawal) {
    notFound();
  }

  if (withdrawal.userId !== user.id) {
    notFound();
  }

  const createdAtDate = withdrawal.createdAt instanceof Date ? withdrawal.createdAt : new Date(withdrawal.createdAt);
  const processedAtDate = withdrawal.processedAt instanceof Date ? withdrawal.processedAt : (withdrawal.processedAt ? new Date(withdrawal.processedAt) : null);
  const completedAtDate = withdrawal.completedAt instanceof Date ? withdrawal.completedAt : (withdrawal.completedAt ? new Date(withdrawal.completedAt) : null);
  
  const serializedWithdrawal = {
    withdrawalId: withdrawal.withdrawalId,
    userId: withdrawal.userId,
    amount: withdrawal.amount.toString(),
    fee: withdrawal.fee.toString(),
    netAmount: withdrawal.netAmount.toString(),
    method: withdrawal.method,
    bankCode: withdrawal.bankCode,
    accountName: withdrawal.accountName,
    accountNumber: withdrawal.accountNumber,
    status: withdrawal.status,
    adminNotes: withdrawal.adminNotes,
    createdAt: formatDateWIB(createdAtDate),
    processedAt: processedAtDate ? formatDateWIB(processedAtDate) : null,
    completedAt: completedAtDate ? formatDateWIB(completedAtDate) : null,
  };

  return <WithdrawalDetailContent withdrawal={serializedWithdrawal} />;
}
