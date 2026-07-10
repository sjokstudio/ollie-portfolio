"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
};

export const THEME_STORAGE_KEY = "ollieos-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [systemDark, setSystemDark] = useState(false);
  const resolvedTheme: ResolvedTheme = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  const applyTheme = useCallback((nextMode: ThemeMode) => {
    const resolved = nextMode === "system" ? systemTheme() : nextMode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeMode = nextMode;
    document.documentElement.style.colorScheme = resolved;
  }, []);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    applyTheme(nextMode);
  }, [applyTheme]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      const initialMode: ThemeMode = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
      setSystemDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      setModeState(initialMode);
      applyTheme(initialMode);
    }, 0);
    return () => window.clearTimeout(id);
  }, [applyTheme]);

  useEffect(() => { applyTheme(mode); }, [applyTheme, mode]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
      if (mode === "system") applyTheme("system");
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, [applyTheme, mode]);

  useEffect(() => {
    const onThemeRequest = (event: Event) => {
      const nextMode = (event as CustomEvent<ThemeMode>).detail;
      if (nextMode === "system" || nextMode === "light" || nextMode === "dark") setMode(nextMode);
    };
    window.addEventListener("ollie:set-theme", onThemeRequest);
    return () => window.removeEventListener("ollie:set-theme", onThemeRequest);
  }, [setMode]);

  const value = useMemo(() => ({ mode, resolvedTheme, setMode }), [mode, resolvedTheme, setMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
