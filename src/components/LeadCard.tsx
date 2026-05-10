"use client";

import { useState } from "react";
import styles from "./LeadCard.module.scss";

interface LeadCardProps {
  lead: {
    id: string;
    businessName: string;
    address: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    screenshotUrl: string | null;
    googleRating: number | null;
    reviewCount: number | null;
    aiScore: number | null;
    aiAnalysis: { score: number; issues: string[]; summary: string } | null;
    outreachMessage: string | null;
    isSaved: boolean;
  };
}

export function LeadCard({ lead }: LeadCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const scoreColor = (score: number | null) => {
    if (!score) return "neutral";
    if (score <= 30) return "bad";
    if (score <= 60) return "mid";
    return "good";
  };

  const handleCopyOutreach = () => {
    if (lead.outreachMessage) {
      navigator.clipboard.writeText(lead.outreachMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.card}>
      {lead.screenshotUrl && (
        <div className={styles.screenshot}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lead.screenshotUrl} alt={lead.businessName} />
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.header}>
          <h3>{lead.businessName}</h3>
          {lead.aiScore && (
            <span className={`${styles.score} ${styles[scoreColor(lead.aiScore)]}`}>
              {lead.aiScore}/100
            </span>
          )}
        </div>

        <p className={styles.address}>{lead.address}</p>

        <div className={styles.meta}>
          {lead.phone && <span>📞 {lead.phone}</span>}
          {lead.email && <span>✉️ {lead.email}</span>}
          {lead.googleRating && (
            <span>
              ⭐ {lead.googleRating} ({lead.reviewCount} reviews)
            </span>
          )}
        </div>

        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.websiteLink}
          >
            {lead.website}
          </a>
        )}

        <div className={styles.actions}>
          <button
            className={styles.detailsBtn}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "View Analysis"}
          </button>
          {lead.outreachMessage && (
            <button className={styles.copyBtn} onClick={handleCopyOutreach}>
              {copied ? "Copied!" : "Copy Outreach"}
            </button>
          )}
        </div>

        {showDetails && lead.aiAnalysis && (
          <div className={styles.details}>
            <p className={styles.summary}>{lead.aiAnalysis.summary}</p>
            <h4>Issues Found:</h4>
            <ul>
              {lead.aiAnalysis.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>

            {lead.outreachMessage && (
              <>
                <h4>Outreach Message:</h4>
                <pre className={styles.outreach}>{lead.outreachMessage}</pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
