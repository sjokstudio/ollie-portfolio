"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "./ThemeProvider";

const NEXT_MODE: Record<ThemeMode, ThemeMode> = { system: "light", light: "dark", dark: "system" };

export function ThemeCycleButton() {
  const { mode, setMode } = useTheme();
  const Icon = mode === "system" ? Monitor : mode === "light" ? Sun : Moon;
  const label = mode === "system" ? "跟随系统" : mode === "light" ? "浅色模式" : "深色模式";
  return (
    <button
      type="button"
      aria-label={`${label}，点击切换主题`}
      title={`${label} · 点击切换`}
      onClick={() => setMode(NEXT_MODE[mode])}
      style={{
        width: 40,
        height: 40,
        display: "grid",
        placeItems: "center",
        border: "1px solid var(--ollie-border)",
        borderRadius: 12,
        background: "var(--ollie-surface)",
        color: "var(--ollie-text)",
        cursor: "pointer",
      }}
    >
      <Icon size={18} strokeWidth={1.8} />
    </button>
  );
}

