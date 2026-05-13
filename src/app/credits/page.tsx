"use client";

import { useState } from "react";
import styles from "./credits.module.scss";
import { AppShell } from "@/components/AppShell";
import { Zap, Plus, CheckCircle2 } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    price: 9,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 200,
    price: 29,
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    credits: 500,
    price: 59,
    popular: false,
  },
];

const features = [
  "1 credit = 1 business lead",
  "AI-powered website analysis",
  "Contact info extraction",
  "Personalized outreach messages",
  "CSV export included",
];

export default function CreditsPage() {
  const [currentCredits] = useState(0);

  return (
    <AppShell title="Credits">
      <div className={styles.container}>
        <div className={styles.balanceCard}>
          <div className={styles.balanceInfo}>
            <Zap size={20} className={styles.balanceIcon} />
            <div>
              <p className={styles.balanceLabel}>Current Balance</p>
              <h2 className={styles.balanceAmount}>{currentCredits} credits</h2>
            </div>
          </div>
          <p className={styles.balanceHint}>
            Credits are used when you run a search. Each result costs 1 credit.
          </p>
        </div>

        <div className={styles.plansSection}>
          <h3 className={styles.sectionTitle}>Purchase Credits</h3>
          <div className={styles.plansGrid}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${styles.planCard} ${plan.popular ? styles.planPopular : ""}`}
              >
                {plan.popular && <span className={styles.popularBadge}>Most Popular</span>}
                <h4 className={styles.planName}>{plan.name}</h4>
                <div className={styles.planCredits}>
                  <span className={styles.planAmount}>{plan.credits}</span>
                  <span className={styles.planUnit}>credits</span>
                </div>
                <div className={styles.planPrice}>
                  <span className={styles.priceAmount}>${plan.price}</span>
                  <span className={styles.pricePer}>one-time</span>
                </div>
                <button className={styles.buyBtn}>
                  <Plus size={14} />
                  Buy Credits
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h3 className={styles.sectionTitle}>What&apos;s included</h3>
          <ul className={styles.featuresList}>
            {features.map((feature) => (
              <li key={feature}>
                <CheckCircle2 size={14} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
