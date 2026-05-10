import "dotenv/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL!.startsWith("rediss://") ? {} : undefined,
});

const queue = new Queue("scrape-queue", { connection });

async function main() {
  const waiting = await queue.getWaitingCount();
  const active = await queue.getActiveCount();

  if (waiting === 0 && active === 0) {
    console.log("[Worker] No jobs in queue. Exiting.");
    await queue.close();
    await connection.quit();
    process.exit(0);
  }

  console.log(
    `[Worker] Found ${waiting} waiting, ${active} active jobs. Starting worker...`
  );

  // Start the actual worker
  await import("./scrape-worker");

  // Monitor and exit when done
  const checkInterval = setInterval(async () => {
    const w = await queue.getWaitingCount();
    const a = await queue.getActiveCount();

    if (w === 0 && a === 0) {
      console.log("[Worker] All jobs processed. Shutting down.");
      clearInterval(checkInterval);
      await queue.close();
      await connection.quit();
      process.exit(0);
    }
  }, 10000);
}

main().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
