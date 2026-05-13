"use client";

import { usePathname, useRouter } from "next/navigation";
import styles from "./Sidebar.module.scss";
import {
  SearchCode,
  LayoutDashboard,
  CreditCard,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: SearchCode, label: "Search", href: "/search" },
  { icon: LayoutDashboard, label: "Results", href: "/dashboard" },
];

const bottomItems = [
  { icon: CreditCard, label: "Credits", href: "/credits" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.iconRail}>
        {navItems.map((item) => (
          <div
            key={item.href}
            className={`${styles.railItem} ${pathname.startsWith(item.href) ? styles.railItemActive : ""}`}
            onClick={() => router.push(item.href)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </div>
        ))}
        <div className={styles.railDivider} />
        {bottomItems.map((item) => (
          <div
            key={item.href}
            className={`${styles.railItem} ${pathname.startsWith(item.href) ? styles.railItemActive : ""}`}
            onClick={() => router.push(item.href)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
