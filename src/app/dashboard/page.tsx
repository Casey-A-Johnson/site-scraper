"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.scss";
import { SearchForm } from "@/components/SearchForm";
import { LeadCard } from "@/components/LeadCard";
import {
  Search,
  Clock,
  ChevronDown,
  ChevronRight,
  MapPin,
  Download,
  CheckCircle2,
  Loader2,
  XCircle,
  CircleDot,
  LayoutDashboard,
  SearchCode,
  History,
  Settings,
  CreditCard,
} from "lucide-react";

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
  const [historyOpen, setHistoryOpen] = useState(true);

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

  const statusIcon = (s: string) => {
    switch (s) {
      case "completed": return <CheckCircle2 size={12} />;
      case "processing": return <Loader2 size={12} className={styles.spin} />;
      case "failed": return <XCircle size={12} />;
      default: return <CircleDot size={12} />;
    }
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
        <aside className={styles.sidebar}>
          <nav className={styles.iconRail}>
            <div className={styles.railItem}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </div>
            <div className={styles.railItem}>
              <SearchCode size={18} />
              <span>New Search</span>
            </div>
            <div className={styles.railItem}>
              <History size={18} />
              <span>History</span>
            </div>
            <div className={styles.railDivider} />
            <div className={styles.railItem}>
              <CreditCard size={18} />
              <span>Credits</span>
            </div>
            <div className={styles.railItem}>
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </nav>

          <div className={styles.sidebarContent}>
            <SearchForm onSearch={handleNewSearch} />

            <div className={styles.searchHistory}>
              <button
                className={styles.historyToggle}
                onClick={() => setHistoryOpen(!historyOpen)}
              >
                {historyOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Clock size={14} />
                <span>Recent Searches</span>
                <span className={styles.historyCount}>{searches.length}</span>
              </button>

              {historyOpen && (
                <div className={styles.historyList}>
                  {searches.map((search) => (
                    <button
                      key={search.id}
                      className={`${styles.searchItem} ${activeSearch === search.id ? styles.active : ""}`}
                      onClick={() => fetchLeads(search.id)}
                    >
                      <div className={styles.searchItemTop}>
                        <Search size={13} className={styles.searchIcon} />
                        <span className={styles.searchNiche}>{search.niche}</span>
                        <span className={`${styles.searchStatus} ${styles[search.status]}`}>
                          {statusIcon(search.status)}
                        </span>
                      </div>
                      <div className={styles.searchItemBottom}>
                        <MapPin size={11} className={styles.searchCityIcon} />
                        <span className={styles.searchCity}>{search.city}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <h2>
              {activeSearch
                ? `Results (${leads.length})`
                : "Select a search to view results"}
            </h2>
            {leads.length > 0 && (
              <button className={styles.exportBtn} onClick={handleExportCSV}>
                <Download size={13} />
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
