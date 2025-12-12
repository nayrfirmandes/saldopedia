import { getSessionUser } from '@/lib/auth/session';
import { getCachedOrderById } from '@/lib/orders';
import { redirect, notFound } from 'next/navigation';
import OrderDetailContent from './order-detail-content';
import { formatDateWIB } from '@/lib/formatters';

export const revalidate = 10;

function computeActualStatus(status: string, expiresAt: Date | string | null): string {
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'expired') return 'expired';
  if (status === 'processing') return 'processing';
  if (status === 'confirmed') return 'processing';
  
  if (status === 'pending' && expiresAt) {
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
    orderId: string;
  }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?redirect=/order/${orderId}`);
  }

  const order = await getCachedOrderById(orderId);

  if (!order) {
    notFound();
  }

  if (order.user_id !== user.id && order.customer_email !== user.email) {
    notFound();
  }

  const actualStatus = computeActualStatus(order.status, order.expires_at);
  
  // Format dates server-side to ensure consistent WIB timezone display
  const createdAtDate = order.created_at instanceof Date ? order.created_at : new Date(order.created_at);
  const expiresAtDate = order.expires_at instanceof Date ? order.expires_at : (order.expires_at ? new Date(order.expires_at) : null);
  
  const completedAtDate = order.completed_at instanceof Date 
    ? order.completed_at 
    : (order.completed_at ? new Date(order.completed_at) : null);
  
  const orderWithActualStatus = {
    ...order,
    status: actualStatus,
    created_at: formatDateWIB(createdAtDate),
    expires_at: expiresAtDate ? formatDateWIB(expiresAtDate) : null,
    completed_at: completedAtDate ? formatDateWIB(completedAtDate) : null,
  };

  return <OrderDetailContent order={orderWithActualStatus} />;
}
