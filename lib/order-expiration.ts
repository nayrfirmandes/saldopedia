import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { orders } from '@/shared/schema';
import { eq, and, lt } from 'drizzle-orm';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

export async function checkAndExpireOrders() {
  try {
    const now = new Date();
    
    const expiredOrders = await db
      .update(orders)
      .set({ status: 'expired' })
      .where(
        and(
          eq(orders.status, 'pending'),
          lt(orders.expiresAt, now)
        )
      )
      .returning();

    if (expiredOrders.length > 0) {
      console.log(`Auto-expired ${expiredOrders.length} orders:`, expiredOrders.map(o => o.orderId));
    }

    return {
      success: true,
      expiredCount: expiredOrders.length,
      expiredOrders
    };
  } catch (error) {
    console.error('Error auto-expiring orders:', error);
    return {
      success: false,
      error: 'Failed to expire orders'
    };
  }
}
