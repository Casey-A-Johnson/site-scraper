import puppeteer from "puppeteer";

interface ScrapeResult {
  screenshotPath: string;
  emails: string[];
  html: string;
  loadTime: number;
  title: string;
  metaDescription: string;
  isMobileResponsive: boolean;
  hasSSL: boolean;
}

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const startTime = Date.now();

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  } catch {
    // If timeout, still try to capture what loaded
  }

  const loadTime = Date.now() - startTime;

  // Take screenshot as base64
  const screenshotBuffer = await page.screenshot({ fullPage: false, encoding: "binary" });
  const screenshotBase64 = `data:image/png;base64,${Buffer.from(screenshotBuffer).toString("base64")}`;

  // Get page HTML
  const html = await page.content();

  // Extract emails from HTML
  const emails = extractEmails(html);

  // Get meta info
  const title = await page.title();
  const metaDescription = await page
    .$eval('meta[name="description"]', (el) => el.getAttribute("content") || "")
    .catch(() => "");

  // Check mobile responsiveness (viewport meta tag)
  const isMobileResponsive = await page
    .$eval('meta[name="viewport"]', () => true)
    .catch(() => false);

  // Check SSL
  const hasSSL = url.startsWith("https");

  await browser.close();

  return {
    screenshotPath: screenshotBase64,
    emails,
    html,
    loadTime,
    title,
    metaDescription,
    isMobileResponsive,
    hasSSL,
  };
}

function extractEmails(html: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = html.match(emailRegex) || [];

  // Deduplicate and filter out common false positives
  const filtered = [...new Set(matches)].filter((email) => {
    const lower = email.toLowerCase();
    return (
      !lower.endsWith(".png") &&
      !lower.endsWith(".jpg") &&
      !lower.endsWith(".gif") &&
      !lower.endsWith(".svg") &&
      !lower.includes("example.com") &&
      !lower.includes("sentry.io") &&
      !lower.includes("webpack") &&
      !lower.startsWith("info@example")
    );
  });

  return filtered;
}
