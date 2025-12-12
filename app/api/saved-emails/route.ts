import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { savedEmails } from '@/shared/schema';
import { getSessionUser } from '@/lib/auth/session';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType');

    let emails;
    if (serviceType) {
      emails = await db
        .select()
        .from(savedEmails)
        .where(and(
          eq(savedEmails.userId, user.id),
          eq(savedEmails.serviceType, serviceType.toLowerCase())
        ))
        .orderBy(desc(savedEmails.usedCount), desc(savedEmails.lastUsedAt));
    } else {
      emails = await db
        .select()
        .from(savedEmails)
        .where(eq(savedEmails.userId, user.id))
        .orderBy(desc(savedEmails.usedCount), desc(savedEmails.lastUsedAt));
    }

    return NextResponse.json({ success: true, emails });
  } catch (error) {
    console.error('Error fetching saved emails:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch saved emails' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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

    const existingEmails = await db
      .select()
      .from(savedEmails)
      .where(eq(savedEmails.userId, user.id));

    if (existingEmails.length >= 20) {
      return NextResponse.json(
        { success: false, error: 'Maximum 20 emails allowed' },
        { status: 400 }
      );
    }

    const [newEmail] = await db
      .insert(savedEmails)
      .values({
        userId: user.id,
        label: label.trim(),
        serviceType: serviceType.toLowerCase(),
        email: email.trim().toLowerCase(),
      })
      .returning();

    return NextResponse.json({ success: true, email: newEmail });
  } catch (error) {
    console.error('Error creating saved email:', error);
    return NextResponse.json({ success: false, error: 'Failed to save email' }, { status: 500 });
  }
}
