import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { newsletterSubscribers } from "@/shared/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email harus diisi" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    const existingSubscriber = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, trimmedEmail.toLowerCase()))
      .limit(1);

    if (existingSubscriber.length > 0) {
      return NextResponse.json(
        { error: "Email sudah terdaftar di newsletter kami" },
        { status: 409 }
      );
    }

    const newSubscriber = await db
      .insert(newsletterSubscribers)
      .values({
        email: trimmedEmail.toLowerCase(),
        status: "active",
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Terima kasih! Email Anda berhasil didaftarkan",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan. Silakan coba lagi" },
      { status: 500 }
    );
  }
}
