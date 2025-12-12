import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { testimonials } from "@/shared/schema";
import { eq, desc } from "drizzle-orm";
import sharp from "sharp";

export async function GET(request: NextRequest) {
  try {
    // PERFORMANCE: Get limit from query params with proper validation
    const { searchParams } = new URL(request.url);
    const limitParam = parseInt(searchParams.get('limit') || '8', 10);
    
    // Validate and clamp limit: invalid→8, <1→8, >50→50
    const limit = !isNaN(limitParam) && limitParam >= 1
      ? Math.min(limitParam, 50) // Clamp to max 50
      : 8; // Default to 8 if invalid or <1
    
    const approvedTestimonials = await db
      .select({
        id: testimonials.id,
        name: testimonials.name,
        username: testimonials.username,
        platform: testimonials.platform,
        photoUrl: testimonials.photoUrl,
        content: testimonials.content,
        rating: testimonials.rating,
        verified: testimonials.verified,
        createdAt: testimonials.createdAt,
      })
      .from(testimonials)
      .where(eq(testimonials.status, "approved"))
      .orderBy(desc(testimonials.createdAt))
      .limit(limit);

    return NextResponse.json(approvedTestimonials, {
      headers: {
        // Enhanced caching: 5min browser cache, 10min CDN, 20min stale-while-revalidate
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200, max-age=300',
        'CDN-Cache-Control': 'public, s-maxage=600',
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const platform = formData.get("platform") as string;
    const content = formData.get("content") as string;
    const rating = parseInt(formData.get("rating") as string) || 5;
    const photoFile = formData.get("photo") as File | null;

    if (!name || !platform || !content) {
      return NextResponse.json(
        { error: "Name, platform, and content are required" },
        { status: 400 }
      );
    }
    
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    let photoUrl = null;

    if (photoFile && photoFile.size > 0) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(photoFile.type)) {
        return NextResponse.json(
          { error: "Format foto tidak didukung. Gunakan JPG, PNG, atau WebP." },
          { status: 400 }
        );
      }

      if (photoFile.size > maxSize) {
        return NextResponse.json(
          { error: "Ukuran foto maksimal 5MB" },
          { status: 400 }
        );
      }

      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Resize and compress image to 100x100 avatar (saves ~95% bandwidth)
      const compressedBuffer = await sharp(buffer)
        .resize(100, 100, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const base64 = compressedBuffer.toString("base64");
      photoUrl = `data:image/jpeg;base64,${base64}`;
    }

    const isVerified = Math.random() < 0.3;

    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        name,
        username: username || null,
        platform,
        photoUrl,
        content,
        rating,
        status: "approved",
        verified: isVerified,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Testimoni berhasil dikirim! Terima kasih atas testimoni Anda.",
        testimonial: newTestimonial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting testimonial:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error("Stack trace:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
