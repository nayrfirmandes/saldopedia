import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { savedRecipients } from '@/shared/schema';
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
    const recipientRecordId = parseInt(id);
    
    if (isNaN(recipientRecordId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { label } = body;

    const [updated] = await db
      .update(savedRecipients)
      .set({
        label: label?.trim() || null,
      })
      .where(and(
        eq(savedRecipients.id, recipientRecordId),
        eq(savedRecipients.userId, user.id)
      ))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, recipient: updated });
  } catch (error) {
    console.error('Error updating saved recipient:', error);
    return NextResponse.json({ success: false, error: 'Failed to update recipient' }, { status: 500 });
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
    const recipientRecordId = parseInt(id);
    
    if (isNaN(recipientRecordId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(savedRecipients)
      .where(and(
        eq(savedRecipients.id, recipientRecordId),
        eq(savedRecipients.userId, user.id)
      ))
      .returning();

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Recipient deleted' });
  } catch (error) {
    console.error('Error deleting saved recipient:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete recipient' }, { status: 500 });
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
    const recipientRecordId = parseInt(id);
    
    if (isNaN(recipientRecordId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const [updated] = await db
      .update(savedRecipients)
      .set({
        usedCount: sql`${savedRecipients.usedCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(and(
        eq(savedRecipients.id, recipientRecordId),
        eq(savedRecipients.userId, user.id)
      ))
      .returning();

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Recipient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, recipient: updated });
  } catch (error) {
    console.error('Error updating recipient usage:', error);
    return NextResponse.json({ success: false, error: 'Failed to update recipient usage' }, { status: 500 });
  }
}
