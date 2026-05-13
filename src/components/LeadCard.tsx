"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./LeadCard.module.scss";

interface Lead {
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
}

interface LeadCardProps {
  lead: Lead;
}

function scoreColor(score: number | null) {
  if (!score) return "neutral";
  if (score <= 30) return "bad";
  if (score <= 60) return "mid";
  return "good";
}

function LeadModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (lead.outreachMessage) {
      navigator.clipboard.writeText(lead.outreachMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.modalGrid}>
          {lead.screenshotUrl && (
            <div className={styles.modalScreenshot}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lead.screenshotUrl} alt={lead.businessName} />
            </div>
          )}

          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{lead.businessName}</h2>
              {lead.aiScore != null && (
                <span className={`${styles.score} ${styles[scoreColor(lead.aiScore)]}`}>
                  {lead.aiScore}/100
                </span>
              )}
            </div>

            <p className={styles.modalAddress}>{lead.address}</p>

            <div className={styles.modalMeta}>
              {lead.phone && <div className={styles.metaItem}><span className={styles.metaLabel}>Phone</span><span>{lead.phone}</span></div>}
              {lead.email && <div className={styles.metaItem}><span className={styles.metaLabel}>Email</span><span>{lead.email}</span></div>}
              {lead.googleRating != null && <div className={styles.metaItem}><span className={styles.metaLabel}>Rating</span><span>{lead.googleRating} ({lead.reviewCount} reviews)</span></div>}
              {lead.website && <div className={styles.metaItem}><span className={styles.metaLabel}>Website</span><a href={lead.website} target="_blank" rel="noopener noreferrer">{lead.website}</a></div>}
            </div>

            {lead.aiAnalysis && (
              <div className={styles.modalSection}>
                <h4>AI Analysis</h4>
                <p className={styles.summary}>{lead.aiAnalysis.summary}</p>
                <ul className={styles.issueList}>
                  {lead.aiAnalysis.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {lead.outreachMessage && (
              <div className={styles.modalSection}>
                <div className={styles.outreachHeader}>
                  <h4>Outreach Message</h4>
                  <button className={styles.copyBtn} onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className={styles.outreach}>{lead.outreachMessage}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LeadCard({ lead }: LeadCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className={styles.card} onClick={() => setModalOpen(true)}>
        {lead.screenshotUrl && (
          <div className={styles.screenshot}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lead.screenshotUrl} alt={lead.businessName} />
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.header}>
            <h3>{lead.businessName}</h3>
            {lead.aiScore != null && (
              <span className={`${styles.score} ${styles[scoreColor(lead.aiScore)]}`}>
                {lead.aiScore}/100
              </span>
            )}
          </div>

          <p className={styles.address}>{lead.address}</p>

          <div className={styles.meta}>
            {lead.phone && <span>{lead.phone}</span>}
            {lead.googleRating != null && (
              <span>{lead.googleRating} ({lead.reviewCount} reviews)</span>
            )}
          </div>
        </div>
      </div>

      {modalOpen && <LeadModal lead={lead} onClose={() => setModalOpen(false)} />}
    </>
  );
}
