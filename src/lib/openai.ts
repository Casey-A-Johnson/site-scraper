import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface SiteAnalysis {
  score: number; // 1-100, lower = uglier/worse
  issues: string[];
  summary: string;
}

export async function analyzeSite(data: {
  url: string;
  title: string;
  metaDescription: string;
  loadTime: number;
  isMobileResponsive: boolean;
  hasSSL: boolean;
  emails: string[];
  html: string;
}): Promise<SiteAnalysis> {
  // Truncate HTML to avoid token limits
  const truncatedHtml = data.html.slice(0, 5000);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a web design and SEO expert. Analyze the following website data and provide:
1. A quality score from 1-100 (lower = worse quality website, more likely the business needs help)
2. A list of specific issues found
3. A brief summary of the website's overall quality

Consider: load time, mobile responsiveness, SSL, meta tags, HTML structure, modern practices.
Respond in JSON format: { "score": number, "issues": string[], "summary": string }`,
      },
      {
        role: "user",
        content: `URL: ${data.url}
Title: ${data.title}
Meta Description: ${data.metaDescription || "MISSING"}
Load Time: ${data.loadTime}ms
Mobile Responsive: ${data.isMobileResponsive}
Has SSL: ${data.hasSSL}
Contact Emails Found: ${data.emails.length}

HTML snippet:
${truncatedHtml}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as SiteAnalysis;
}

export async function generateOutreach(data: {
  businessName: string;
  website: string;
  issues: string[];
  score: number;
}): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a sales copywriter specializing in web design/digital marketing cold outreach.
Write a short, personalized cold email (3-4 paragraphs max) to a business owner.
Be friendly, specific about their website issues, and offer to help.
Do NOT be salesy or pushy. Be genuine and helpful.
Include a clear but soft call to action.`,
      },
      {
        role: "user",
        content: `Business: ${data.businessName}
Website: ${data.website}
Quality Score: ${data.score}/100
Issues found:
${data.issues.map((i) => `- ${i}`).join("\n")}

Write a personalized outreach email for this business.`,
      },
    ],
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "";
}
