import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { orders } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, user.id))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      success: true,
      orders: userOrders,
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
