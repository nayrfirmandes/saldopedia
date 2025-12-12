import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    
    return NextResponse.json({ 
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Health Check] Database error:', error);
    return NextResponse.json({ 
      status: 'down',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
