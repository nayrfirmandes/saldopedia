import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { savedWallets } from '@/shared/schema';
import { getSessionUser } from '@/lib/auth/session';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cryptoSymbol = searchParams.get('crypto');

    let wallets;
    if (cryptoSymbol) {
      wallets = await db
        .select()
        .from(savedWallets)
        .where(and(
          eq(savedWallets.userId, user.id),
          eq(savedWallets.cryptoSymbol, cryptoSymbol.toUpperCase())
        ))
        .orderBy(desc(savedWallets.usedCount), desc(savedWallets.lastUsedAt));
    } else {
      wallets = await db
        .select()
        .from(savedWallets)
        .where(eq(savedWallets.userId, user.id))
        .orderBy(desc(savedWallets.usedCount), desc(savedWallets.lastUsedAt));
    }

    return NextResponse.json({ success: true, wallets });
  } catch (error) {
    console.error('Error fetching saved wallets:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch saved wallets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { label, cryptoSymbol, network, walletAddress, xrpTag } = body;

    if (!label || !cryptoSymbol || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Label, crypto symbol, and wallet address are required' },
        { status: 400 }
      );
    }

    const existingWallets = await db
      .select()
      .from(savedWallets)
      .where(eq(savedWallets.userId, user.id));

    if (existingWallets.length >= 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 wallets allowed' },
        { status: 400 }
      );
    }

    const [newWallet] = await db
      .insert(savedWallets)
      .values({
        userId: user.id,
        label: label.trim(),
        cryptoSymbol: cryptoSymbol.toUpperCase(),
        network: network || null,
        walletAddress: walletAddress.trim(),
        xrpTag: xrpTag || null,
      })
      .returning();

    return NextResponse.json({ success: true, wallet: newWallet });
  } catch (error) {
    console.error('Error creating saved wallet:', error);
    return NextResponse.json({ success: false, error: 'Failed to save wallet' }, { status: 500 });
  }
}
