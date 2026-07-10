"use client";

import { TabType } from "@/app/page";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Calculator,
  CalendarDays,
  Infinity,
  Monitor,
  PanelsTopLeft,
  Settings,
  Timer,
  Trash2,
  CloudSun,
  Image,
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
  { id: "calendar", label: "日历", icon: CalendarDays, kind: "app", tone: "#E84A5F" },
  { id: "memo", label: "备忘录", icon: FileText, kind: "app", tone: "#F4D758" },
  { id: "weather", label: "天气", icon: CloudSun, kind: "app", tone: "#48A7E8" },
  { id: "clock", label: "时钟", icon: Timer, kind: "app", tone: "#252B36" },
  { id: "calculator", label: "计算器", icon: Calculator, kind: "app", tone: "#343A46" },
  { id: "photos", label: "照片", icon: Image, kind: "app", tone: "#B64FD2" },
  { id: "settings", label: "设置", icon: Settings, kind: "app", tone: "#7E8795" },
  { id: "trash", label: "废纸篓", icon: Trash2, kind: "app", tone: "#7B8490" },
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
      className="ollie-dock"
      aria-label="OllieOS Dock"
      style={{
        position: "fixed",
        bottom: "max(14px, env(safe-area-inset-bottom))",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        isolation: "isolate",
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        maxWidth: "calc(100vw - 24px)",
        // Keep the dock from becoming a scrollport that clips magnified icons.
        overflow: "visible",
        scrollbarWidth: "none",
        background: "var(--ollie-dock)",
        backdropFilter: "blur(30px) saturate(170%)",
        WebkitBackdropFilter: "blur(30px) saturate(170%)",
        border: "1px solid var(--ollie-border-strong)",
        borderRadius: 24,
        // Keep a real buffer above the dock: scaled icons grow upward from their bottom edge.
        padding: "24px 11px 7px",
        boxShadow: "0 18px 55px var(--ollie-shadow), inset 0 1px 0 rgba(255,255,255,0.24)",
      }}
    >
      {ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.kind === "tab" && activeTab === item.tab;
        const distance = hoveredIndex === null ? 3 : Math.abs(hoveredIndex - index);
        const lift = distance === 0 ? -14 : distance === 1 ? -7 : isActive ? -4 : 0;
        const magnification = distance === 0 ? 1.32 : distance === 1 ? 1.13 : isActive ? 1.08 : 1;
        const showDivider = index === 2;

        return (
          <div key={item.id} style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {showDivider && <span aria-hidden="true" style={{ width: 1, height: 38, marginBottom: 5, background: "rgba(255,255,255,0.3)" }} />}
            <button
              className="ollie-dock-button"
              aria-label={item.label}
              title={item.label}
              onClick={() => openItem(item)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
                gap: 5, width: 52, padding: 0, background: "none", border: "none", cursor: "pointer",
                borderRadius: 18, transition: "transform 180ms cubic-bezier(.2,.8,.2,1)",
                position: "relative", transform: `translateY(${lift}px) scale(${magnification})`, transformOrigin: "center bottom", flexShrink: 0,
                willChange: "transform",
              }}
            >
              {hoveredIndex === index && (
                <motion.div
                  layoutId="dock-label"
                  style={{ position: "absolute", bottom: 68, left: "50%", transform: "translateX(-50%)", padding: "5px 10px", borderRadius: 8, background: "rgba(22,22,28,0.84)", color: "#fff", fontSize: 12, whiteSpace: "nowrap", boxShadow: "0 8px 22px rgba(0,0,0,0.22)", pointerEvents: "none" }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                >{item.label}</motion.div>
              )}
              <span style={{
                width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: 16,
                color: "rgba(255,255,255,0.94)", background: `linear-gradient(145deg, ${item.tone}, ${item.tone}bb)`,
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: isActive ? "0 12px 32px rgba(43,127,216,0.42), inset 0 1px 0 rgba(255,255,255,0.32)" : "0 10px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.24)",
                position: "relative", zIndex: 1,
              }}>
                <Icon size={23} strokeWidth={1.8} />
              </span>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: isActive ? "rgba(255,255,255,0.82)" : "transparent", boxShadow: isActive ? "0 0 10px rgba(255,255,255,0.55)" : "none" }} />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
