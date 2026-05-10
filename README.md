# Site Scraper #

AI-powered web scraper that crawls Google Maps to find local businesses with bad websites, analyzes them with OpenAI, and generates personalized outreach messages.

## Tech Stack

- **Frontend**: Next.js 15, React 19, SCSS Modules
- **Backend**: Next.js API Routes, Node.js
- **Database**: Neon PostgreSQL (via Drizzle ORM)
- **Scraping**: Puppeteer (screenshots, HTML, email extraction)
- **AI**: OpenAI GPT-4o-mini (site analysis + outreach generation)
- **Business Data**: Google Places API
- **Job Queue**: BullMQ + Redis
- **Auth**: NextAuth.js (credentials)

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (for job queue)
- Neon PostgreSQL account
- Google Cloud Platform account (Places API enabled)
- OpenAI API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random secret for JWT signing (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — Your app URL (http://localhost:3000 for dev)
- `GOOGLE_PLACES_API_KEY` — Google Cloud API key with Places API enabled
- `OPENAI_API_KEY` — OpenAI API key
- `REDIS_URL` — Redis connection URL

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Start the Scraping Worker (separate terminal)

```bash
npm run worker
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Next.js App (Frontend + API)                   │
│  ├── /dashboard  — Search UI + Results          │
│  ├── /api/search — Queue scraping jobs          │
│  ├── /api/leads  — Retrieve scraped leads       │
│  └── /api/auth   — Registration + Login         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  BullMQ Queue (Redis)                           │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Scrape Worker (src/workers/scrape-worker.ts)   │
│  ├── Google Places API → business list          │
│  ├── Puppeteer → screenshot + HTML + emails     │
│  ├── OpenAI → site analysis + quality score     │
│  └── OpenAI → personalized outreach message     │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  Neon PostgreSQL                                │
│  ├── users (auth, credits, plan)                │
│  ├── searches (city, niche, status)             │
│  └── leads (business data, analysis, outreach)  │
└─────────────────────────────────────────────────┘
```

## Features

- **Google Maps search** — Any city, any niche
- **Puppeteer scraping** — Screenshots, HTML extraction, email extraction
- **AI analysis** — Quality score (1-100), specific issues found
- **Outreach generation** — Personalized cold emails based on actual problems
- **Credit system** — 1 credit per business scraped
- **CSV export** — Download leads as spreadsheet
- **Prospect manager** — Save/track leads

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST/GET | `/api/auth/[...nextauth]` | NextAuth endpoints |
| POST | `/api/search` | Start a new scraping search |
| GET | `/api/search` | Get user's search history |
| GET | `/api/leads?searchId=X` | Get leads for a search |
| PATCH | `/api/leads` | Save/unsave a lead |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run worker` | Start the BullMQ scraping worker |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:studio` | Open Drizzle Studio |
