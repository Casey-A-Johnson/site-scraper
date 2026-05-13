"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.scss";
import { SearchForm } from "@/components/SearchForm";
import { LeadCard } from "@/components/LeadCard";

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

interface Search {
  id: string;
  city: string;
  niche: string;
  resultsRequested: number;
  resultsFound: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searches, setSearches] = useState<Search[]>([]);
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchSearches();
    }
  }, [session]);

  const fetchSearches = async () => {
    const res = await fetch("/api/search");
    const data = await res.json();
    setSearches(data);
  };

  const fetchLeads = async (searchId: string) => {
    setLoading(true);
    const res = await fetch(`/api/leads?searchId=${searchId}`);
    const data = await res.json();
    setLeads(data);
    setActiveSearch(searchId);
    setLoading(false);
  };

  const handleNewSearch = async (city: string, niche: string, count: number) => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, niche, resultsRequested: count }),
    });

    if (res.ok) {
      const data = await res.json();
      fetchSearches();
      // Poll for results
      pollSearch(data.searchId);
    }
  };

  const pollSearch = (searchId: string) => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/search");
      const data = await res.json();
      const search = data.find((s: Search) => s.id === searchId);

      if (search?.status === "completed" || search?.status === "failed") {
        clearInterval(interval);
        fetchSearches();
        fetchLeads(searchId);
      }
    }, 5000);
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

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.headerRight}>
          <span className={styles.credits}>Credits: --</span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.sidebarWrap}>
          <div className={styles.sidebarCollapsed}>
            <span className={styles.collapseIcon}>Menu</span>
          </div>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <SearchForm onSearch={handleNewSearch} />

              <div className={styles.searchHistory}>
                <h3>Recent Searches</h3>
                {searches.map((search) => (
                  <button
                    key={search.id}
                    className={`${styles.searchItem} ${activeSearch === search.id ? styles.active : ""}`}
                    onClick={() => fetchLeads(search.id)}
                  >
                    <span className={styles.searchNiche}>{search.niche}</span>
                    <span className={styles.searchCity}>{search.city}</span>
                    <span className={`${styles.searchStatus} ${styles[search.status]}`}>
                      {search.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <h2>
              {activeSearch
                ? `Results (${leads.length})`
                : "Select a search to view results"}
            </h2>
            {leads.length > 0 && (
              <button className={styles.exportBtn} onClick={handleExportCSV}>
                Export CSV
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>Loading results...</div>
          ) : (
            <div className={styles.leadGrid}>
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
