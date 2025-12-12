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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    const orders = await sql`
      SELECT 
        id, order_id, service_type, crypto_symbol, 
        transaction_type, amount_idr, status, 
        created_at, expires_at
      FROM orders 
      WHERE (user_id = ${user.id} OR customer_email = ${user.email})
      ORDER BY created_at DESC
    `;

    const processedOrders = orders.map(order => {
      const createdAt = order.created_at instanceof Date ? order.created_at.toISOString() : order.created_at;
      const expiresAt = order.expires_at instanceof Date ? order.expires_at.toISOString() : order.expires_at;
      const actualStatus = computeActualStatus(order.status, expiresAt);
      
      return {
        id: order.id,
        orderId: order.order_id,
        serviceType: order.service_type,
        cryptoSymbol: order.crypto_symbol,
        transactionType: order.transaction_type,
        amountIdr: order.amount_idr,
        status: actualStatus,
        dbStatus: order.status,
        createdAt: createdAt,
        expiresAt: expiresAt,
      };
    });

    const completedCount = processedOrders.filter(o => o.status === 'completed').length;
    const pendingCount = processedOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const expiredCount = processedOrders.filter(o => o.status === 'expired' || o.status === 'cancelled').length;

    let filteredOrders = processedOrders;
    if (filter === 'completed') {
      filteredOrders = processedOrders.filter(o => o.status === 'completed');
    } else if (filter === 'pending') {
      filteredOrders = processedOrders.filter(o => o.status === 'pending' || o.status === 'processing');
    } else if (filter === 'expired') {
      filteredOrders = processedOrders.filter(o => o.status === 'expired' || o.status === 'cancelled');
    }

    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    const totalFiltered = filteredOrders.length;

    return NextResponse.json({ 
      orders: paginatedOrders,
      currentPage: page,
      totalPages: Math.ceil(totalFiltered / limit),
      counts: {
        all: processedOrders.length,
        completed: completedCount,
        pending: pendingCount,
        expired: expiredCount,
      },
      timestamp: Date.now()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error fetching orders list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
