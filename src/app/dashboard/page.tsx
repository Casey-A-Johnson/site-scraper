"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./dashboard.module.scss";
import { AppShell } from "@/components/AppShell";
import { LeadCard } from "@/components/LeadCard";
import { Download, ArrowLeft } from "lucide-react";

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
  createdAt: string;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = searchParams.get("searchId");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && searchId) {
      fetchLeads(searchId);
    }
  }, [session, searchId]);

  const fetchLeads = async (id: string) => {
    setLoading(true);
    const res = await fetch(`/api/leads?searchId=${id}`);
    const data = await res.json();
    setLeads(data);
    setLoading(false);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = [
      "Business Name",
      "Address",
      "Phone",
      "Email",
      "Website",
      "Google Rating",
      "Reviews",
      "AI Score",
    ];
    const rows = leads.map((lead) => [
      lead.businessName,
      lead.address,
      lead.phone || "",
      lead.email || "",
      lead.website || "",
      lead.googleRating?.toString() || "",
      lead.reviewCount?.toString() || "",
      lead.aiScore?.toString() || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${Date.now()}.csv`;
    a.click();
  };

  return (
    <AppShell title="Results">
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <button className={styles.backBtn} onClick={() => router.push("/search")}>
            <ArrowLeft size={14} />
            Back to Search
          </button>
          <h2>
            {searchId
              ? `Results (${leads.length})`
              : "No search selected"}
          </h2>
        </div>
        {leads.length > 0 && (
          <button className={styles.exportBtn} onClick={handleExportCSV}>
            <Download size={13} />
            Export CSV
          </button>
        )}
      </div>

      {!searchId ? (
        <div className={styles.emptyState}>
          <p>No search selected. Go to the <a onClick={() => router.push("/search")}>search page</a> to start.</p>
        </div>
      ) : loading ? (
        <div className={styles.loading}>Loading results...</div>
      ) : (
        <div className={styles.leadGrid}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
