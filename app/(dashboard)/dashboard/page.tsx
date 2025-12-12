import { getSessionUser } from '@/lib/auth/session';
import { getCachedLatestOrdersForUser } from '@/lib/orders';
import { getCachedLatestDepositsForUser } from '@/lib/deposits';
import { getCachedLatestWithdrawalsForUser } from '@/lib/withdrawals';
import { getCachedLatestTransfersForUser } from '@/lib/transfers';
import { getPointsHistory } from '@/lib/points';
import DashboardContent from './dashboard-content';
import { formatDateWIB } from '@/lib/formatters';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function computeOrderStatus(status: string, expiresAt: Date | string | null, proofUploadedAt: Date | string | null, transactionType: string): string {
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'expired') return 'expired';
  if (status === 'processing') return 'processing';
  if (status === 'confirmed') return 'processing';
  
  // BUY orders should never expire - user already paid with saldo
  if (transactionType === 'buy') return status;
  
  // SELL orders with proof uploaded - show as verifying
  if (proofUploadedAt && transactionType === 'sell') return 'verifying';
  
  if (status === 'pending' && expiresAt) {
    const expiryTime = new Date(expiresAt).getTime();
    const now = Date.now();
    if (expiryTime < now) {
      return 'expired';
    }
  }
  
  return status;
}

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

export default async function DashboardPage() {
  const user = await getSessionUser();
  
  if (!user) {
    return null;
  }

  const [userOrders, userDeposits, userWithdrawals, userTransfers, pointsData] = await Promise.all([
    getCachedLatestOrdersForUser(user.id, user.email, 10),
    getCachedLatestDepositsForUser(user.id, 10),
    getCachedLatestWithdrawalsForUser(user.id, 10),
    getCachedLatestTransfersForUser(user.id, 10),
    getPointsHistory(user.id),
  ]);

  const serializedOrders = userOrders.map(order => {
    const createdAtDate = order.created_at instanceof Date ? order.created_at : new Date(order.created_at);
    const expiresAtDate = order.expires_at instanceof Date ? order.expires_at : (order.expires_at ? new Date(order.expires_at) : null);
    
    const created_at = formatDateWIB(createdAtDate);
    const expires_at = expiresAtDate ? formatDateWIB(expiresAtDate) : null;
    
    const actualStatus = computeOrderStatus(order.status, expiresAtDate, order.proof_uploaded_at, order.transaction_type);
    
    return {
      ...order,
      status: actualStatus,
      db_status: order.status,
      created_at,
      created_at_raw: createdAtDate.getTime(),
      expires_at,
    };
  });

  const serializedDeposits = userDeposits.map(deposit => {
    const createdAtDate = deposit.created_at instanceof Date ? deposit.created_at : new Date(deposit.created_at);
    const expiresAtDate = deposit.expires_at instanceof Date ? deposit.expires_at : (deposit.expires_at ? new Date(deposit.expires_at) : null);
    
    const created_at = formatDateWIB(createdAtDate);
    const expires_at = expiresAtDate ? formatDateWIB(expiresAtDate) : null;
    const completed_at = deposit.completed_at 
      ? formatDateWIB(deposit.completed_at instanceof Date ? deposit.completed_at : new Date(deposit.completed_at))
      : null;
    
    const actualStatus = computeDepositStatus(deposit.status, expiresAtDate);
    
    return {
      ...deposit,
      status: actualStatus,
      db_status: deposit.status,
      created_at,
      created_at_raw: createdAtDate.getTime(),
      expires_at,
      confirmed_at: completed_at,
    };
  });

  const serializedWithdrawals = userWithdrawals.map(withdrawal => {
    const createdAtDate = withdrawal.createdAt instanceof Date ? withdrawal.createdAt : new Date(withdrawal.createdAt);
    const created_at = formatDateWIB(createdAtDate);
    
    return {
      ...withdrawal,
      created_at,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  const serializedTransfers = userTransfers.map(transfer => {
    const createdAtDate = transfer.createdAt instanceof Date ? transfer.createdAt : new Date(transfer.createdAt);
    const created_at = formatDateWIB(createdAtDate);
    
    return {
      ...transfer,
      created_at,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  const serializedPointTransactions = pointsData.transactions.map(pt => {
    const createdAtDate = new Date(pt.createdAt);
    const created_at = formatDateWIB(createdAtDate);
    
    return {
      ...pt,
      created_at,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  return (
    <DashboardContent 
      user={user} 
      userOrders={serializedOrders} 
      userDeposits={serializedDeposits}
      userWithdrawals={serializedWithdrawals}
      userTransfers={serializedTransfers}
      userPointTransactions={serializedPointTransactions}
      pointsBalance={pointsData.currentBalance}
    />
  );
}
