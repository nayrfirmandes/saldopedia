import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from '@/lib/db-url';

const sql = neon(getDatabaseUrl());

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function computeActualStatus(status: string, expiresAt: string | Date | null): string {
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

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = 10;
    
    const orders = await sql`
      SELECT 
        id, order_id, service_type, crypto_symbol, 
        transaction_type, amount_idr, status, 
        created_at, expires_at
      FROM orders 
      WHERE user_id = ${user.id} OR customer_email = ${user.email}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const serializedOrders = orders.map(order => {
      const createdAt = order.created_at instanceof Date ? order.created_at.toISOString() : order.created_at;
      const expiresAt = order.expires_at instanceof Date ? order.expires_at.toISOString() : order.expires_at;
      const actualStatus = computeActualStatus(order.status, expiresAt);
      
      return {
        ...order,
        status: actualStatus,
        db_status: order.status,
        created_at: createdAt,
        expires_at: expiresAt,
      };
    });

    return NextResponse.json({ 
      orders: serializedOrders,
      saldo: user.saldo,
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
