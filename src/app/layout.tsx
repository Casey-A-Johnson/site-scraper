import type { Metadata } from "next";
import "@/styles/globals.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Site Scraper - Find Businesses With Bad Websites",
  description:
    "AI-powered web scraper that finds local businesses with outdated websites to help you find new clients.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
