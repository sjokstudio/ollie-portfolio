"use client";

import { TabType } from "@/app/page";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Infinity,
  Monitor,
  Music2,
  PanelsTopLeft,
  Sparkles,
  Terminal,
  UserRound,
} from "lucide-react";
import { useState } from "react";

type DockItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  kind: "tab" | "app";
  tab?: TabType;
  tone: string;
};

const ITEMS: DockItem[] = [
  { id: "home", label: "桌面", icon: Monitor, kind: "tab", tab: "home", tone: "#2B7FD8" },
  { id: "works", label: "Studio", icon: PanelsTopLeft, kind: "tab", tab: "works", tone: "#6E7480" },
  { id: "system", label: "画布", icon: Infinity, kind: "tab", tab: "system", tone: "#25365D" },
  { id: "about", label: "About Ollie", icon: UserRound, kind: "app", tone: "#E0B62E" },
  { id: "music", label: "Music", icon: Music2, kind: "app", tone: "#E84A5F" },
  { id: "ai", label: "AI Lab", icon: Sparkles, kind: "app", tone: "#2B7FD8" },
  { id: "terminal", label: "Terminal", icon: Terminal, kind: "app", tone: "#252B36" },
  { id: "note", label: "Notes", icon: FileText, kind: "app", tone: "#D4AB22" },
];

export function PillNav({
  activeTab,
  onChange,
}: {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const openItem = (item: DockItem) => {
    if (item.kind === "tab") {
      onChange(item.tab!);
      return;
    }

    if (activeTab !== "home") onChange("home");
    // Wait one tick so the desktop window manager is mounted before opening an app.
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("ollie:open-window", { detail: item.id }));
    }, 120);
  };

  return (
    <nav
      aria-label="OllieOS Dock"
      style={{
        position: "fixed",
        bottom: "max(14px, env(safe-area-inset-bottom))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        maxWidth: "calc(100vw - 24px)",
        overflowX: "auto",
        scrollbarWidth: "none",
        background: "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(235,240,248,0.14))",
        backdropFilter: "blur(30px) saturate(170%)",
        WebkitBackdropFilter: "blur(30px) saturate(170%)",
        border: "1px solid rgba(255,255,255,0.34)",
        borderRadius: 24,
        padding: "9px 11px 7px",
        boxShadow: "0 18px 55px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.34)",
      }}
    >
      {ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.kind === "tab" && activeTab === item.tab;
        const distance = hoveredIndex === null ? 3 : Math.abs(hoveredIndex - index);
        const lift = distance === 0 ? -16 : distance === 1 ? -8 : isActive ? -6 : 0;
        const size = distance === 0 ? 68 : distance === 1 ? 59 : isActive ? 56 : 50;
        const showDivider = index === 2;

        return (
          <div key={item.id} style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {showDivider && <span aria-hidden="true" style={{ width: 1, height: 38, marginBottom: 5, background: "rgba(255,255,255,0.3)" }} />}
            <button
              aria-label={item.label}
              title={item.label}
              onClick={() => openItem(item)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
                gap: 5, width: size, padding: 0, background: "none", border: "none", cursor: "pointer",
                borderRadius: 18, transition: "width 180ms cubic-bezier(.2,.8,.2,1), transform 180ms cubic-bezier(.2,.8,.2,1)",
                position: "relative", transform: `translateY(${lift}px)`, flexShrink: 0,
              }}
            >
              {hoveredIndex === index && (
                <motion.div
                  layoutId="dock-label"
                  style={{ position: "absolute", bottom: size + 16, left: "50%", transform: "translateX(-50%)", padding: "5px 10px", borderRadius: 8, background: "rgba(22,22,28,0.84)", color: "#fff", fontSize: 12, whiteSpace: "nowrap", boxShadow: "0 8px 22px rgba(0,0,0,0.22)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                >{item.label}</motion.div>
              )}
              <span style={{
                width: size, height: size, display: "grid", placeItems: "center", borderRadius: 18,
                color: "rgba(255,255,255,0.94)", background: `linear-gradient(145deg, ${item.tone}, ${item.tone}bb)`,
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: isActive ? "0 12px 32px rgba(43,127,216,0.42), inset 0 1px 0 rgba(255,255,255,0.32)" : "0 10px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.24)",
                transition: "width 180ms cubic-bezier(.2,.8,.2,1), height 180ms cubic-bezier(.2,.8,.2,1)",
                position: "relative", zIndex: 1,
              }}>
                <Icon size={Math.round(size * 0.43)} strokeWidth={1.8} />
              </span>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? "rgba(255,255,255,0.82)" : "transparent", boxShadow: isActive ? "0 0 10px rgba(255,255,255,0.55)" : "none" }} />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
