"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./search.module.scss";
import { SearchForm } from "@/components/SearchForm";
import {
  Search,
  MapPin,
  CheckCircle2,
  Loader2,
  XCircle,
  CircleDot,
  Clock,
  ArrowRight,
} from "lucide-react";

interface SearchRecord {
  id: string;
  city: string;
  niche: string;
  resultsRequested: number;
  resultsFound: number;
  status: string;
  createdAt: string;
}

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [polling, setPolling] = useState<string | null>(null);

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

  const handleNewSearch = async (city: string, niche: string, count: number) => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, niche, resultsRequested: count }),
    });

    if (res.ok) {
      const data = await res.json();
      fetchSearches();
      pollSearch(data.searchId);
    }
  };

  const pollSearch = (searchId: string) => {
    setPolling(searchId);
    const interval = setInterval(async () => {
      const res = await fetch("/api/search");
      const data = await res.json();
      const search = data.find((s: SearchRecord) => s.id === searchId);

      if (search?.status === "completed" || search?.status === "failed") {
        clearInterval(interval);
        setPolling(null);
        fetchSearches();
        if (search?.status === "completed") {
          router.push(`/dashboard?searchId=${searchId}`);
        }
      }
    }, 5000);
  };

  const statusIcon = (s: string) => {
    switch (s) {
      case "completed": return <CheckCircle2 size={14} />;
      case "processing": return <Loader2 size={14} className={styles.spin} />;
      case "failed": return <XCircle size={14} />;
      default: return <CircleDot size={14} />;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Site Scraper</h1>
        <span className={styles.credits}>Credits: --</span>
      </header>

      <div className={styles.container}>
        <div className={styles.searchSection}>
          <div className={styles.searchCard}>
            <SearchForm onSearch={handleNewSearch} />
          </div>

          {polling && (
            <div className={styles.pollingBanner}>
              <Loader2 size={16} className={styles.spin} />
              <span>Search in progress... You&apos;ll be redirected when results are ready.</span>
            </div>
          )}
        </div>

        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <Clock size={16} />
            <h2>Search History</h2>
            <span className={styles.historyCount}>{searches.length}</span>
          </div>

          {searches.length === 0 ? (
            <div className={styles.emptyState}>
              <Search size={32} />
              <p>No searches yet. Start your first search above.</p>
            </div>
          ) : (
            <div className={styles.historyGrid}>
              {searches.map((search) => (
                <button
                  key={search.id}
                  className={styles.historyItem}
                  onClick={() => {
                    if (search.status === "completed") {
                      router.push(`/dashboard?searchId=${search.id}`);
                    }
                  }}
                  disabled={search.status !== "completed"}
                >
                  <div className={styles.historyItemTop}>
                    <div className={styles.historyInfo}>
                      <Search size={14} className={styles.historyIcon} />
                      <span className={styles.historyNiche}>{search.niche}</span>
                    </div>
                    <span className={`${styles.historyStatus} ${styles[search.status]}`}>
                      {statusIcon(search.status)}
                      <span>{search.status}</span>
                    </span>
                  </div>

                  <div className={styles.historyMeta}>
                    <span className={styles.historyCity}>
                      <MapPin size={12} />
                      {search.city}
                    </span>
                    <span className={styles.historyDate}>{formatDate(search.createdAt)}</span>
                  </div>

                  {search.status === "completed" && (
                    <div className={styles.historyFooter}>
                      <span>{search.resultsFound || search.resultsRequested} results</span>
                      <ArrowRight size={14} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
