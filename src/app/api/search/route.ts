import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { searches, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

const scrapeQueue = new Queue("scrape-queue", { connection });

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { city, niche, resultsRequested } = await req.json();

    if (!city || !niche || !resultsRequested) {
      return NextResponse.json(
        { error: "City, niche, and resultsRequested are required" },
        { status: 400 }
      );
    }

    // Check user credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.credits < resultsRequested) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }

    // Create search record
    const [search] = await db
      .insert(searches)
      .values({
        userId,
        city,
        niche,
        resultsRequested,
        status: "processing",
      })
      .returning();

    // Queue the scraping job
    await scrapeQueue.add("scrape", {
      searchId: search.id,
      userId,
      city,
      niche,
      resultsRequested,
    });

    return NextResponse.json({ searchId: search.id, status: "processing" });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const userSearches = await db
      .select()
      .from(searches)
      .where(eq(searches.userId, userId))
      .orderBy(searches.createdAt);

    return NextResponse.json(userSearches);
  } catch (error) {
    console.error("Get searches error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
