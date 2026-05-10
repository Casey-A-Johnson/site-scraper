import "dotenv/config";

import { Worker } from "bullmq";
import IORedis from "ioredis";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { searchBusinesses } from "../lib/google-places";
import { scrapeWebsite } from "../lib/scraper";
import { analyzeSite, generateOutreach } from "../lib/openai";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL!.startsWith("rediss://") ? {} : undefined,
});

const worker = new Worker(
  "scrape-queue",
  async (job) => {
    const { searchId, userId, city, niche, resultsRequested } = job.data;

    console.log(`[Worker] Starting search: ${niche} in ${city}`);

    try {
      // Verify user exists
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user) {
        console.error(`[Worker] User ${userId} not found in database. Skipping.`);
        await db
          .update(schema.searches)
          .set({ status: "failed" })
          .where(eq(schema.searches.id, searchId));
        return;
      }

      // Step 1: Search Google Places
      const businesses = await searchBusinesses(city, niche, resultsRequested);

      console.log(`[Worker] Found ${businesses.length} businesses`);

      // Step 2: Process each business
      for (const business of businesses) {
        try {
          let scrapeResult = null;
          let analysis = null;
          let outreach = "";

          // Scrape website if available
          if (business.website) {
            console.log(`[Worker] Scraping: ${business.website}`);
            scrapeResult = await scrapeWebsite(business.website);

            // AI Analysis
            analysis = await analyzeSite({
              url: business.website,
              title: scrapeResult.title,
              metaDescription: scrapeResult.metaDescription,
              loadTime: scrapeResult.loadTime,
              isMobileResponsive: scrapeResult.isMobileResponsive,
              hasSSL: scrapeResult.hasSSL,
              emails: scrapeResult.emails,
              html: scrapeResult.html,
            });

            // Generate outreach message
            outreach = await generateOutreach({
              businessName: business.name,
              website: business.website,
              issues: analysis.issues,
              score: analysis.score,
            });
          }

          // Save lead to database
          await db.insert(schema.leads).values({
            userId,
            searchId,
            businessName: business.name,
            address: business.address,
            phone: business.phone || null,
            email: scrapeResult?.emails[0] || null,
            website: business.website || null,
            screenshotUrl: scrapeResult?.screenshotPath || null,
            googleRating: business.rating || null,
            reviewCount: business.reviewCount || null,
            placeId: business.placeId,
            aiAnalysis: analysis || null,
            aiScore: analysis?.score || null,
            outreachMessage: outreach || null,
          });

          // Update progress
          await job.updateProgress(
            Math.round(
              ((businesses.indexOf(business) + 1) / businesses.length) * 100
            )
          );
        } catch (error) {
          console.error(
            `[Worker] Error processing ${business.name}:`,
            error
          );
          // Continue with next business
        }
      }

      // Update search status
      await db
        .update(schema.searches)
        .set({
          status: "completed",
          resultsFound: businesses.length,
        })
        .where(eq(schema.searches.id, searchId));

      // Deduct credits
      await db
        .update(schema.users)
        .set({ credits: user.credits - businesses.length })
        .where(eq(schema.users.id, userId));

      console.log(`[Worker] Search completed: ${searchId}`);
    } catch (error) {
      console.error(`[Worker] Search failed:`, error);

      await db
        .update(schema.searches)
        .set({ status: "failed" })
        .where(eq(schema.searches.id, searchId));

      throw error;
    }
  },
  {
    connection,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

console.log("[Worker] Scrape worker started, waiting for jobs...");
