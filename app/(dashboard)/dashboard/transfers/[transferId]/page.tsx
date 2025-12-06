import { getSessionUser } from '@/lib/auth/session';
import { redirect, notFound } from 'next/navigation';
import { formatDateWIB } from '@/lib/formatters';
import { getTransferById } from '@/lib/transfers';
import TransferDetailContent from './transfer-detail-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    transferId: string;
  }>;
}

export default async function TransferDetailPage({ params }: PageProps) {
  const { transferId } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirect=/dashboard/transfers/${transferId}`);
  }

  const transfer = await getTransferById(transferId, user.id);

  if (!transfer) {
    notFound();
  }

  if (transfer.senderId !== user.id && transfer.receiverId !== user.id) {
    notFound();
  }

  const createdAtDate = transfer.createdAt instanceof Date ? transfer.createdAt : new Date(transfer.createdAt);
  
  const serializedTransfer = {
    transferId: transfer.transferId,
    senderId: transfer.senderId,
    receiverId: transfer.receiverId,
    senderName: transfer.senderName,
    senderEmail: transfer.senderEmail,
    receiverName: transfer.receiverName,
    receiverEmail: transfer.receiverEmail,
    amount: transfer.amount.toString(),
    notes: transfer.notes,
    type: transfer.type,
    createdAt: formatDateWIB(createdAtDate),
  };

  return <TransferDetailContent transfer={serializedTransfer} />;
}
