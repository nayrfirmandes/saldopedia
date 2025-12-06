import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { saldoTransfers, users } from '@/shared/schema';
import { eq, desc, or, sql as drizzleSql } from 'drizzle-orm';
import { getDatabaseUrl } from "@/lib/db-url";
import { cache } from 'react';

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

export const getTransferById = async (transferId: string, userId: number) => {
  const result = await db
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
    .where(eq(saldoTransfers.transferId, transferId))
    .limit(1);

  const transfer = result[0];
  if (!transfer) return null;

  const usersData = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(
      drizzleSql`${users.id} IN (${transfer.senderId}, ${transfer.receiverId})`
    );

  const userMap: Record<number, { name: string; email: string }> = {};
  usersData.forEach(u => {
    userMap[u.id] = { name: u.name, email: u.email };
  });

  return {
    ...transfer,
    type: (transfer.senderId === userId ? 'sent' : 'received') as 'sent' | 'received',
    senderName: userMap[transfer.senderId]?.name || 'Unknown',
    senderEmail: userMap[transfer.senderId]?.email || '',
    receiverName: userMap[transfer.receiverId]?.name || 'Unknown',
    receiverEmail: userMap[transfer.receiverId]?.email || '',
  };
};

export const getCachedLatestTransfersForUser = cache(async (userId: number, limit: number = 10) => {
  const userTransfers = await db
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
    .where(
      or(
        eq(saldoTransfers.senderId, userId),
        eq(saldoTransfers.receiverId, userId)
      )
    )
    .orderBy(desc(saldoTransfers.createdAt))
    .limit(limit);

  const userIds = new Set<number>();
  userTransfers.forEach(t => {
    userIds.add(t.senderId);
    userIds.add(t.receiverId);
  });

  const userMap: Record<number, { name: string; email: string }> = {};
  
  if (userIds.size > 0) {
    const usersData = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(
        drizzleSql`${users.id} IN (${drizzleSql.raw(Array.from(userIds).join(','))})`
      );
    
    usersData.forEach(u => {
      userMap[u.id] = { name: u.name, email: u.email };
    });
  }

  const enrichedTransfers = userTransfers.map(t => ({
    ...t,
    type: (t.senderId === userId ? 'sent' : 'received') as 'sent' | 'received',
    senderName: userMap[t.senderId]?.name || 'Unknown',
    senderEmail: userMap[t.senderId]?.email || '',
    receiverName: userMap[t.receiverId]?.name || 'Unknown',
    receiverEmail: userMap[t.receiverId]?.email || '',
  }));

  return enrichedTransfers;
});
