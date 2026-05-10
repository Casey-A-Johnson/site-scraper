import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const searchId = req.nextUrl.searchParams.get("searchId");

    let userLeads;
    if (searchId) {
      userLeads = await db
        .select()
        .from(leads)
        .where(and(eq(leads.userId, userId), eq(leads.searchId, searchId)));
    } else {
      userLeads = await db
        .select()
        .from(leads)
        .where(eq(leads.userId, userId))
        .orderBy(leads.createdAt);
    }

    return NextResponse.json(userLeads);
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { leadId, isSaved } = await req.json();

    await db
      .update(leads)
      .set({ isSaved })
      .where(and(eq(leads.id, leadId), eq(leads.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
