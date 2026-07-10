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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        gap: 12,
        alignItems: "flex-end",
        background: "linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0.1))",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.28)",
        borderRadius: 30,
        padding: "10px 14px 8px",
        boxShadow: "0 18px 55px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28)",
      }}
    >
      {ITEMS.map((item, index) => {
        const isActive = activeTab === item.id;
        const distance = hoveredIndex === null ? 3 : Math.abs(hoveredIndex - index);
        const lift = distance === 0 ? -16 : distance === 1 ? -8 : isActive ? -6 : 0;
        const size = distance === 0 ? 72 : distance === 1 ? 62 : isActive ? 58 : 52;
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 5,
              width: size,
              padding: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: 18,
              transition: "width 180ms cubic-bezier(.2,.8,.2,1), transform 180ms cubic-bezier(.2,.8,.2,1)",
              position: "relative",
              transform: `translateY(${lift}px)`,
            }}
          >
            {hoveredIndex === index && (
              <motion.div
                layoutId="dock-label"
                style={{
                  position: "absolute",
                  bottom: size + 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "5px 10px",
                  borderRadius: 8,
                  background: "rgba(22,22,28,0.82)",
                  color: "#fff",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                  boxShadow: "0 8px 22px rgba(0,0,0,0.22)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              >{item.label}</motion.div>
            )}

            <span
              style={{
                width: size,
                height: size,
                display: "grid",
                placeItems: "center",
                borderRadius: 18,
                fontSize: size * 0.48,
                lineHeight: 1,
                color: "#fff",
                background:
                  item.id === "home" ? "linear-gradient(145deg,#2c3440,#101722)" :
                  item.id === "works" ? "linear-gradient(145deg,#dfe3ea,#787f8b)" :
                  "linear-gradient(145deg,#233052,#101522)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: isActive
                  ? "0 12px 32px rgba(43,127,216,0.42), inset 0 1px 0 rgba(255,255,255,0.32)"
                  : "0 10px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.24)",
                transition: "width 180ms cubic-bezier(.2,.8,.2,1), height 180ms cubic-bezier(.2,.8,.2,1), font-size 180ms cubic-bezier(.2,.8,.2,1)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {item.icon}
            </span>

            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: isActive ? "rgba(255,255,255,0.82)" : "transparent",
              boxShadow: isActive ? "0 0 10px rgba(255,255,255,0.55)" : "none",
            }} />
          </button>
        );
      })}
    </nav>
  );
}
