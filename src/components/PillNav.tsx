"use client";
import { TabType } from "@/app/page";
import { motion } from "framer-motion";
import { useState } from "react";

const ITEMS: { id: TabType; icon: string; label: string }[] = [
  { id: "home",   icon: "🖥",  label: "桌面" },
  { id: "works",  icon: "🎛️", label: "Studio" },
  { id: "system", icon: "∞",  label: "画布" },
];

export function PillNav({
  activeTab,
  onChange,
}: {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}) {
  const [hovered, setHovered] = useState<TabType | null>(null);

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        gap: 6,
        alignItems: "flex-end",
        background: "rgba(22,22,28,0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 22,
        padding: "10px 14px",
        boxShadow: "0 8px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const isHov = hovered === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 16px 4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: 14,
              transition: "background 0.2s",
              position: "relative",
              /* bounce on hover */
              transform: isActive ? "translateY(-4px)" : isHov ? "translateY(-2px)" : "translateY(0)",
            }}
          >
            {/* Active glow background */}
            {isActive && (
              <motion.div
                layoutId="dock-glow"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 14,
                  background: "rgba(43,127,216,0.22)",
                  border: "1px solid rgba(43,127,216,0.3)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}

            {/* Icon */}
            <span style={{
              fontSize: 26,
              lineHeight: 1,
              filter: isActive ? "drop-shadow(0 0 6px rgba(244,215,88,0.5))" : "none",
              transition: "filter 0.2s, transform 0.18s cubic-bezier(0.34,1.56,0.64,1)",
              position: "relative",
              zIndex: 1,
            }}>
              {item.icon}
            </span>

            {/* Label */}
            <span style={{
              fontSize: 10,
              fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
              color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
              transition: "color 0.2s",
              position: "relative",
              zIndex: 1,
            }}>
              {item.label}
            </span>

            {/* Active dot */}
            {isActive && (
              <motion.div
                layoutId="dock-dot"
                style={{
                  width: 4, height: 4, borderRadius: "50%",
                  background: "rgba(255,255,255,0.7)",
                  position: "relative", zIndex: 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
