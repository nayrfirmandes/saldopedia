import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { savedWallets } from '@/shared/schema';
import { getSessionUser } from '@/lib/auth/session';
import { eq, and, sql } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const walletId = parseInt(id);
    
    if (isNaN(walletId)) {
      return NextResponse.json({ success: false, error: 'Invalid wallet ID' }, { status: 400 });
    }

    const body = await request.json();
    const { label, cryptoSymbol, network, walletAddress, xrpTag } = body;

    if (!label || !cryptoSymbol || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Label, crypto symbol, and wallet address are required' },
        { status: 400 }
      );
    }

    const [updatedWallet] = await db
      .update(savedWallets)
      .set({
        label: label.trim(),
        cryptoSymbol: cryptoSymbol.toUpperCase(),
        network: network || null,
        walletAddress: walletAddress.trim(),
        xrpTag: xrpTag || null,
      })
      .where(and(
        eq(savedWallets.id, walletId),
        eq(savedWallets.userId, user.id)
      ))
      .returning();

    if (!updatedWallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, wallet: updatedWallet });
  } catch (error) {
    console.error('Error updating saved wallet:', error);
    return NextResponse.json({ success: false, error: 'Failed to update wallet' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const walletId = parseInt(id);
    
    if (isNaN(walletId)) {
      return NextResponse.json({ success: false, error: 'Invalid wallet ID' }, { status: 400 });
    }

    const [deletedWallet] = await db
      .delete(savedWallets)
      .where(and(
        eq(savedWallets.id, walletId),
        eq(savedWallets.userId, user.id)
      ))
      .returning();

    if (!deletedWallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Wallet deleted' });
  } catch (error) {
    console.error('Error deleting saved wallet:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete wallet' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const walletId = parseInt(id);
    
    if (isNaN(walletId)) {
      return NextResponse.json({ success: false, error: 'Invalid wallet ID' }, { status: 400 });
    }

    const [updatedWallet] = await db
      .update(savedWallets)
      .set({
        usedCount: sql`${savedWallets.usedCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(and(
        eq(savedWallets.id, walletId),
        eq(savedWallets.userId, user.id)
      ))
      .returning();

    if (!updatedWallet) {
      return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, wallet: updatedWallet });
  } catch (error) {
    console.error('Error updating wallet usage:', error);
    return NextResponse.json({ success: false, error: 'Failed to update wallet usage' }, { status: 500 });
  }
}
