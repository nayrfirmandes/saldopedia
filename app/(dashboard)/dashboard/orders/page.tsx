import { getSessionUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { orders, deposits, withdrawals, saldoTransfers, users, pointTransactions } from '@/shared/schema';
import { eq, desc, or, and, sql } from 'drizzle-orm';
import OrdersList from './orders-list';
import { getDatabaseUrl } from "@/lib/db-url";
import { formatDateWIB } from '@/lib/formatters';

const sqlNeon = neon(getDatabaseUrl());
const db = drizzle(sqlNeon);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ITEMS_PER_PAGE = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const user = await getSessionUser();
  
  if (!user) {
    redirect('/login');
  }

  const params = await searchParams;
  const rawPage = parseInt(params.page || '1', 10);
  const currentFilter = params.filter || 'all';

  const ordersWhereCondition = or(
    eq(orders.userId, user.id),
    eq(orders.customerEmail, user.email)
  );

  const depositsWhereCondition = eq(deposits.userId, user.id);
  const withdrawalsWhereCondition = eq(withdrawals.userId, user.id);
  const transfersWhereCondition = or(
    eq(saldoTransfers.senderId, user.id),
    eq(saldoTransfers.receiverId, user.id)
  );

  const pointsWhereCondition = eq(pointTransactions.userId, user.id);

  // Get ALL counts fresh (no cache) to ensure accuracy
  const [orderCounts, depositCounts, withdrawalCounts, transferCounts, pointsCounts] = await Promise.all([
    db.select({
      completed: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')::int`,
      expiredDb: sql<number>`COUNT(*) FILTER (WHERE status IN ('expired', 'cancelled'))::int`,
      pendingActive: sql<number>`COUNT(*) FILTER (WHERE status IN ('pending', 'processing') AND (expires_at IS NULL OR expires_at > NOW()))::int`,
      pendingProof: sql<number>`COUNT(*) FILTER (WHERE status = 'pending_proof')::int`,
      expiredByTime: sql<number>`COUNT(*) FILTER (WHERE status = 'pending' AND expires_at IS NOT NULL AND expires_at <= NOW())::int`,
    }).from(orders).where(ordersWhereCondition),
    db.select({
      total: sql<number>`COUNT(*)::int`,
      completed: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')::int`,
      pending: sql<number>`COUNT(*) FILTER (WHERE status = 'pending' AND (expires_at IS NULL OR expires_at > NOW()))::int`,
      pendingProof: sql<number>`COUNT(*) FILTER (WHERE status = 'pending_proof' AND (expires_at IS NULL OR expires_at > NOW()))::int`,
      expired: sql<number>`COUNT(*) FILTER (WHERE status IN ('expired', 'rejected') OR (status IN ('pending', 'pending_proof') AND expires_at IS NOT NULL AND expires_at <= NOW()))::int`,
    }).from(deposits).where(depositsWhereCondition),
    db.select({
      total: sql<number>`COUNT(*)::int`,
    }).from(withdrawals).where(withdrawalsWhereCondition),
    db.select({
      total: sql<number>`COUNT(*)::int`,
    }).from(saldoTransfers).where(transfersWhereCondition!),
    db.select({
      total: sql<number>`COUNT(*)::int`,
    }).from(pointTransactions).where(pointsWhereCondition),
  ]);

  const counts = orderCounts[0] || { completed: 0, expiredDb: 0, pendingActive: 0, pendingProof: 0, expiredByTime: 0 };
  const depCounts = depositCounts[0] || { total: 0, completed: 0, pending: 0, pendingProof: 0, expired: 0 };
  const withCounts = withdrawalCounts[0] || { total: 0 };
  const transCounts = transferCounts[0] || { total: 0 };
  const ptsCounts = pointsCounts[0] || { total: 0 };
  
  const completedCount = counts.completed;
  const pendingCount = counts.pendingActive;
  const pendingProofCount = counts.pendingProof + (depCounts.pendingProof || 0);
  const expiredCount = counts.expiredDb + counts.expiredByTime;
  const totalOrderCount = completedCount + pendingCount + counts.pendingProof + expiredCount;
  const depositCount = depCounts.total;
  const withdrawalCount = withCounts.total;
  const transferCount = transCounts.total;
  const pointsCount = ptsCounts.total;

  // Calculate total pages based on current filter
  const totalAllCount = totalOrderCount + depositCount + withdrawalCount + transferCount + pointsCount;
  const filteredCount = currentFilter === 'all' ? totalAllCount :
                        currentFilter === 'completed' ? completedCount :
                        currentFilter === 'pending' ? pendingCount :
                        currentFilter === 'pending_proof' ? pendingProofCount :
                        currentFilter === 'expired' ? expiredCount :
                        currentFilter === 'deposit' ? depositCount :
                        currentFilter === 'withdrawal' ? withdrawalCount :
                        currentFilter === 'transfer' ? transferCount :
                        currentFilter === 'points' ? pointsCount : totalOrderCount;
  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

  // Clamp page to valid range [1, totalPages]
  const currentPage = Math.max(1, Math.min(rawPage, totalPages || 1));
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build filter condition combined with user scope
  let combinedOrdersWhere = ordersWhereCondition;

  if (currentFilter === 'completed') {
    combinedOrdersWhere = and(ordersWhereCondition, eq(orders.status, 'completed'));
  } else if (currentFilter === 'pending') {
    combinedOrdersWhere = and(
      ordersWhereCondition,
      or(
        eq(orders.status, 'processing'),
        and(
          eq(orders.status, 'pending'),
          sql`(expires_at IS NULL OR expires_at > NOW())`
        )
      )
    );
  } else if (currentFilter === 'pending_proof') {
    combinedOrdersWhere = and(ordersWhereCondition, eq(orders.status, 'pending_proof'));
  } else if (currentFilter === 'expired') {
    combinedOrdersWhere = and(
      ordersWhereCondition,
      or(
        eq(orders.status, 'expired'),
        eq(orders.status, 'cancelled'),
        and(
          eq(orders.status, 'pending'),
          sql`expires_at IS NOT NULL AND expires_at <= NOW()`
        )
      )
    );
  }

  // Fetch paginated data based on filter
  let userOrders: any[] = [];
  let userDeposits: any[] = [];
  let userWithdrawals: any[] = [];
  let userTransfers: any[] = [];
  let userPointTransactions: any[] = [];

  if (currentFilter === 'all') {
    // Fetch all types for combined view
    const [allOrders, allDeposits, allWithdrawals, rawAllTransfers, allPoints] = await Promise.all([
      db.select().from(orders).where(ordersWhereCondition).orderBy(desc(orders.createdAt)),
      db.select().from(deposits).where(depositsWhereCondition).orderBy(desc(deposits.createdAt)),
      db.select().from(withdrawals).where(withdrawalsWhereCondition).orderBy(desc(withdrawals.createdAt)),
      db.select({
        id: saldoTransfers.id,
        transferId: saldoTransfers.transferId,
        senderId: saldoTransfers.senderId,
        receiverId: saldoTransfers.receiverId,
        amount: saldoTransfers.amount,
        notes: saldoTransfers.notes,
        createdAt: saldoTransfers.createdAt,
      }).from(saldoTransfers).where(transfersWhereCondition!).orderBy(desc(saldoTransfers.createdAt)),
      db.select().from(pointTransactions).where(pointsWhereCondition).orderBy(desc(pointTransactions.createdAt)),
    ]);

    userOrders = allOrders;
    userDeposits = allDeposits;
    userWithdrawals = allWithdrawals;
    userPointTransactions = allPoints;

    // Get user names for transfers
    const userIds = new Set<number>();
    rawAllTransfers.forEach(t => {
      userIds.add(t.senderId);
      userIds.add(t.receiverId);
    });

    const userMap: Record<number, { name: string }> = {};
    if (userIds.size > 0) {
      const usersData = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(sql`${users.id} IN (${sql.raw(Array.from(userIds).join(','))})`);
      
      usersData.forEach(u => {
        userMap[u.id] = { name: u.name };
      });
    }

    userTransfers = rawAllTransfers.map(t => ({
      ...t,
      type: (t.senderId === user.id ? 'sent' : 'received') as 'sent' | 'received',
      senderName: userMap[t.senderId]?.name || 'Unknown',
      receiverName: userMap[t.receiverId]?.name || 'Unknown',
    }));
  } else if (currentFilter === 'deposit') {
    userDeposits = await db
      .select()
      .from(deposits)
      .where(depositsWhereCondition)
      .orderBy(desc(deposits.createdAt));
  } else if (currentFilter === 'withdrawal') {
    userWithdrawals = await db
      .select()
      .from(withdrawals)
      .where(withdrawalsWhereCondition)
      .orderBy(desc(withdrawals.createdAt));
  } else if (currentFilter === 'transfer') {
    const rawTransfers = await db
      .select({
        id: saldoTransfers.id,
        transferId: saldoTransfers.transferId,
        senderId: saldoTransfers.senderId,
        receiverId: saldoTransfers.receiverId,
        amount: saldoTransfers.amount,
        notes: saldoTransfers.notes,
        createdAt: saldoTransfers.createdAt,
      })
      .from(saldoTransfers)
      .where(transfersWhereCondition!)
      .orderBy(desc(saldoTransfers.createdAt));

    // Get user names for transfers
    const userIds = new Set<number>();
    rawTransfers.forEach(t => {
      userIds.add(t.senderId);
      userIds.add(t.receiverId);
    });

    const userMap: Record<number, { name: string }> = {};
    if (userIds.size > 0) {
      const usersData = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(sql`${users.id} IN (${sql.raw(Array.from(userIds).join(','))})`);
      
      usersData.forEach(u => {
        userMap[u.id] = { name: u.name };
      });
    }

    userTransfers = rawTransfers.map(t => ({
      ...t,
      type: (t.senderId === user.id ? 'sent' : 'received') as 'sent' | 'received',
      senderName: userMap[t.senderId]?.name || 'Unknown',
      receiverName: userMap[t.receiverId]?.name || 'Unknown',
    }));
  } else if (currentFilter === 'points') {
    userPointTransactions = await db
      .select()
      .from(pointTransactions)
      .where(pointsWhereCondition)
      .orderBy(desc(pointTransactions.createdAt));
  } else if (currentFilter === 'pending_proof') {
    const [pendingProofOrders, pendingProofDeposits] = await Promise.all([
      db.select().from(orders).where(combinedOrdersWhere).orderBy(desc(orders.createdAt)),
      db.select().from(deposits).where(
        and(
          depositsWhereCondition,
          eq(deposits.status, 'pending_proof'),
          sql`(expires_at IS NULL OR expires_at > NOW())`
        )
      ).orderBy(desc(deposits.createdAt)),
    ]);
    userOrders = pendingProofOrders;
    userDeposits = pendingProofDeposits;
  } else {
    userOrders = await db
      .select()
      .from(orders)
      .where(combinedOrdersWhere)
      .orderBy(desc(orders.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);
  }

  // Compute actual status (server-side to avoid client/server mismatch)
  function computeActualStatus(status: string, expiresAt: Date | string | null, proofUploadedAt: Date | string | null, transactionType: string): string {
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

  // Serialize dates and compute actual status for orders
  const serializedOrders = userOrders.map(order => {
    const createdAtDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const expiresAtDate = order.expiresAt instanceof Date ? order.expiresAt : (order.expiresAt ? new Date(order.expiresAt) : null);
    
    const createdAtFormatted = formatDateWIB(createdAtDate);
    const expiresAtFormatted = expiresAtDate ? formatDateWIB(expiresAtDate) : null;
    
    const actualStatus = computeActualStatus(order.status, expiresAtDate, order.proofUploadedAt, order.transactionType);
    
    return {
      ...order,
      status: actualStatus,
      dbStatus: order.status,
      createdAt: createdAtFormatted,
      expiresAt: expiresAtFormatted,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  // Serialize dates for deposits
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

  const serializedDeposits = userDeposits.map(deposit => {
    const createdAtDate = deposit.createdAt instanceof Date ? deposit.createdAt : new Date(deposit.createdAt);
    const expiresAtDate = deposit.expiresAt instanceof Date ? deposit.expiresAt : (deposit.expiresAt ? new Date(deposit.expiresAt) : null);
    
    const createdAtFormatted = formatDateWIB(createdAtDate);
    const expiresAtFormatted = expiresAtDate ? formatDateWIB(expiresAtDate) : null;
    
    const actualStatus = computeDepositStatus(deposit.status, expiresAtDate);
    
    return {
      ...deposit,
      status: actualStatus,
      dbStatus: deposit.status,
      createdAt: createdAtFormatted,
      expiresAt: expiresAtFormatted,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  // Serialize withdrawals
  const serializedWithdrawals = userWithdrawals.map(withdrawal => {
    const createdAtDate = withdrawal.createdAt instanceof Date ? withdrawal.createdAt : new Date(withdrawal.createdAt);
    const createdAtFormatted = formatDateWIB(createdAtDate);
    
    return {
      ...withdrawal,
      createdAt: createdAtFormatted,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  // Serialize transfers
  const serializedTransfers = userTransfers.map(transfer => {
    const createdAtDate = transfer.createdAt instanceof Date ? transfer.createdAt : new Date(transfer.createdAt);
    const createdAtFormatted = formatDateWIB(createdAtDate);
    
    return {
      ...transfer,
      createdAt: createdAtFormatted,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  // Serialize point transactions
  const serializedPointTransactions = userPointTransactions.map(pt => {
    const createdAtDate = pt.createdAt instanceof Date ? pt.createdAt : new Date(pt.createdAt);
    const createdAtFormatted = formatDateWIB(createdAtDate);
    
    return {
      id: pt.id,
      type: pt.type,
      amount: pt.amount,
      description: pt.description,
      createdAt: createdAtFormatted,
      created_at_raw: createdAtDate.getTime(),
    };
  });

  return (
    <div className="space-y-6">
      <OrdersList 
        orders={serializedOrders}
        deposits={serializedDeposits}
        withdrawals={serializedWithdrawals}
        transfers={serializedTransfers}
        pointTransactions={serializedPointTransactions}
        currentPage={currentPage}
        totalPages={totalPages}
        currentFilter={currentFilter}
        counts={{
          all: totalOrderCount,
          completed: completedCount,
          pending: pendingCount,
          pending_proof: pendingProofCount,
          expired: expiredCount,
          deposit: depositCount,
          withdrawal: withdrawalCount,
          transfer: transferCount,
          points: pointsCount,
        }}
      />
    </div>
  );
}
