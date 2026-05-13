"use client";

import { useSession, signOut } from "next-auth/react";
import styles from "./settings.module.scss";
import { AppShell } from "@/components/AppShell";
import { User, Mail, LogOut, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <AppShell title="Settings">
      <div className={styles.container}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <User size={16} />
            <h3>Account</h3>
          </div>
          <div className={styles.card}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Email</label>
              <div className={styles.fieldValue}>
                <Mail size={14} />
                <span>{session?.user?.email || "—"}</span>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Name</label>
              <div className={styles.fieldValue}>
                <span>{session?.user?.name || "—"}</span>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Plan</label>
              <div className={styles.fieldValue}>
                <span className={styles.planBadge}>Free</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Bell size={16} />
            <h3>Notifications</h3>
          </div>
          <div className={styles.card}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Email notifications</span>
                <span className={styles.toggleDesc}>Get notified when a search completes</span>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" defaultChecked />
                <span className={styles.toggleSlider} />
              </label>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleInfo}>
                <span className={styles.toggleLabel}>Weekly digest</span>
                <span className={styles.toggleDesc}>Summary of your lead generation activity</span>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={16} />
            <h3>Security</h3>
          </div>
          <div className={styles.card}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Password</label>
              <button className={styles.secondaryBtn}>Change Password</button>
            </div>
          </div>
        </div>

        <div className={styles.dangerZone}>
          <button className={styles.signOutBtn} onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
