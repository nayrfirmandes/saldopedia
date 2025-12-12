import { getSessionUser } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import PointDetailContent from './point-detail-content';
import { getPointTransactionDetail } from '@/lib/points';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PointDetailPage({ params }: PageProps) {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const transactionId = parseInt(id, 10);
  
  if (isNaN(transactionId)) {
    notFound();
  }

  const transaction = await getPointTransactionDetail(transactionId, user.id);
  
  if (!transaction) {
    notFound();
  }

  return <PointDetailContent transaction={transaction} />;
}
