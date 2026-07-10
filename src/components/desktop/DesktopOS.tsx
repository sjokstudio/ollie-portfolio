"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  createDefaultDesktopState,
  DESKTOP_STORAGE_KEY,
  LEGACY_DESKTOP_STORAGE_KEY,
  gridPosition,
  type DesktopItem,
  type DesktopState,
  type IdeaItem,
  type LocalNote,
  type MusicTrack,
  type WallpaperKey,
} from "./desktopStore";
import {
  AILabWindow as EnhancedAILabWindow,
  IdeaWindow,
  LinksWindow as EnhancedLinksWindow,
  MemoWindow as EnhancedMemoWindow,
  NowWindow as EnhancedNowWindow,
  SettingsWindow as EnhancedSettingsWindow,
  SignalWindow as EnhancedSignalWindow,
  TerminalWindow as EnhancedTerminalWindow,
  WeatherWindow as EnhancedWeatherWindow,
} from "./ContentWindows";
import { useTheme, type ResolvedTheme, type ThemeMode } from "@/components/theme/ThemeProvider";
import { Monitor, Moon, Sun } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface WindowDef {
  id: string;
  title: string;
  type: "about" | "music" | "ai" | "terminal" | "calendar" | "memo" | "idea" | "weather" | "clock" | "calculator" | "photos" | "settings" | "trash" | "now" | "signal" | "links" | "market" | "folder" | "localNote";
  zIndex: number;
  minimized?: boolean;
  x: number; y: number; w: number; h: number;
}

const WALLPAPERS: Record<WallpaperKey, { light: string; dark: string; name: string }> = {
  blue:   { light: "linear-gradient(145deg,#2B7FD8 0%,#348de6 58%,#2371c5 100%)", dark: "linear-gradient(145deg,#07192e 0%,#0c3158 58%,#0b2442 100%)", name: "Ocean Blue" },
  dark:   { light: "linear-gradient(145deg,#6f7d8f,#34445a)", dark: "linear-gradient(145deg,#070b11,#151d29)", name: "Midnight" },
  space:  { light: "linear-gradient(135deg,#31415c 0%,#4b4f78 50%,#24486d 100%)", dark: "linear-gradient(135deg,#08090d 0%,#17182b 50%,#0d2844 100%)", name: "Space" },
  forest: { light: "linear-gradient(135deg,#39815b 0%,#1e6040 100%)", dark: "linear-gradient(135deg,#0d2419 0%,#173b29 100%)", name: "Forest" },
  dusk:   { light: "linear-gradient(135deg,#7354bc 0%,#a64fc1 52%,#536ed6 100%)", dark: "linear-gradient(135deg,#22154d 0%,#55216d 52%,#182b61 100%)", name: "Dusk" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Star Wallpaper Hook
// ─────────────────────────────────────────────────────────────────────────────
const STAR_CHARS = ["✦", "✧", "★", "☆", "✶", "✴"];
const STAR_COUNT = 20;

function useStars(surfaceRef: React.RefObject<HTMLDivElement | null>, enabled: boolean, seed: number, theme: ResolvedTheme) {
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || !enabled) return;
    const stars: { el: HTMLSpanElement; px: number; py: number }[] = [];

    for (let i = 0; i < STAR_COUNT; i++) {
      const el = document.createElement("span");
      const bx = Math.random() * 100;
      const by = Math.random() * 100;
      el.textContent = STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)];
      const dur1 = 2 + Math.random() * 3;
      const dur2 = 3 + Math.random() * 4;
      const del  = Math.random() * 3;
      el.style.cssText = [
        `position:absolute`,
        `left:${bx}%`,
        `top:${by}%`,
        `color:${theme === "dark" ? "#F4D758" : "#ffe77c"}`,
        `font-size:${10 + Math.random() * 14}px`,
        `opacity:${0.4 + Math.random() * 0.5}`,
        `pointer-events:none`,
        `user-select:none`,
        `z-index:0`,
        `transition:transform 0.15s ease-out`,
        `animation:starTwinkle ${dur1}s ease-in-out ${del}s infinite,starWobble ${dur2}s ease-in-out ${del}s infinite`,
      ].join(";");
      surface.appendChild(el);
      stars.push({
        el,
        px: (bx / 100) * surface.clientWidth,
        py: (by / 100) * surface.clientHeight,
      });
    }

    const onMove = (e: MouseEvent) => {
      const rect = surface.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      stars.forEach(s => {
        const dx = mx - s.px;
        const dy = my - s.py;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 80) {
          const push  = (80 - d) / 80;
          const angle = Math.atan2(s.py - my, s.px - mx);
          s.el.style.transform = `translate(${Math.cos(angle) * push * 26}px,${Math.sin(angle) * push * 26}px)`;
        } else {
          s.el.style.transform = "";
        }
      });
    };

    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(".dicon,.os-win,.ctx-menu,.ollie-pet")) return;
      const pop = document.createElement("span");
      pop.textContent = "✦";
      pop.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;color:#F4D758;font-size:22px;pointer-events:none;z-index:9999;transform:translate(-50%,-50%) scale(0);animation:starPop 0.7s ease-out forwards`;
      document.body.appendChild(pop);
      setTimeout(() => pop.remove(), 750);
    };

    surface.addEventListener("mousemove", onMove);
    surface.addEventListener("click", onClick);
    return () => {
      surface.removeEventListener("mousemove", onMove);
      surface.removeEventListener("click", onClick);
      stars.forEach(s => s.el.remove());
    };
  }, [surfaceRef, enabled, seed, theme]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Clock Hook
// ─────────────────────────────────────────────────────────────────────────────
function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─────────────────────────────────────────────────────────────────────────────
// Window Manager Hook
// ─────────────────────────────────────────────────────────────────────────────
function useWindowManager() {
  const [windows, setWindows] = useState<WindowDef[]>([]);
  const [, setTopZ]           = useState(100);

  const openWindow = useCallback((def: Omit<WindowDef, "zIndex">) => {
    setTopZ(z => {
      const next = z + 1;
      setWindows(ws => {
        const ex = ws.find(w => w.id === def.id);
        if (ex) return ws.map(w => w.id === def.id ? { ...w, zIndex: next, minimized: false } : w);
        return [...ws, { ...def, zIndex: next }];
      });
      return next;
    });
  }, []);

  const closeWindow  = useCallback((id: string) => setWindows(ws => ws.filter(w => w.id !== id)), []);
  const bringToFront = useCallback((id: string) => {
    setTopZ(z => { const n = z + 1; setWindows(ws => ws.map(w => w.id === id ? { ...w, zIndex: n } : w)); return n; });
  }, []);
  const updateWindow = useCallback((id: string, patch: Partial<WindowDef>) =>
    setWindows(ws => ws.map(w => w.id === id ? { ...w, ...patch } : w)), []);

  return { windows, openWindow, closeWindow, bringToFront, updateWindow };
}

// ─────────────────────────────────────────────────────────────────────────────
// OS Window Component
// ─────────────────────────────────────────────────────────────────────────────
function OsWindow({ win, onClose, onFocus, onUpdate, children }: {
  win: WindowDef;
  onClose: () => void;
  onFocus: () => void;
  onUpdate: (p: Partial<WindowDef>) => void;
  children: React.ReactNode;
}) {
  const drag   = useRef<{ sx: number; sy: number; wx: number; wy: number } | null>(null);
  const resize = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);

  if (win.minimized) return null;

  return (
    <div
      className="os-win absolute flex flex-col rounded-[10px] overflow-hidden"
      style={{
        left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.zIndex,
        background: "var(--ollie-window)",
        color: "var(--ollie-text)",
        border: "1px solid var(--ollie-border-strong)",
        boxShadow: "0 20px 56px var(--ollie-shadow), 0 0 0 0.5px var(--ollie-border)",
        animation: "winPop 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}
      onPointerDown={onFocus}
    >
      {/* Title bar */}
      <div
        style={{
          height: 36, flexShrink: 0, display: "flex", alignItems: "center",
          padding: "0 12px", gap: 8,
          background: "var(--ollie-titlebar)", borderBottom: "1px solid var(--ollie-border)",
          cursor: "grab", userSelect: "none",
          fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
        }}
        onPointerDown={e => {
          e.preventDefault();
          drag.current = { sx: e.clientX, sy: e.clientY, wx: win.x, wy: win.y };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          if (!drag.current) return;
          onUpdate({ x: drag.current.wx + e.clientX - drag.current.sx, y: drag.current.wy + e.clientY - drag.current.sy });
        }}
        onPointerUp={() => { drag.current = null; }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6 }} onPointerDown={e => e.stopPropagation()}>
          <button onClick={onClose}
            style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56", border: "none", cursor: "pointer" }}
            className="group"
          />
          <button onClick={() => onUpdate({ minimized: true })}
            style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e", border: "none", cursor: "pointer" }}
          />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
        </div>
        <span style={{ flex: 1, textAlign: "center", fontSize: 12, color: "var(--ollie-muted)", paddingRight: 54 }}>
          {win.title}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", background: "var(--ollie-window)" }}>{children}</div>

      {/* Resize handle */}
      <div
        style={{ position: "absolute", bottom: 0, right: 0, width: 16, height: 16, cursor: "nwse-resize", zIndex: 10 }}
        onPointerDown={e => {
          e.preventDefault(); e.stopPropagation();
          resize.current = { sx: e.clientX, sy: e.clientY, sw: win.w, sh: win.h };
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          if (!resize.current) return;
          const minWidth = Math.min(320, window.innerWidth - 20);
          onUpdate({ w: Math.max(minWidth, resize.current.sw + e.clientX - resize.current.sx), h: Math.max(200, resize.current.sh + e.clientY - resize.current.sy) });
        }}
        onPointerUp={() => { resize.current = null; }}
      >
        <svg viewBox="0 0 10 10" style={{ width: "100%", height: "100%", opacity: 0.25 }}>
          <path d="M8 2L2 8M8 5L5 8" stroke="var(--ollie-text)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Icon
// ─────────────────────────────────────────────────────────────────────────────
function DesktopIcon({ item, iconEl, selected, onSelect, onOpen, onMove, onContextMenu }: {
  item: DesktopItem; iconEl: React.ReactNode;
  selected: boolean; onSelect: () => void; onOpen: () => void;
  onMove: (x: number, y: number) => void;
  onContextMenu: (event: React.MouseEvent) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const moved = useRef(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moved.current) { moved.current = false; return; }
    if (timer.current) { clearTimeout(timer.current); timer.current = null; onOpen(); }
    else { timer.current = setTimeout(() => { timer.current = null; onSelect(); }, 220); }
  };

  return (
    <div
      className="dicon absolute flex flex-col items-center gap-1.5 p-2 rounded-[10px] select-none cursor-default transition-colors"
      style={{ background: selected ? "rgba(255,255,255,0.22)" : "transparent", width: 80, left: item.x, top: item.y, touchAction: "none" }}
      role="button"
      tabIndex={0}
      aria-label={`打开${item.label}`}
      onClick={handleClick}
      onKeyDown={event => {
        if (event.key === "Enter") {
          event.preventDefault();
          onOpen();
        } else if (event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      onContextMenu={onContextMenu}
      onPointerDown={e => {
        if (e.button !== 0) return; e.stopPropagation();
        moved.current = false;
        dragRef.current = { mx: e.clientX, my: e.clientY, px: item.x, py: item.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        if (!dragRef.current) return;
        const dx = e.clientX - dragRef.current.mx;
        const dy = e.clientY - dragRef.current.my;
        if (Math.hypot(dx, dy) > 5) moved.current = true;
        if (moved.current) onMove(Math.max(0, dragRef.current.px + dx), Math.max(0, dragRef.current.py + dy));
      }}
      onPointerUp={() => { dragRef.current = null; }}
    >
      {iconEl}
      <span style={{
        fontSize: 11, textAlign: "center", lineHeight: 1.3, maxWidth: 72, wordBreak: "break-all",
        color: "rgba(255,255,255,0.92)",
        fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
        textShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }}>{item.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icon Art Helpers
// ─────────────────────────────────────────────────────────────────────────────
const FolderArt = ({ color = "#F4D758" }: { color?: string }) => (
  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", position: "relative", background: `linear-gradient(180deg,${color}bb,${color})`, boxShadow: "0 2px 6px rgba(0,0,0,0.22)" }}>
    <div style={{ position: "absolute", top: 0, left: 4, width: 18, height: 8, background: "rgba(255,255,255,0.38)", borderRadius: "3px 3px 0 0" }} />
  </div>
);
const AppArt = ({ emoji }: { emoji: string }) => (
  <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#1E5BA8,#2B7FD8)", boxShadow: "0 2px 8px rgba(30,91,168,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{emoji}</div>
);
const FileArt = ({ ext, color }: { ext: string; color: string }) => (
  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#fefcf6", border: "1.5px solid rgba(43,127,216,0.3)", boxShadow: "0 2px 5px rgba(30,91,168,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ fontSize: 8, fontFamily: "monospace", fontWeight: 700, padding: "2px 5px", borderRadius: 3, background: color, color: "#fff" }}>{ext}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Window Content
// ─────────────────────────────────────────────────────────────────────────────
function AboutWindow() {
  return (
    <div style={{ padding: "28px 32px", fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#2B7FD8,#F4D758)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>🎤</div>
        <div>
          <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 24, fontWeight: 900, color: "var(--ollie-text)", marginBottom: 4 }}>Ollie.</h1>
          <p style={{ fontSize: 11, color: "var(--ollie-muted)", fontFamily: "monospace", marginBottom: 10 }}>AI | Crypto | Music | 数字难民</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["#AI", "#Crypto", "#Music", "#数字难民"].map(t => (
              <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#2B7FD818", color: "#2B7FD8", fontFamily: "monospace" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--ollie-border)", paddingTop: 20 }}>
        {[
          { icon: "🤖", title: "常驻 X", desc: "刷 AI，刷币圈，刷音乐，也刷互联网里的各种怪东西。" },
          { icon: "🌍", title: "数字难民", desc: "在平台、工具、叙事和身份之间来回迁徙，顺便留下点东西。" },
        ].map(s => (
          <div key={s.title} style={{ border: "1px dashed rgba(43,127,216,0.28)", borderRadius: 4, padding: "13px 15px" }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", fontSize: 15, color: "#1E5BA8", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "var(--ollie-text-soft)", lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, fontSize: 12 }}>
        <a href="https://x.com/ool69loo" target="_blank" rel="noopener noreferrer" style={{ color: "#2B7FD8", textDecoration: "none" }}>𝕏 @ool69loo →</a>
      </div>
      <p style={{ marginTop: 18, fontSize: 11, color: "var(--ollie-muted)", fontStyle: "italic", lineHeight: 1.8 }}>“别太把自己当回事，也别太不把自己当回事。”</p>
    </div>
  );
}

function MusicWindow({ tracks, onChange }: { tracks: MusicTrack[]; onChange: (tracks: MusicTrack[]) => void }) {
  const [cur, setCur]   = useState(0);
  const [editing, setEditing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = tracks[cur];
  const updateTrack = (patch: Partial<MusicTrack>) => onChange(tracks.map((track, index) => index === cur ? { ...track, ...patch } : track));
  const loadAudio = (file: File) => {
    if (audioRef.current) audioRef.current.pause();
    updateTrack({ audioUrl: URL.createObjectURL(file), subtitle: t.subtitle === "等待导入第一首夜行音乐" || t.subtitle === "等待导入第二首夜行音乐" ? file.name : t.subtitle });
    setPlaying(false);
  };
  const togglePlayback = async () => {
    if (!audioRef.current || !t.audioUrl) return;
    if (audioRef.current.paused) {
      await audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };
  return (
    <div style={{ background: "#151821", color: "#faf6eb", height: "100%", display: "flex", flexDirection: "column", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>
      <div style={{ flex: "0 0 160px", background: `linear-gradient(135deg,${t.color},#2B7FD8,#151821)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: 60 }}>
        🎵
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent,#151821)" }} />
      </div>
      <audio ref={audioRef} src={t.audioUrl} onEnded={() => setPlaying(false)} />
      <div style={{ padding: "16px 22px 10px", textAlign: "center" }}>
        {editing ? <><input aria-label="曲目名称" value={t.title} onChange={e => updateTrack({ title: e.target.value })} style={{ width: "100%", background: "#222836", color: "#fff", border: "1px solid #46506a", borderRadius: 6, padding: "5px 8px", textAlign: "center" }} /><input aria-label="曲目说明" value={t.subtitle} onChange={e => updateTrack({ subtitle: e.target.value })} style={{ width: "100%", marginTop: 7, background: "#222836", color: "#c4c8d0", border: "1px solid #46506a", borderRadius: 6, padding: "5px 8px", textAlign: "center", fontSize: 11 }} /></> : <><div style={{ fontFamily: "var(--font-fraunces)", fontSize: 18, fontWeight: 900 }}>{t.title}</div><div style={{ fontSize: 11, color: "#8A8A9A", fontFamily: "monospace", marginTop: 3 }}>{t.subtitle}</div></>}
        <button onClick={() => setEditing(v => !v)} style={{ marginTop: 10, background: "transparent", border: "1px solid #3b4357", borderRadius: 999, color: "#cbd2df", padding: "4px 9px", cursor: "pointer", fontSize: 10 }}>{editing ? "完成编辑" : "编辑曲目"}</button>
      </div>
      <div style={{ padding: "0 22px 14px" }}>
        <div style={{ height: 3, background: "#222836", borderRadius: 999 }}>
          <div style={{ height: "100%", width: "0%", background: "#F4D758", borderRadius: 999 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8A8A9A", marginTop: 4, fontFamily: "monospace" }}>
          <span>0:00</span><span>--:--</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 18, paddingBottom: 18 }}>
        <button onClick={() => { setCur(c => (c - 1 + tracks.length) % tracks.length); }} style={{ background: "none", border: "none", color: "#faf6eb", fontSize: 18, cursor: "pointer", opacity: 0.7 }}>⏮</button>
        <button onClick={togglePlayback} aria-label={t.audioUrl ? (playing ? "暂停当前曲目" : "播放当前曲目") : "当前曲目等待导入"} style={{ width: 44, height: 44, borderRadius: "50%", background: t.audioUrl ? "#F4D758" : "#3b4357", border: "none", cursor: t.audioUrl ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#1A1A2E" }}>{playing ? "Ⅱ" : "▶"}</button>
        <button onClick={() => { setCur(c => (c + 1) % tracks.length); }} style={{ background: "none", border: "none", color: "#faf6eb", fontSize: 18, cursor: "pointer", opacity: 0.7 }}>⏭</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", borderTop: "1px solid #222836" }}>
        {tracks.map((tr, i) => (
          <div key={i} onClick={() => setCur(i)}
            style={{ display: "flex", gap: 12, padding: "10px 18px", cursor: "pointer", background: i === cur ? "#222836" : "transparent", borderLeft: i === cur ? "3px solid #F4D758" : "3px solid transparent", transition: "all 0.15s" }}
          >
            <span style={{ fontSize: 13, color: i === cur ? "#F4D758" : "#8A8A9A", fontFamily: "monospace", minWidth: 18 }}>{i + 1}</span>
            <div><div style={{ fontSize: 13, color: i === cur ? "#faf6eb" : "#8A8A9A" }}>{tr.title}</div><div style={{ fontSize: 10, color: "#4A4A5A", fontFamily: "monospace" }}>{tr.subtitle}</div></div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #222836", padding: "10px 18px 14px", background: "#11141b" }}>
        <label style={{ display: "block", border: "1px dashed #46506a", borderRadius: 8, padding: "9px 10px", color: "#cbd2df", fontSize: 11, cursor: "pointer", textAlign: "center" }}>
          导入当前曲目音频
          <input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/*" onChange={e => { const file = e.target.files?.[0]; if (file) loadAudio(file); e.currentTarget.value = ""; }} style={{ display: "none" }} />
        </label>
        <div style={{ marginTop: 6, color: "#6f7788", fontSize: 9, lineHeight: 1.5 }}>音频只保存在当前浏览器会话中。正式替换时，把文件交给我放进网站资源。</div>
      </div>
    </div>
  );
}

type MarketCandle = { time: number; open: number; high: number; low: number; close: number };
type BtcMarket = {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  candles: MarketCandle[];
  updatedAt: string;
  source: string;
};
type KrakenCandle = [number, string, string, string, string, string, string, number];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);
}

function BtcChart({ candles }: { candles: MarketCandle[] }) {
  if (!candles.length) return null;
  const width = 360;
  const height = 128;
  const padding = { top: 8, right: 8, bottom: 16, left: 8 };
  const high = Math.max(...candles.map(candle => candle.high));
  const low = Math.min(...candles.map(candle => candle.low));
  const range = Math.max(high - low, 1);
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const step = innerWidth / Math.max(candles.length, 1);
  const candleWidth = Math.max(2, Math.min(8, step * 0.58));
  const y = (price: number) => padding.top + ((high - price) / range) * innerHeight;

  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="比特币美元一小时 K 线图" style={{ display: "block", width: "100%", height: 128, overflow: "visible" }}>
    {[0.2, 0.5, 0.8].map(point => <line key={point} x1={padding.left} x2={width - padding.right} y1={padding.top + innerHeight * point} y2={padding.top + innerHeight * point} stroke="rgba(202,220,242,0.12)" strokeWidth="1" strokeDasharray="3 5" />)}
    {candles.map((candle, index) => {
      const rising = candle.close >= candle.open;
      const color = rising ? "#42d392" : "#f37477";
      const x = padding.left + index * step + step / 2;
      const bodyTop = y(Math.max(candle.open, candle.close));
      const bodyBottom = y(Math.min(candle.open, candle.close));
      return <g key={candle.time}>
        <line x1={x} x2={x} y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="1.15" opacity="0.92" />
        <rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={Math.max(1.5, bodyBottom - bodyTop)} rx="0.8" fill={color} />
      </g>;
    })}
    <text x={padding.left} y={height - 3} fill="rgba(202,220,242,0.58)" fontSize="9" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">24H</text>
    <text x={width - padding.right} y={height - 3} textAnchor="end" fill="rgba(202,220,242,0.58)" fontSize="9" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">NOW</text>
  </svg>;
}

function BtcMarketWindow() {
  const [market, setMarket] = useState<BtcMarket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const hasMarketRef = useRef(false);

  const loadMarket = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch("https://api.kraken.com/0/public/OHLC?pair=XBTUSD&interval=60", { cache: "no-store" });
      if (!response.ok) throw new Error("行情服务暂时不可用");
      const payload = await response.json() as { error: string[]; result: Record<string, KrakenCandle[] | number> };
      if (payload.error.length) throw new Error(payload.error.join(", "));
      const pairKey = Object.keys(payload.result).find(key => key !== "last");
      const rawCandles = pairKey ? payload.result[pairKey] : undefined;
      if (!Array.isArray(rawCandles) || rawCandles.length < 24) throw new Error("行情数据不足");
      const candles = rawCandles.slice(-24).map(([time, open, high, low, close]) => ({
        time: time * 1000,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
      }));
      const last24h = candles.slice(-24);
      const first = last24h[0];
      const latest = candles.at(-1)!;
      setMarket({
        symbol: "BTC/USD",
        price: latest.close,
        change24h: ((latest.close - first.open) / first.open) * 100,
        high24h: Math.max(...last24h.map(candle => candle.high)),
        low24h: Math.min(...last24h.map(candle => candle.low)),
        candles,
        updatedAt: new Date().toISOString(),
        source: "Kraken public market data",
      });
      hasMarketRef.current = true;
      setError(null);
    } catch {
      if (!hasMarketRef.current) setError("暂时无法读取实时行情，请稍后重试。");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void loadMarket(true), 0);
    const timer = window.setInterval(() => void loadMarket(), 60_000);
    return () => { window.clearTimeout(initialTimer); window.clearInterval(timer); };
  }, [loadMarket]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let active = true;

    const connect = () => {
      socket = new WebSocket("wss://ws.kraken.com/");
      socket.onopen = () => {
        socket?.send(JSON.stringify({ event: "subscribe", pair: ["XBT/USD"], subscription: { name: "ticker" } }));
        socket?.send(JSON.stringify({ event: "subscribe", pair: ["XBT/USD"], subscription: { name: "ohlc", interval: 60 } }));
      };
      socket.onmessage = event => {
        const payload: unknown = JSON.parse(event.data);
        setStreaming(true);
        if (!Array.isArray(payload) || payload[3] !== "XBT/USD") return;
        if (payload[2] === "ticker") {
          const ticker = payload[1] as { c?: [string] };
          const price = Number(ticker.c?.[0]);
          if (!Number.isFinite(price)) return;
          setMarket(previous => previous ? { ...previous, price, updatedAt: new Date().toISOString() } : previous);
          return;
        }
        if (typeof payload[2] !== "string" || !payload[2].startsWith("ohlc-")) return;
        const candle = payload[1] as string[];
        const [,, open, high, low, close] = candle;
        const values = [open, high, low, close].map(Number);
        if (values.some(value => !Number.isFinite(value))) return;
        setMarket(previous => {
          if (!previous?.candles.length) return previous;
          const candles = [...previous.candles];
          candles[candles.length - 1] = { ...candles[candles.length - 1], open: values[0], high: values[1], low: values[2], close: values[3] };
          return { ...previous, candles, price: values[3], updatedAt: new Date().toISOString() };
        });
      };
      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        if (!active) return;
        setStreaming(false);
        reconnectTimer = window.setTimeout(connect, 3_000);
      };
    };

    connect();
    return () => {
      active = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  const positive = (market?.change24h ?? 0) >= 0;
  const statusColor = positive ? "#42d392" : "#f37477";

  return <div style={{ minHeight: "100%", background: "#111722", color: "#edf4ff", padding: 14, fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div>
        <div style={{ color: "#f4d758", fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: "0.13em" }}>MARKET / LIVE</div>
        <h2 style={{ margin: "3px 0 0", fontSize: 18, letterSpacing: "-0.03em" }}>Bitcoin</h2>
      </div>
      <button onClick={() => void loadMarket(true)} disabled={loading} aria-label="刷新比特币行情" style={{ minWidth: 44, height: 32, border: "1px solid rgba(237,244,255,0.18)", borderRadius: 8, background: loading ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.09)", color: "#edf4ff", cursor: loading ? "wait" : "pointer", fontSize: 14, transition: "transform 160ms ease, background 160ms ease" }}>↻</button>
    </div>

    {error ? <div role="alert" style={{ marginTop: 24, padding: 14, border: "1px solid rgba(243,116,119,0.42)", borderRadius: 10, color: "#ffc4c6", background: "rgba(243,116,119,0.1)", fontSize: 13, lineHeight: 1.55 }}>{error}<button onClick={() => void loadMarket(true)} style={{ display: "block", marginTop: 10, border: "none", background: "#f4d758", color: "#111722", borderRadius: 6, padding: "7px 10px", fontWeight: 700, cursor: "pointer" }}>重新连接</button></div> : <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12 }}>
        <div>
          <div style={{ color: "rgba(237,244,255,0.55)", fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>BTC / USD</div>
          <div style={{ marginTop: 3, fontSize: 25, fontWeight: 760, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.04em" }}>{market ? `$${formatPrice(market.price)}` : "--"}</div>
        </div>
        <div style={{ color: statusColor, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{market ? `${positive ? "+" : ""}${market.change24h.toFixed(2)}%` : "--"}<div style={{ marginTop: 3, fontSize: 9, fontWeight: 500, color: "rgba(237,244,255,0.48)", textAlign: "right" }}>24H</div></div>
      </div>

      <div style={{ marginTop: 10, minHeight: 128, border: "1px solid rgba(202,220,242,0.12)", borderRadius: 9, padding: "3px 5px", background: "linear-gradient(180deg, rgba(57,78,112,0.2), rgba(17,23,34,0))" }}>
        {market ? <BtcChart candles={market.candles} /> : <div style={{ height: 128, display: "grid", placeItems: "center", color: "rgba(237,244,255,0.48)", fontSize: 12 }}>正在读取 K 线...</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 7, marginTop: 8 }}>
        <div style={{ padding: "8px 9px", borderRadius: 8, background: "rgba(255,255,255,0.05)" }}><div style={{ fontSize: 9, color: "rgba(237,244,255,0.5)" }}>24H HIGH</div><strong style={{ display: "block", marginTop: 3, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{market ? `$${formatPrice(market.high24h)}` : "--"}</strong></div>
        <div style={{ padding: "8px 9px", borderRadius: 8, background: "rgba(255,255,255,0.05)" }}><div style={{ fontSize: 9, color: "rgba(237,244,255,0.5)" }}>24H LOW</div><strong style={{ display: "block", marginTop: 3, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{market ? `$${formatPrice(market.low24h)}` : "--"}</strong></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8, fontSize: 9, color: "rgba(237,244,255,0.48)", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}><span>{streaming ? "● LIVE" : "○ RECONNECTING"}</span><span>{market ? `${new Date(market.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · 1H` : ""}</span></div>
    </>}
  </div>;
}

function LocalNoteWindow({ note, onChange }: { note: LocalNote; onChange: (patch: Partial<LocalNote>) => void }) {
  return <SystemWindow><input aria-label="便签标题" value={note.title} onChange={e => onChange({ title: e.target.value })} style={{ width: "100%", border: "none", borderBottom: "1px solid var(--ollie-border)", padding: "2px 0 10px", fontSize: 21, fontWeight: 700, background: "transparent", outline: "none", color: "var(--ollie-text)" }} /><textarea aria-label="便签内容" value={note.body} onChange={e => onChange({ body: e.target.value, updatedAt: new Date().toISOString() })} style={{ width: "100%", minHeight: 280, marginTop: 16, resize: "vertical", border: "none", outline: "none", background: "transparent", fontSize: 14, lineHeight: 1.8, color: "var(--ollie-text-soft)" }} /><div style={{ marginTop: 10, color: "var(--ollie-muted)", fontSize: 10 }}>自动保存在此浏览器 · {new Date(note.updatedAt).toLocaleDateString("zh-CN")}</div></SystemWindow>;
}

function FolderWindow({ title, onNewNote }: { title: string; onNewNote: () => void }) {
  return <SystemWindow><div style={{ fontSize: 11, color: "#D4AB22", letterSpacing: 1 }}>LOCAL FOLDER</div><h2 style={{ margin: "4px 0 6px", fontSize: 24 }}>{title}</h2><p style={{ margin: "0 0 20px", color: "var(--ollie-text-soft)", fontSize: 12 }}>这是当前浏览器里的私人文件夹。</p><button onClick={onNewNote} style={{ ...smallToolButton, background: "#2B7FD8", color: "#fff", border: "none" }}>新建便签</button></SystemWindow>;
}

function SystemWindow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <div className="ollie-theme-transition" style={{ height: "100%", overflow: "auto", padding: 22, background: dark ? "#1c1c1e" : "var(--ollie-window)", color: dark ? "#fff" : "var(--ollie-text)", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>{children}</div>;
}

function CalendarWindow() {
  const now = new Date();
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selected, setSelected] = useState(now.getDate());
  const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const title = month.toLocaleDateString("zh-CN", { year: "numeric", month: "long" });
  const changeMonth = (delta: number) => setMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  return <SystemWindow>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
      <div><div style={{ fontSize: 11, color: "var(--ollie-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Calendar</div><h2 style={{ margin: "4px 0 0", fontSize: 22 }}>{title}</h2></div>
      <div style={{ display: "flex", gap: 6 }}><button onClick={() => changeMonth(-1)} style={smallToolButton}>‹</button><button onClick={() => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))} style={smallToolButton}>今天</button><button onClick={() => changeMonth(1)} style={smallToolButton}>›</button></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, textAlign: "center", fontSize: 11 }}>
      {["日", "一", "二", "三", "四", "五", "六"].map(d => <span key={d} style={{ color: "var(--ollie-muted)", paddingBottom: 6 }}>{d}</span>)}
      {Array.from({ length: first }).map((_, i) => <span key={`empty-${i}`} />)}
      {Array.from({ length: days }, (_, i) => i + 1).map(day => {
        const active = day === selected;
        return <button key={day} onClick={() => setSelected(day)} style={{ aspectRatio: "1", border: "none", borderRadius: "50%", background: active ? "#2B7FD8" : "transparent", color: active ? "#fff" : "var(--ollie-text)", cursor: "pointer", fontSize: 12 }}>{day}</button>;
      })}
    </div>
    <div style={{ marginTop: 20, borderTop: "1px solid var(--ollie-border)", paddingTop: 14, color: "var(--ollie-text-soft)", fontSize: 12 }}><strong style={{ color: "var(--ollie-text)" }}>{month.getMonth() + 1} 月 {selected} 日</strong><br />今天没有安排。留一点空间给新的想法。</div>
  </SystemWindow>;
}

function ClockWindow() {
  const time = useClock();
  return <SystemWindow dark><div style={{ textAlign: "center", paddingTop: 36 }}><div style={{ fontSize: 64, fontWeight: 200, letterSpacing: -3 }}>{time}</div><div style={{ marginTop: 10, color: "#8A8A9A" }}>{new Date().toLocaleDateString("zh-CN", { weekday: "long", month: "long", day: "numeric" })}</div><div style={{ margin: "48px auto 0", width: 150, height: 150, borderRadius: "50%", border: "1px solid #34343a", position: "relative" }}><span style={{ position: "absolute", left: "50%", top: "50%", width: 3, height: 55, borderRadius: 3, background: "#F4D758", transformOrigin: "50% 100%", transform: "translate(-50%,-100%) rotate(35deg)" }} /><span style={{ position: "absolute", left: "50%", top: "50%", width: 2, height: 42, borderRadius: 3, background: "#fff", transformOrigin: "50% 100%", transform: "translate(-50%,-100%) rotate(145deg)" }} /></div></div></SystemWindow>;
}

function CalculatorWindow() {
  const [value, setValue] = useState("0");
  const press = (key: string) => setValue(v => {
    if (key === "AC") return "0";
    if (key === "=") {
      if (!/^[\d+\-*/().\s]+$/.test(v)) return "Error";
      try { return String(Function("return " + v)()); } catch { return "Error"; }
    }
    return v === "0" ? key : v + key;
  });
  return <SystemWindow dark><div style={{ textAlign: "right", fontSize: 34, minHeight: 54, padding: "12px 8px", overflow: "hidden" }}>{value}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>{["AC", "(", ")", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "="].map(key => <button key={key} onClick={() => press(key)} style={{ ...calcButton, gridColumn: key === "0" ? "span 2" : undefined, background: ["/", "*", "-", "+", "="].includes(key) ? "#2B7FD8" : "#34343a" }}>{key}</button>)}</div></SystemWindow>;
}

function PhotosWindow() {
  const colors = ["#2B7FD8", "#E84A5F", "#F4D758", "#4ade80", "#7c5cff", "#e58c42", "#2e9c9c", "#d85aa0"];
  return <SystemWindow><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, alignItems: "center" }}><div><div style={{ fontSize: 11, color: "#B64FD2", letterSpacing: 1 }}>PHOTOS</div><h2 style={{ margin: "4px 0 0", fontSize: 22 }}>照片</h2></div><span style={{ color: "var(--ollie-muted)", fontSize: 11 }}>Ollie Archive</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 }}>{colors.map((color, i) => <div key={color} style={{ aspectRatio: "1", borderRadius: 10, background: `linear-gradient(135deg,${color},#1A1A2E)`, display: "flex", alignItems: "flex-end", padding: 9, color: "#fff", fontSize: 11, boxShadow: "0 3px 10px rgba(0,0,0,0.12)" }}>Archive {String(i + 1).padStart(2, "0")}</div>)}</div></SystemWindow>;
}

function TrashWindow() {
  return <SystemWindow><div style={{ textAlign: "center", paddingTop: 72, color: "var(--ollie-muted)" }}><TrashIcon /><h2 style={{ color: "var(--ollie-text)", fontSize: 18, margin: "16px 0 8px" }}>废纸篓是空的</h2><p style={{ fontSize: 12 }}>暂时没有需要清理的东西。</p></div></SystemWindow>;
}

const smallToolButton: React.CSSProperties = { border: "1px solid var(--ollie-border)", background: "var(--ollie-surface)", borderRadius: 7, padding: "5px 9px", color: "var(--ollie-text-soft)", cursor: "pointer", fontSize: 12 };
const calcButton: React.CSSProperties = { minHeight: 44, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 16 };
const TrashIcon = () => <div style={{ width: 54, height: 62, margin: "0 auto", border: "2px solid #aeb3bb", borderTop: "none", borderRadius: "0 0 10px 10px", position: "relative" }}><div style={{ position: "absolute", left: -5, right: -5, top: -7, height: 3, background: "#aeb3bb", borderRadius: 3 }} /><div style={{ position: "absolute", left: 17, top: -15, width: 18, height: 8, border: "2px solid #aeb3bb", borderBottom: "none", borderRadius: "5px 5px 0 0" }} /></div>;

// ─────────────────────────────────────────────────────────────────────────────
// Context Menu
// ─────────────────────────────────────────────────────────────────────────────
interface CtxMenuState { x: number; y: number; }

function ContextMenu({ pos, wallpaper, theme, setWallpaper, onClose, onNewFolder, onNewNote, onArrange, onRefresh, onAbout }: {
  pos: CtxMenuState;
  wallpaper: WallpaperKey;
  theme: ResolvedTheme;
  setWallpaper: (k: WallpaperKey) => void;
  onClose: () => void;
  onNewFolder: () => void;
  onNewNote: () => void;
  onArrange: () => void;
  onRefresh: () => void;
  onAbout: () => void;
}) {
  const [wpOpen, setWpOpen] = useState(false);

  useEffect(() => {
    const h = () => onClose();
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const id = window.setTimeout(() => { document.addEventListener("click", h); document.addEventListener("keydown", k); }, 10);
    return () => { window.clearTimeout(id); document.removeEventListener("click", h); document.removeEventListener("keydown", k); };
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: "fixed", top: pos.y, left: pos.x, zIndex: 9000,
    background: "var(--ollie-menu)", backdropFilter: "blur(24px)",
    border: "1px solid var(--ollie-border-strong)", borderRadius: 10,
    padding: "4px 0", minWidth: 200,
    boxShadow: "0 10px 40px rgba(0,0,0,0.16)",
    fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
    fontSize: 13,
  };
  const itemStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "6px 14px", cursor: "pointer",
    color: "var(--ollie-text)", transition: "background 0.1s",
  };
  const sepStyle: React.CSSProperties = { height: 1, background: "var(--ollie-border)", margin: "4px 0" };

  return (
    <div className="ctx-menu" style={menuStyle} onClick={e => e.stopPropagation()}>
      {[
        { icon: "⊞", label: "排列图标", act: onArrange },
        { icon: "↻", label: "刷新桌面", act: onRefresh },
      ].map(i => (
        <div key={i.label} style={itemStyle} onClick={i.act}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(43,127,216,0.1)"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
        ><span>{i.icon}</span><span>{i.label}</span></div>
      ))}
      <div style={sepStyle} />
      {[
        { icon: "▣", label: "新建文件夹", act: () => { onNewFolder(); onClose(); } },
        { icon: "✎", label: "新建便签", act: () => { onNewNote(); onClose(); } },
      ].map(i => (
        <div key={i.label} style={itemStyle} onClick={i.act}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(43,127,216,0.1)"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
        ><span>{i.icon}</span><span>{i.label}</span></div>
      ))}
      <div style={sepStyle} />
      {/* Wallpaper */}
      <div
        style={{ ...itemStyle, justifyContent: "space-between", position: "relative" }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(43,127,216,0.1)"; setWpOpen(true); }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; setWpOpen(false); }}
      >
        <div style={{ display: "flex", gap: 10 }}><span>🎨</span><span>更换壁纸</span></div>
        <span style={{ opacity: 0.4, fontSize: 10 }}>›</span>
        {/* Submenu */}
        {wpOpen && (
          <div style={{
            position: "absolute", left: "100%", top: 0,
            background: "var(--ollie-menu)", backdropFilter: "blur(24px)",
            border: "1px solid var(--ollie-border-strong)", borderRadius: 10,
            padding: "8px", display: "flex", gap: 8,
            boxShadow: "0 10px 40px rgba(0,0,0,0.16)", zIndex: 9001,
          }}>
            {(Object.keys(WALLPAPERS) as WallpaperKey[]).map(k => (
              <div key={k} onClick={() => { setWallpaper(k); onClose(); }}
                style={{ cursor: "pointer", textAlign: "center" }}
              >
                <div style={{
                  width: 40, height: 28, borderRadius: 6,
                  background: WALLPAPERS[k][theme],
                  border: k === wallpaper ? "2px solid #2B7FD8" : "2px solid transparent",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }} />
                <div style={{ fontSize: 9, marginTop: 3, color: "var(--ollie-text-soft)", fontFamily: "monospace" }}>{WALLPAPERS[k].name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={sepStyle} />
      <div style={itemStyle}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(43,127,216,0.1)"}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
        onClick={() => { onAbout(); onClose(); }}
      ><span>ⓘ</span><span>关于 OllieOS</span></div>
    </div>
  );
}

function ItemMenu({ pos, canManage, onClose, onOpen, onRename, onDelete }: { pos: CtxMenuState; canManage: boolean; onClose: () => void; onOpen: () => void; onRename: () => void; onDelete: () => void }) {
  useEffect(() => {
    const close = () => onClose();
    const id = window.setTimeout(() => document.addEventListener("click", close), 10);
    return () => { window.clearTimeout(id); document.removeEventListener("click", close); };
  }, [onClose]);
  return <div className="ctx-menu" style={{ position: "fixed", top: pos.y, left: pos.x, zIndex: 9001, minWidth: 164, padding: "4px 0", borderRadius: 10, background: "var(--ollie-menu)", backdropFilter: "blur(24px)", boxShadow: "0 10px 40px var(--ollie-shadow)", border: "1px solid var(--ollie-border-strong)", fontSize: 13 }} onClick={e => e.stopPropagation()}>
    <button onClick={onOpen} style={{ width: "100%", border: "none", textAlign: "left", padding: "7px 14px", background: "transparent", cursor: "pointer", color: "var(--ollie-text)" }}>打开</button>
    {canManage && <>
      <button onClick={onRename} style={{ width: "100%", border: "none", textAlign: "left", padding: "7px 14px", background: "transparent", cursor: "pointer", color: "var(--ollie-text)" }}>重命名</button>
      <button onClick={onDelete} style={{ width: "100%", border: "none", textAlign: "left", padding: "7px 14px", background: "transparent", cursor: "pointer", color: "#C63D4E" }}>移到废纸篓</button>
    </>}
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ollie Dog: transparent, draggable desktop companion
// ─────────────────────────────────────────────────────────────────────────────
function PetEl({ pos, motionOn, onMove }: { pos: { x: number; y: number }; motionOn: boolean; onMove: (pos: { x: number; y: number }) => void }) {
  const [message, setMessage] = useState("汪，今天也要留点时间给自己。");
  const [patCount, setPatCount] = useState(0);
  const [jump, setJump] = useState(false);
  const dr = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!motionOn) return;
    const id = window.setInterval(() => {
      const idle = ["我在看星星。", "要不要去写点东西？", "尾巴摇一下，灵感就来了。", "Zzz... 我醒着。"];
      setMessage(idle[Math.floor(Math.random() * idle.length)]);
    }, 14000);
    return () => window.clearInterval(id);
  }, [motionOn]);

  const pat = () => {
    if (moved.current) { moved.current = false; return; }
    const count = patCount + 1;
    setPatCount(count);
    setMessage(count % 3 === 0 ? "被摸到了。再来一下？" : "汪！我在这里。" );
  };

  return (
    <div
      role="button"
      aria-label="Ollie 桌面宠物"
      title="点击互动，拖动移动"
      tabIndex={0}
      className="ollie-pet"
      onClick={e => { e.stopPropagation(); pat(); }}
      onDoubleClick={e => { e.stopPropagation(); setJump(true); setMessage("汪！星星给你。" ); window.setTimeout(() => setJump(false), 500); }}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pat(); } }}
      onPointerDown={e => { e.stopPropagation(); moved.current = false; dr.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={e => {
        if (!dr.current) return;
        const dx = e.clientX - dr.current.sx;
        const dy = e.clientY - dr.current.sy;
        if (Math.hypot(dx, dy) > 5) moved.current = true;
        if (moved.current) onMove({ x: dr.current.px + dx, y: dr.current.py + dy });
      }}
      onPointerUp={() => { if (moved.current) setMessage("好位置，我会守在这里。" ); dr.current = null; }}
      style={{
        position: "absolute", bottom: 64, right: "12%",
        transform: `translate(${pos.x}px,${pos.y}px)`,
        cursor: "grab", userSelect: "none", zIndex: 12000, touchAction: "none", width: 154,
      }}
    >
      <div style={{ position: "absolute", right: -6, top: -38, maxWidth: 142, padding: "7px 10px", borderRadius: 14, background: "rgba(255,255,255,0.92)", color: "#1A1A2E", fontSize: 10, lineHeight: 1.4, boxShadow: "0 5px 18px rgba(0,0,0,0.14)", opacity: 0.94 }}>{message}</div>
      <svg viewBox="0 0 150 150" width="154" height="154" aria-hidden="true" style={{ overflow: "visible", filter: "drop-shadow(0 12px 12px rgba(0,0,0,0.24))", transform: jump ? "translateY(-15px) scale(1.06)" : "none", transition: "transform 180ms cubic-bezier(.2,.9,.3,1)" }}>
        <g className={motionOn ? "ollie-dog-tail" : undefined} style={{ transformOrigin: "116px 105px" }}>
          <path d="M112 100c22-22 32-2 20 10-6 7-12 11-20 12" fill="#e9c99a" stroke="#5e4636" strokeWidth="4" strokeLinecap="round" />
        </g>
        <ellipse cx="76" cy="126" rx="45" ry="9" fill="rgba(18,40,77,0.22)" />
        <g className={motionOn ? "ollie-dog-ears" : undefined}>
          <path d="M42 64 31 30c-2-8 6-12 12-6l21 24M105 57l15-30c4-8 14-4 13 5l-4 34" fill="#e9c99a" stroke="#5e4636" strokeWidth="4" strokeLinejoin="round" />
        </g>
        <g className={motionOn ? "ollie-dog-body" : undefined}>
          <path d="M38 80c0-29 16-46 39-46 24 0 40 18 40 47v27c0 17-16 26-39 26s-40-9-40-26Z" fill="#f9e8c9" stroke="#5e4636" strokeWidth="4" strokeLinejoin="round" />
          <path d="M43 54c9-13 19-18 34-18 18 0 30 7 37 19-9-3-18-3-28 1-16 6-29 5-43-2Z" fill="#fff7e8" />
          <g className={motionOn ? "ollie-dog-blink" : undefined}>
            <ellipse cx="61" cy="82" rx="5" ry="5" fill="#1a2635" />
            <ellipse cx="94" cy="82" rx="5" ry="5" fill="#1a2635" />
          </g>
          <circle cx="74" cy="96" r="7" fill="#42332c" />
          <path d="M66 105c5 5 13 5 18 0" fill="none" stroke="#5e4636" strokeWidth="3" strokeLinecap="round" />
          <path d="M49 110c-7 13-9 22-4 28M104 110c7 13 9 22 4 28" fill="none" stroke="#e9c99a" strokeWidth="10" strokeLinecap="round" />
          <path d="M48 116c14 12 41 13 58 0l-4 18c-13 6-35 6-50 0Z" fill="#2B7FD8" stroke="#1E5BA8" strokeWidth="3" />
        </g>
        <path d="M77 126l7 9-7 7-7-7Z" fill="#F4D758" stroke="#b18416" strokeWidth="2" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Menubar SVG Icons
// ─────────────────────────────────────────────────────────────────────────────
const WifiIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="rgba(255,255,255,0.85)" stroke="none"/>
  </svg>
);
const VolumeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="rgba(255,255,255,0.85)" stroke="none"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);
const BatteryIcon = () => (
  <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
    <rect x="0.5" y="0.5" width="18" height="11" rx="2.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/>
    <rect x="2" y="2" width="13" height="8" rx="1.5" fill="rgba(255,255,255,0.85)"/>
    <path d="M19.5 4v4a2 2 0 0 0 0-4z" fill="rgba(255,255,255,0.5)"/>
  </svg>
);
const CtrlCenterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.85)">
    <circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main DesktopOS
// ─────────────────────────────────────────────────────────────────────────────
const APP_ART: Record<string, React.ReactNode> = {
  about: <FolderArt color="#F4D758" />,
  music: <FolderArt color="#E84A5F" />,
  ai: <FolderArt color="#2B7FD8" />,
  now: <FileArt ext="NOW" color="#2B7FD8" />,
  signal: <AppArt emoji="◈" />,
  links: <AppArt emoji="↗" />,
  idea: <FileArt ext="IDEA" color="#F4D758" />,
  memo: <FileArt ext="MD" color="#2B7FD8" />,
  terminal: <AppArt emoji=">_" />,
  canvas: <AppArt emoji="✦" />,
  btc: <AppArt emoji="₿" />,
};

const WIN_CONFIGS: Partial<Record<string, Omit<WindowDef, "zIndex" | "x" | "y">>> = {
  about:    { id: "about",    title: "About_Ollie",  type: "about",    w: 440, h: 480 },
  music:    { id: "music",    title: "Music",        type: "music",    w: 500, h: 620 },
  ai:       { id: "ai",       title: "AI_Lab",       type: "ai",       w: 660, h: 590 },
  now:      { id: "now",      title: "NOW.md",       type: "now",      w: 540, h: 510 },
  signal:   { id: "signal",   title: "SIGNAL_BOARD", type: "signal",   w: 650, h: 600 },
  links:    { id: "links",    title: "LINK_LOCKER",  type: "links",    w: 420, h: 410 },
  idea:     { id: "idea",     title: "IDEA_BOX",     type: "idea",     w: 610, h: 530 },
  terminal: { id: "terminal", title: "Ollie Assistant", type: "terminal", w: 580, h: 440 },
  calendar: { id: "calendar", title: "日历",         type: "calendar", w: 380, h: 420 },
  memo:     { id: "memo",     title: "备忘录",       type: "memo",     w: 650, h: 520 },
  weather:  { id: "weather",  title: "天气",         type: "weather",  w: 440, h: 620 },
  clock:    { id: "clock",    title: "时钟",         type: "clock",    w: 360, h: 430 },
  calculator:{ id: "calculator", title: "计算器",     type: "calculator", w: 330, h: 430 },
  photos:   { id: "photos",   title: "照片",         type: "photos",   w: 390, h: 480 },
  settings: { id: "settings", title: "设置",         type: "settings", w: 380, h: 420 },
  trash:    { id: "trash",    title: "废纸篓",       type: "trash",    w: 340, h: 330 },
  btc:      { id: "btc",      title: "BTC 行情",     type: "market",   w: 390, h: 400 },
};

function loadDesktopState(): DesktopState {
  const fallback = createDefaultDesktopState();
  if (typeof window === "undefined") return fallback;
  try {
    const currentRaw = window.localStorage.getItem(DESKTOP_STORAGE_KEY);
    const raw = currentRaw ?? window.localStorage.getItem(LEGACY_DESKTOP_STORAGE_KEY);
    if (!raw) return fallback;
    const isCurrentVersion = currentRaw !== null;
    const saved = JSON.parse(raw) as Partial<DesktopState>;
    const savedTracks = saved.tracks?.length ? saved.tracks : fallback.tracks;
    const savedItems: DesktopItem[] = saved.items?.length ? saved.items.map(item => {
      const starter = fallback.items.find(entry => entry.id === item.id);
      return starter?.kind === "app" ? { ...item, ...starter, x: item.x, y: item.y } : item;
    }) : [...fallback.items];
    fallback.items.forEach(item => { if (!savedItems.some(savedItem => savedItem.id === item.id)) savedItems.push(item); });
    const tracks = savedTracks.map(track => {
      const starter = fallback.tracks.find(item => item.id === track.id);
      const legacyTitle = track.title === "2026年3月31日 demo" || track.title === "2026年4月3日 demo";
      if (starter && legacyTitle) return { ...track, ...starter, audioUrl: starter.audioUrl };
      const merged = { ...starter, ...track, audioUrl: track.audioUrl ?? starter?.audioUrl };
      return merged.audioUrl?.startsWith("blob:") ? { ...merged, audioUrl: undefined } : merged;
    });
    const notes = Array.isArray(saved.notes) ? [...saved.notes] : [...fallback.notes];
    if (!isCurrentVersion) fallback.notes.forEach(note => { if (!notes.some(savedNote => savedNote.id === note.id)) notes.push(note); });
    const ideas = isCurrentVersion && Array.isArray(saved.ideas) ? saved.ideas : saved.ideas?.length ? saved.ideas : fallback.ideas;
    return { ...fallback, ...saved, items: savedItems, notes, ideas, tracks, weather: saved.weather ?? fallback.weather };
  } catch {
    return fallback;
  }
}

export default function DesktopOS({ onGoSystem }: { onGoSystem: () => void }) {
  const { mode, resolvedTheme, setMode } = useTheme();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const time       = useClock();
  const [desktop, setDesktop] = useState<DesktopState>(loadDesktopState);
  const [selected,  setSelected]    = useState<string | null>(null);
  const [ctxMenu,   setCtxMenu]     = useState<CtxMenuState | null>(null);
  const [itemMenu, setItemMenu] = useState<{ pos: CtxMenuState; item: DesktopItem } | null>(null);
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);
  const [starSeed, setStarSeed] = useState(0);
  const defaultsOpened = useRef(false);
  const { windows, openWindow, closeWindow, bringToFront, updateWindow } = useWindowManager();
  useStars(surfaceRef, desktop.motionOn, starSeed, resolvedTheme);

  useEffect(() => {
    const persistable = { ...desktop, tracks: desktop.tracks.map(track => track.audioUrl?.startsWith("blob:") ? { ...track, audioUrl: undefined } : track) };
    window.localStorage.setItem(DESKTOP_STORAGE_KEY, JSON.stringify(persistable));
  }, [desktop]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const notify = useCallback((message: string, undo?: () => void) => setToast({ message, undo }), []);
  const updateDesktop = useCallback((recipe: (prev: DesktopState) => DesktopState) => setDesktop(recipe), []);

  const surfacePoint = useCallback((point?: CtxMenuState) => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect || !point) return { x: 220, y: 80 };
    return { x: Math.max(0, point.x - rect.left), y: Math.max(0, point.y - rect.top) };
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<LocalNote>) => {
    updateDesktop(prev => ({ ...prev, notes: prev.notes.map(note => note.id === id ? { ...note, ...patch } : note) }));
  }, [updateDesktop]);

  const createManagedNote = useCallback((title = "新备忘录", body = "# 新备忘录\n\n把现在的想法留下来。") => {
    const id = `memo-${Date.now()}`;
    const note: LocalNote = { id, title, body, updatedAt: new Date().toISOString() };
    updateDesktop(prev => ({ ...prev, notes: [...prev.notes, note] }));
    notify("已新建备忘录");
    return id;
  }, [notify, updateDesktop]);

  const deleteManagedNote = useCallback((id: string) => {
    const note = desktop.notes.find(item => item.id === id);
    if (!note) return;
    updateDesktop(prev => ({ ...prev, notes: prev.notes.filter(item => item.id !== id) }));
    notify(`${note.title} 已删除`, () => updateDesktop(prev => ({ ...prev, notes: [...prev.notes, note] })));
  }, [desktop.notes, notify, updateDesktop]);

  const updateIdea = useCallback((id: string, patch: Partial<IdeaItem>) => {
    updateDesktop(prev => ({ ...prev, ideas: prev.ideas.map(idea => idea.id === id ? { ...idea, ...patch } : idea) }));
  }, [updateDesktop]);

  const createIdea = useCallback((title: string) => {
    const id = `idea-${Date.now()}`;
    const idea: IdeaItem = { id, title, summary: "补充这个想法为什么值得继续。", status: "seed", tags: ["Idea"], updatedAt: new Date().toISOString() };
    updateDesktop(prev => ({ ...prev, ideas: [idea, ...prev.ideas] }));
    notify("灵感已经放进盒子");
    return id;
  }, [notify, updateDesktop]);

  const deleteIdea = useCallback((id: string) => {
    const idea = desktop.ideas.find(item => item.id === id);
    if (!idea) return;
    updateDesktop(prev => ({ ...prev, ideas: prev.ideas.filter(item => item.id !== id) }));
    notify(`${idea.title} 已删除`, () => updateDesktop(prev => ({ ...prev, ideas: [idea, ...prev.ideas] })));
  }, [desktop.ideas, notify, updateDesktop]);

  const convertIdeaToNote = useCallback((idea: IdeaItem) => {
    const note: LocalNote = { id: `memo-${Date.now()}`, title: idea.title, body: `# ${idea.title}\n\n${idea.summary}\n\n- 状态：${idea.status}\n- 标签：${idea.tags.join(" / ")}`, updatedAt: new Date().toISOString(), pinned: true };
    updateDesktop(prev => ({ ...prev, notes: [...prev.notes.map(item => ({ ...item, pinned: false })), note] }));
    notify("已转换为备忘录");
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("ollie:open-window", { detail: "memo" })), 0);
  }, [notify, updateDesktop]);

  const openCustomWindow = useCallback((id: string, title: string, type: WindowDef["type"], w: number, h: number) => {
    const W = typeof window !== "undefined" ? window.innerWidth : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;
    const safeW = Math.min(w, W - 20);
    const safeH = Math.min(h, H - 74);
    openWindow({ id, title, type, w: safeW, h: safeH, x: Math.max(10, (W - safeW) / 2), y: Math.max(38, (H - safeH) / 2) });
  }, [openWindow]);

  const handleOpenIcon = useCallback((id: string) => {
    if (id === "canvas") { onGoSystem(); return; }
    const cfg = WIN_CONFIGS[id];
    if (!cfg) return;
    const W = typeof window !== "undefined" ? window.innerWidth  : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;
    const safeW = Math.min(cfg.w, W - 20);
    const safeH = Math.min(cfg.h, H - 74);
    openWindow({
      ...cfg,
      w: safeW,
      h: safeH,
      x: Math.max(10, (W - safeW) / 2 + (Math.random() - 0.5) * Math.min(120, W * .08)),
      y: Math.max(38, (H - safeH) / 2 + (Math.random() - 0.5) * Math.min(80, H * .06)),
    });
  }, [onGoSystem, openWindow]);

  useEffect(() => {
    if (defaultsOpened.current) return;
    defaultsOpened.current = true;
    const W = typeof window !== "undefined" ? window.innerWidth : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;
    const about = WIN_CONFIGS.about!;
    const music = WIN_CONFIGS.music!;
    const btc = WIN_CONFIGS.btc!;
    if (W < 900) {
      const w = Math.max(280, W - 20);
      const h = Math.max(240, H - 120);
      openWindow({ ...about, w: Math.min(about.w, w), h: Math.min(about.h, h), x: 10, y: 48 });
      openWindow({ ...music, w: Math.min(music.w, w), h: Math.min(music.h, h), x: 18, y: 76 });
      openWindow({ ...btc, w: Math.min(btc.w, w), h: Math.min(btc.h, h), x: 26, y: 104 });
      return;
    }
    openWindow({
      ...about,
      x: 64,
      y: 72,
    });
    openWindow({
      ...music,
      x: Math.min(W - music.w - 20, Math.max(520, W - 540)),
      y: 62,
    });
    openWindow({
      ...btc,
      x: Math.min(W - btc.w - 20, Math.max(520, W - 940)),
      y: Math.max(280, H - btc.h - 180),
    });
  }, [openWindow]);

  const openItem = useCallback((item: DesktopItem) => {
    if (item.kind === "app") { handleOpenIcon(item.appId ?? item.id); return; }
    if (item.kind === "note") { openCustomWindow(item.id, item.label, "localNote", 440, 440); return; }
    openCustomWindow(item.id, item.label, "folder", 360, 280);
  }, [handleOpenIcon, openCustomWindow]);

  const createFolder = useCallback((point?: CtxMenuState) => {
    const label = window.prompt("文件夹名称", "Untitled Folder")?.trim() || "Untitled Folder";
    const id = `folder-${Date.now()}`;
    const p = surfacePoint(point);
    updateDesktop(prev => ({ ...prev, items: [...prev.items, { id, label, kind: "folder", x: p.x, y: p.y }] }));
    notify(`已创建 ${label}`);
  }, [notify, surfacePoint, updateDesktop]);

  const createNote = useCallback((point?: CtxMenuState) => {
    const id = `note-${Date.now()}`;
    const note: LocalNote = { id, title: "Untitled Note", body: "# Untitled Note\n\n把现在的想法先留下来。", updatedAt: new Date().toISOString() };
    const p = surfacePoint(point);
    updateDesktop(prev => ({ ...prev, notes: [...prev.notes, note], items: [...prev.items, { id, label: note.title, kind: "note", noteId: id, x: p.x, y: p.y }] }));
    openCustomWindow(id, note.title, "localNote", 440, 440);
    notify("已新建便签");
  }, [notify, openCustomWindow, surfacePoint, updateDesktop]);

  const renameItem = useCallback((item: DesktopItem) => {
    const label = window.prompt("重命名", item.label)?.trim();
    if (!label) return;
    updateDesktop(prev => ({ ...prev, items: prev.items.map(entry => entry.id === item.id ? { ...entry, label } : entry), notes: item.kind === "note" ? prev.notes.map(note => note.id === item.noteId ? { ...note, title: label, updatedAt: new Date().toISOString() } : note) : prev.notes }));
    notify(`已重命名为 ${label}`);
  }, [notify, updateDesktop]);

  const deleteItem = useCallback((item: DesktopItem) => {
    if (item.kind === "app") return;
    const note = item.kind === "note" ? desktop.notes.find(entry => entry.id === item.noteId) : undefined;
    closeWindow(item.id);
    updateDesktop(prev => ({
      ...prev,
      items: prev.items.filter(entry => entry.id !== item.id),
      notes: note ? prev.notes.filter(entry => entry.id !== note.id) : prev.notes,
    }));
    notify(`${item.label} 已移到废纸篓`, () => updateDesktop(prev => ({
      ...prev,
      items: [...prev.items, item],
      notes: note ? [...prev.notes, note] : prev.notes,
    })));
  }, [closeWindow, desktop.notes, notify, updateDesktop]);

  useEffect(() => {
    const handleDockOpen = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (typeof id === "string") handleOpenIcon(id);
    };
    window.addEventListener("ollie:open-window", handleDockOpen);
    return () => window.removeEventListener("ollie:open-window", handleDockOpen);
  }, [handleOpenIcon]);

  const renderContent = (win: WindowDef) => {
    switch (win.type) {
      case "about":    return <AboutWindow />;
      case "music":    return <MusicWindow tracks={desktop.tracks} onChange={tracks => updateDesktop(prev => ({ ...prev, tracks }))} />;
      case "ai":       return <EnhancedAILabWindow />;
      case "now":      return <EnhancedNowWindow />;
      case "signal":   return <EnhancedSignalWindow />;
      case "links":    return <EnhancedLinksWindow notify={notify} />;
      case "terminal": return <EnhancedTerminalWindow />;
      case "calendar": return <CalendarWindow />;
      case "memo":     return <EnhancedMemoWindow notes={desktop.notes} onChange={updateNote} onCreate={createManagedNote} onDelete={deleteManagedNote} />;
      case "idea":     return <IdeaWindow ideas={desktop.ideas} onChange={updateIdea} onCreate={createIdea} onDelete={deleteIdea} onConvert={convertIdeaToNote} />;
      case "weather":  return <EnhancedWeatherWindow preference={desktop.weather} onPreferenceChange={weather => updateDesktop(prev => ({ ...prev, weather }))} />;
      case "clock":    return <ClockWindow />;
      case "calculator": return <CalculatorWindow />;
      case "photos":   return <PhotosWindow />;
      case "settings": return <EnhancedSettingsWindow motionOn={desktop.motionOn} setMotionOn={motionOn => updateDesktop(prev => ({ ...prev, motionOn }))} />;
      case "trash":    return <TrashWindow />;
      case "market":   return <BtcMarketWindow />;
      case "localNote": {
        const note = desktop.notes.find(entry => entry.id === win.id);
        return note ? <LocalNoteWindow note={note} onChange={patch => {
          updateNote(note.id, patch);
          if (patch.title) {
            updateDesktop(prev => ({
              ...prev,
              items: prev.items.map(item => item.noteId === note.id ? { ...item, label: patch.title! } : item),
            }));
          }
        }} /> : <TrashWindow />;
      }
      case "folder": return <FolderWindow title={win.title} onNewNote={() => createNote()} />;
      default:         return null;
    }
  };

  const wp = WALLPAPERS[desktop.wallpaper];
  const ThemeIcon = mode === "system" ? Monitor : mode === "light" ? Sun : Moon;
  const nextTheme: Record<ThemeMode, ThemeMode> = { system: "light", light: "dark", dark: "system" };

  return (
    <div className="w-full h-screen flex flex-col ollie-theme-transition" style={{ background: wp[resolvedTheme], overflow: "hidden" }}>

      {/* ── macOS Menubar ── */}
      <div className="ollie-menubar" style={{
        height: 30, display: "flex", alignItems: "center",
        padding: "0 16px", gap: 16, flexShrink: 0, zIndex: 800, position: "relative",
        background: "var(--ollie-menubar)", backdropFilter: "blur(14px)",
        fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
        fontSize: 13, color: "rgba(255,255,255,0.92)",
      }}>
        {/* Left: logo + menus */}
        <span style={{ fontFamily: "var(--font-fira-code)", fontSize: 15, fontWeight: 700, color: "#F4D758" }}>OllieOS</span>
        {["文件", "编辑", "显示", "窗口", "帮助"].map(m => (
          <span className="ollie-menubar-menu" key={m} style={{ opacity: 0.55, cursor: "default", fontSize: 13 }}>{m}</span>
        ))}

        {/* Right: system icons */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setMode(nextTheme[mode])} aria-label="切换主题" title={mode === "system" ? "跟随系统" : mode === "light" ? "浅色模式" : "深色模式"} style={{ width: 28, height: 26, display: "grid", placeItems: "center", border: 0, borderRadius: 7, background: "rgba(255,255,255,.08)", color: "inherit", cursor: "pointer" }}><ThemeIcon size={14} strokeWidth={1.8} /></button>
          <CtrlCenterIcon />
          <WifiIcon />
          <VolumeIcon />
          <BatteryIcon />
          <span style={{ fontFamily: "var(--font-fira-code)", fontSize: 12, color: "rgba(255,255,255,0.88)" }}>{time}</span>
        </div>
      </div>

      {/* ── Desktop Surface ── */}
      <div
        ref={surfaceRef}
        style={{ flex: 1, position: "relative", overflow: "hidden" }}
        onClick={() => { setSelected(null); setCtxMenu(null); setItemMenu(null); }}
        onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
      >
        <PetEl pos={desktop.pet} motionOn={desktop.motionOn} onMove={pet => updateDesktop(prev => ({ ...prev, pet }))} />

        {/* Icons */}
        {desktop.items.map(item => <DesktopIcon key={item.id} item={item} iconEl={item.kind === "folder" ? <FolderArt color="#F4D758" /> : item.kind === "note" ? <FileArt ext="MD" color="#2B7FD8" /> : APP_ART[item.appId ?? item.id]} selected={selected === item.id} onSelect={() => setSelected(item.id)} onOpen={() => openItem(item)} onMove={(x, y) => updateDesktop(prev => ({ ...prev, items: prev.items.map(entry => entry.id === item.id ? { ...entry, x, y } : entry) }))} onContextMenu={event => { event.preventDefault(); event.stopPropagation(); setCtxMenu(null); setItemMenu({ pos: { x: event.clientX, y: event.clientY }, item }); }} />)}

        {/* Windows */}
        {windows.map(win => (
          <OsWindow key={win.id} win={win}
            onClose={() => closeWindow(win.id)}
            onFocus={() => bringToFront(win.id)}
            onUpdate={p => updateWindow(win.id, p)}
          >{renderContent(win)}</OsWindow>
        ))}

        {/* Minimized dock */}
        {windows.filter(w => w.minimized).length > 0 && (
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 900 }}>
            {windows.filter(w => w.minimized).map(w => (
              <button key={w.id} onClick={() => updateWindow(w.id, { minimized: false })}
                style={{ background: "rgba(0,0,0,0.42)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "4px 12px", color: "rgba(255,255,255,0.85)", fontSize: 11, fontFamily: "monospace", cursor: "pointer" }}>
                {w.title}
              </button>
            ))}
          </div>
        )}

        {/* Context menu */}
        {ctxMenu && (
          <ContextMenu
            pos={ctxMenu}
            wallpaper={desktop.wallpaper}
            theme={resolvedTheme}
            setWallpaper={wallpaper => { updateDesktop(prev => ({ ...prev, wallpaper })); notify(`已切换到 ${WALLPAPERS[wallpaper].name}`); }}
            onClose={() => setCtxMenu(null)}
            onNewFolder={() => createFolder(ctxMenu)}
            onNewNote={() => createNote(ctxMenu)}
            onArrange={() => { updateDesktop(prev => ({ ...prev, items: prev.items.map((item, index) => ({ ...item, ...gridPosition(index) })) })); setCtxMenu(null); notify("图标已排列整齐"); }}
            onRefresh={() => { setStarSeed(seed => seed + 1); setSelected(null); setCtxMenu(null); notify("桌面已刷新"); }}
            onAbout={() => handleOpenIcon("about")}
          />
        )}
        {itemMenu && <ItemMenu pos={itemMenu.pos} canManage={itemMenu.item.kind !== "app"} onClose={() => setItemMenu(null)} onOpen={() => { openItem(itemMenu.item); setItemMenu(null); }} onRename={() => { renameItem(itemMenu.item); setItemMenu(null); }} onDelete={() => { deleteItem(itemMenu.item); setItemMenu(null); }} />}
        {toast && <div role="status" style={{ position: "absolute", right: 18, bottom: 18, zIndex: 9500, display: "flex", alignItems: "center", gap: 10, maxWidth: 300, padding: "10px 12px", borderRadius: 12, background: "rgba(20,29,48,0.86)", color: "#fff", boxShadow: "0 12px 30px rgba(0,0,0,.2)", backdropFilter: "blur(16px)", fontSize: 12 }}><span>{toast.message}</span>{toast.undo && <button onClick={() => { toast.undo?.(); setToast(null); }} style={{ border: "none", borderRadius: 7, padding: "4px 7px", background: "#F4D758", color: "#1A1A2E", cursor: "pointer", fontWeight: 700 }}>撤销</button>}</div>}
      </div>
    </div>
  );
}
