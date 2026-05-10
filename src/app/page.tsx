import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <div className={styles.landing}>
      <nav className={styles.nav}>
        <div className={styles.logo}>Site Scraper</div>
        <div className={styles.navLinks}>
          <Link href="/login">Login</Link>
          <Link href="/register" className={styles.ctaBtn}>
            Get Started
          </Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <h1>
          Find local businesses with <span>bad websites</span> and turn them
          into clients
        </h1>
        <p>
          An AI-powered scraper that crawls Google Maps in any city and any
          industry to find businesses with outdated websites, poor SEO, and bad
          reviews.
        </p>
        <Link href="/register" className={styles.heroBtn}>
          Start Scraping — 100 Free Credits
        </Link>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>Google Maps Scraping</h3>
          <p>
            Search any city and niche to find businesses with their full contact
            info pulled directly from Google.
          </p>
        </div>
        <div className={styles.feature}>
          <h3>AI Website Analysis</h3>
          <p>
            Every website is analyzed by AI to find critical errors and score
            its quality so you know exactly who needs help.
          </p>
        </div>
        <div className={styles.feature}>
          <h3>Outreach Generator</h3>
          <p>
            Generate personalized cold outreach messages that reference specific
            problems found on their website.
          </p>
        </div>
      </section>
    </div>
  );
}
