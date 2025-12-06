import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { savedEmails } from '@/shared/schema';
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
    const emailId = parseInt(id);
    
    if (isNaN(emailId)) {
      return NextResponse.json({ success: false, error: 'Invalid email ID' }, { status: 400 });
    }

    const body = await request.json();
    const { label, serviceType, email } = body;

    if (!label || !serviceType || !email) {
      return NextResponse.json(
        { success: false, error: 'Label, service type, and email are required' },
        { status: 400 }
      );
    }

    if (!['paypal', 'skrill'].includes(serviceType.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Service type must be paypal or skrill' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const [updatedEmail] = await db
      .update(savedEmails)
      .set({
        label: label.trim(),
        serviceType: serviceType.toLowerCase(),
        email: email.trim().toLowerCase(),
      })
      .where(and(
        eq(savedEmails.id, emailId),
        eq(savedEmails.userId, user.id)
      ))
      .returning();

    if (!updatedEmail) {
      return NextResponse.json({ success: false, error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, email: updatedEmail });
  } catch (error) {
    console.error('Error updating saved email:', error);
    return NextResponse.json({ success: false, error: 'Failed to update email' }, { status: 500 });
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
    const emailId = parseInt(id);
    
    if (isNaN(emailId)) {
      return NextResponse.json({ success: false, error: 'Invalid email ID' }, { status: 400 });
    }

    const [deletedEmail] = await db
      .delete(savedEmails)
      .where(and(
        eq(savedEmails.id, emailId),
        eq(savedEmails.userId, user.id)
      ))
      .returning();

    if (!deletedEmail) {
      return NextResponse.json({ success: false, error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Email deleted' });
  } catch (error) {
    console.error('Error deleting saved email:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete email' }, { status: 500 });
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
    const emailId = parseInt(id);
    
    if (isNaN(emailId)) {
      return NextResponse.json({ success: false, error: 'Invalid email ID' }, { status: 400 });
    }

    const [updatedEmail] = await db
      .update(savedEmails)
      .set({
        usedCount: sql`${savedEmails.usedCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(and(
        eq(savedEmails.id, emailId),
        eq(savedEmails.userId, user.id)
      ))
      .returning();

    if (!updatedEmail) {
      return NextResponse.json({ success: false, error: 'Email not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, email: updatedEmail });
  } catch (error) {
    console.error('Error updating email usage:', error);
    return NextResponse.json({ success: false, error: 'Failed to update email usage' }, { status: 500 });
  }
}
