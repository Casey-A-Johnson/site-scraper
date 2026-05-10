"use client";

import { useState } from "react";
import styles from "./SearchForm.module.scss";

interface SearchFormProps {
  onSearch: (city: string, niche: string, count: number) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const [city, setCity] = useState("");
  const [niche, setNiche] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !niche) return;
    setLoading(true);
    onSearch(city, niche, count);
    setLoading(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3>New Search</h3>

      <div className={styles.field}>
        <label htmlFor="niche">Business Niche</label>
        <input
          id="niche"
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g. Plumbers, Dentists, Restaurants"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Austin, TX"
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="count">Number of Results</label>
        <div className={styles.rangeWrapper}>
          <input
            id="count"
            type="range"
            min={5}
            max={50}
            step={5}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <span>{count}</span>
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? "Searching..." : `Search (${count} credits)`}
      </button>
    </form>
  );
}
