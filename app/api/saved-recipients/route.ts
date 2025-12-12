import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { savedRecipients, users } from '@/shared/schema';
import { getSessionUser } from '@/lib/auth/session';
import { eq, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const recipients = await db
      .select({
        id: savedRecipients.id,
        recipientId: savedRecipients.recipientId,
        label: savedRecipients.label,
        usedCount: savedRecipients.usedCount,
        lastUsedAt: savedRecipients.lastUsedAt,
        createdAt: savedRecipients.createdAt,
        recipientName: users.name,
        recipientEmail: users.email,
        recipientPhotoUrl: users.photoUrl,
      })
      .from(savedRecipients)
      .innerJoin(users, eq(savedRecipients.recipientId, users.id))
      .where(eq(savedRecipients.userId, user.id))
      .orderBy(desc(savedRecipients.usedCount), desc(savedRecipients.lastUsedAt));

    return NextResponse.json({ success: true, recipients });
  } catch (error) {
    console.error('Error fetching saved recipients:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch saved recipients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, label } = body;

    if (!recipientId) {
      return NextResponse.json(
        { success: false, error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (recipientId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot save yourself as recipient' },
        { status: 400 }
      );
    }

    const [recipient] = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId));

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      );
    }

    const existing = await db
      .select()
      .from(savedRecipients)
      .where(and(
        eq(savedRecipients.userId, user.id),
        eq(savedRecipients.recipientId, recipientId)
      ));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Recipient already saved' },
        { status: 400 }
      );
    }

    const existingRecipients = await db
      .select()
      .from(savedRecipients)
      .where(eq(savedRecipients.userId, user.id));

    if (existingRecipients.length >= 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 recipients allowed' },
        { status: 400 }
      );
    }

    const [newRecipient] = await db
      .insert(savedRecipients)
      .values({
        userId: user.id,
        recipientId,
        label: label?.trim() || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      recipient: {
        ...newRecipient,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientPhotoUrl: recipient.photoUrl,
      },
    });
  } catch (error) {
    console.error('Error saving recipient:', error);
    return NextResponse.json({ success: false, error: 'Failed to save recipient' }, { status: 500 });
  }
}
