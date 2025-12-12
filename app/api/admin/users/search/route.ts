import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - not admin" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const sql = neon(getDatabaseUrl());

    const searchPattern = `%${query}%`;
    
    const users = await sql`
      SELECT id, name, email, points
      FROM users
      WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
      ORDER BY name ASC
      LIMIT 20
    `;

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        points: u.points,
      })),
    });

  } catch (error) {
    console.error("Admin users search error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
