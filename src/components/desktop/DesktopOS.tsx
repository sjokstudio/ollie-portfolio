"use client";
import { useEffect, useRef, useCallback, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface WindowDef {
  id: string;
  title: string;
  type: "about" | "music" | "ai" | "terminal" | "note";
  zIndex: number;
  minimized?: boolean;
  x: number; y: number; w: number; h: number;
}

type WallpaperKey = "blue" | "dark" | "space" | "forest" | "dusk";

const WALLPAPERS: Record<WallpaperKey, { bg: string; name: string }> = {
  blue:   { bg: "#2B7FD8",                                                                     name: "Ocean Blue"  },
  dark:   { bg: "#0d1117",                                                                     name: "Midnight"    },
  space:  { bg: "linear-gradient(135deg,#0a0a0c 0%,#1a1a2e 50%,#16213e 100%)",               name: "Space"       },
  forest: { bg: "linear-gradient(135deg,#1a3a2a 0%,#2d5a3d 100%)",                           name: "Forest"      },
  dusk:   { bg: "linear-gradient(135deg,#2d1b69 0%,#8e2de2 50%,#4a00e0 100%)",               name: "Dusk"        },
};

// ─────────────────────────────────────────────────────────────────────────────
// Star Wallpaper Hook
// ─────────────────────────────────────────────────────────────────────────────
const STAR_CHARS = ["✦", "✧", "★", "☆", "✶", "✴"];
const STAR_COUNT = 32;

function useStars(surfaceRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
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
        `color:#F4D758`,
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
      if ((e.target as HTMLElement).closest(".dicon,.os-win,.ctx-menu")) return;
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
  }, [surfaceRef]);
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
  const [topZ, setTopZ]       = useState(100);

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
        background: "#fefcf6",
        border: "1px solid rgba(0,0,0,0.13)",
        boxShadow: "0 20px 56px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.05)",
        animation: "winPop 0.22s cubic-bezier(0.16,1,0.3,1)",
      }}
      onPointerDown={onFocus}
    >
      {/* Title bar */}
      <div
        style={{
          height: 36, flexShrink: 0, display: "flex", alignItems: "center",
          padding: "0 12px", gap: 8,
          background: "#eeece8", borderBottom: "1px solid rgba(0,0,0,0.07)",
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
        <span style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#8A8A9A", paddingRight: 54 }}>
          {win.title}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", background: "#fefcf6" }}>{children}</div>

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
          onUpdate({ w: Math.max(320, resize.current.sw + e.clientX - resize.current.sx), h: Math.max(200, resize.current.sh + e.clientY - resize.current.sy) });
        }}
        onPointerUp={() => { resize.current = null; }}
      >
        <svg viewBox="0 0 10 10" style={{ width: "100%", height: "100%", opacity: 0.25 }}>
          <path d="M8 2L2 8M8 5L5 8" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Icon
// ─────────────────────────────────────────────────────────────────────────────
function DesktopIcon({ id, label, iconEl, selected, onSelect, onOpen }: {
  id: string; label: string; iconEl: React.ReactNode;
  selected: boolean; onSelect: () => void; onOpen: () => void;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timer.current) { clearTimeout(timer.current); timer.current = null; onOpen(); }
    else { timer.current = setTimeout(() => { timer.current = null; onSelect(); }, 220); }
  };

  return (
    <div
      className="dicon absolute flex flex-col items-center gap-1.5 p-2 rounded-[10px] select-none cursor-default transition-colors"
      style={{ background: selected ? "rgba(255,255,255,0.22)" : "transparent", width: 80, transform: `translate(${pos.x}px,${pos.y}px)` }}
      onClick={handleClick}
      onPointerDown={e => {
        if (e.button !== 0) return; e.stopPropagation();
        dragRef.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => {
        if (!dragRef.current) return;
        setPos({ x: dragRef.current.px + e.clientX - dragRef.current.mx, y: dragRef.current.py + e.clientY - dragRef.current.my });
      }}
      onPointerUp={() => { dragRef.current = null; }}
    >
      {iconEl}
      <span style={{
        fontSize: 11, textAlign: "center", lineHeight: 1.3, maxWidth: 72, wordBreak: "break-all",
        color: "rgba(255,255,255,0.92)",
        fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
        textShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }}>{label}</span>
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
          <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 24, fontWeight: 900, color: "#1A1A2E", marginBottom: 4 }}>Ollie x</h1>
          <p style={{ fontSize: 11, color: "#8A8A9A", fontFamily: "monospace", marginBottom: 10 }}>AI Researcher · Rapper · Music Producer</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["#AI", "#Crypto", "#Rap", "#Cubase"].map(t => (
              <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "#2B7FD818", color: "#2B7FD8", fontFamily: "monospace" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid #eae8e4", paddingTop: 20 }}>
        {[
          { icon: "🤖", title: "AI Research", desc: "构建 AI Agent 系统，研究量化交易与大模型应用" },
          { icon: "🎵", title: "Music Production", desc: "制作人 · 说唱艺术家，Cubase Pro 13 主战场" },
        ].map(s => (
          <div key={s.title} style={{ border: "1px dashed rgba(43,127,216,0.28)", borderRadius: 4, padding: "13px 15px" }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
            <div style={{ fontFamily: "var(--font-fraunces)", fontStyle: "italic", fontSize: 15, color: "#1E5BA8", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, fontSize: 12 }}>
        <a href="https://x.com/ool69loo" target="_blank" rel="noopener noreferrer" style={{ color: "#2B7FD8", textDecoration: "none" }}>𝕏 @ool69loo →</a>
      </div>
      <p style={{ marginTop: 18, fontSize: 11, color: "#8A8A9A", fontStyle: "italic", lineHeight: 1.8 }}>"1 Person + AI = 1 Team. 在 AI 时代认真做自己。"</p>
    </div>
  );
}

function MusicWindow() {
  const [cur, setCur]   = useState(0);
  const [play, setPlay] = useState(false);
  const tracks = [
    { title: "Track 01", sub: "Coming Soon" },
    { title: "Track 02", sub: "Coming Soon" },
    { title: "Track 03", sub: "Coming Soon" },
  ];
  const t = tracks[cur];
  return (
    <div style={{ background: "#151821", color: "#faf6eb", height: "100%", display: "flex", flexDirection: "column", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>
      <div style={{ flex: "0 0 160px", background: "linear-gradient(135deg,#1E5BA8,#2B7FD8,#F4D758)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", fontSize: 60 }}>
        🎵
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent,#151821)" }} />
      </div>
      <div style={{ padding: "16px 22px 10px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-fraunces)", fontSize: 18, fontWeight: 900 }}>{t.title}</div>
        <div style={{ fontSize: 11, color: "#8A8A9A", fontFamily: "monospace", marginTop: 3 }}>{t.sub}</div>
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
        <button onClick={() => setPlay(p => !p)} style={{ width: 44, height: 44, borderRadius: "50%", background: "#F4D758", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#1A1A2E" }}>{play ? "⏸" : "▶"}</button>
        <button onClick={() => { setCur(c => (c + 1) % tracks.length); }} style={{ background: "none", border: "none", color: "#faf6eb", fontSize: 18, cursor: "pointer", opacity: 0.7 }}>⏭</button>
      </div>
      <div style={{ flex: 1, overflow: "auto", borderTop: "1px solid #222836" }}>
        {tracks.map((tr, i) => (
          <div key={i} onClick={() => setCur(i)}
            style={{ display: "flex", gap: 12, padding: "10px 18px", cursor: "pointer", background: i === cur ? "#222836" : "transparent", borderLeft: i === cur ? "3px solid #F4D758" : "3px solid transparent", transition: "all 0.15s" }}
          >
            <span style={{ fontSize: 13, color: i === cur ? "#F4D758" : "#8A8A9A", fontFamily: "monospace", minWidth: 18 }}>{i + 1}</span>
            <div><div style={{ fontSize: 13, color: i === cur ? "#faf6eb" : "#8A8A9A" }}>{tr.title}</div><div style={{ fontSize: 10, color: "#4A4A5A", fontFamily: "monospace" }}>{tr.sub}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerminalWindow() {
  const [lines, setLines] = useState([
    { t: "out", v: "OllieOS v1.0.0 — AI Research Terminal" },
    { t: "out", v: 'Type "help" to see available commands.' },
    { t: "prompt", v: "" },
  ]);
  const [inp, setInp] = useState("");
  const bot = useRef<HTMLDivElement>(null);
  const CMDS: Record<string, string[]> = {
    help:   ["Available commands:", "  whoami  skills  music  clear"],
    whoami: ["Ollie x", "AI Researcher · Rapper · @ool69loo"],
    skills: ["[AI]     LLM, Agents, RAG", "[Crypto] Quant, On-chain", "[Music]  Cubase, 808s", "[Dev]    Python, TypeScript"],
    music:  ["Track 01 — loading...", "Track 02 — loading...", "Track 03 — loading...", "→ Open Music_Studio for full player"],
    clear:  [],
  };
  const submit = () => {
    const cmd = inp.trim().toLowerCase(); setInp("");
    const prev = [...lines.slice(0, -1), { t: "cmd", v: `$ ${cmd}` }];
    if (cmd === "clear") { setLines([{ t: "prompt", v: "" }]); return; }
    const out = CMDS[cmd] ?? [`zsh: command not found: ${cmd}`];
    setLines([...prev, ...out.map(v => ({ t: "out", v })), { t: "prompt", v: "" }]);
  };
  useEffect(() => { bot.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);
  return (
    <div style={{ background: "#0f1115", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px", fontSize: 13, lineHeight: 1.7, fontFamily: "monospace" }}>
        {lines.map((l, i) => <div key={i} style={{ color: l.t === "cmd" ? "#F4D758" : "rgba(74,222,128,0.85)" }}>{l.v}</div>)}
        <div ref={bot} />
      </div>
      <div style={{ borderTop: "1px solid #222836", padding: "7px 14px", display: "flex", gap: 8 }}>
        <span style={{ color: "#2B7FD8", fontSize: 13, fontFamily: "monospace" }}>$</span>
        <input autoFocus value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#4ade80", fontSize: 13, fontFamily: "monospace" }} placeholder="type a command..." />
      </div>
    </div>
  );
}

function NoteWindow() {
  return (
    <div style={{ padding: "28px 32px", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#8A8A9A", marginBottom: 4 }}>_notes.md</div>
      <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, fontWeight: 900, color: "#1E5BA8", marginBottom: 16, lineHeight: 1.2 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 400, color: "#2B7FD8", fontSize: 14 }}># </span>
        AI 时代的音乐制作
      </h1>
      <p style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.85, marginBottom: 14 }}>用 AI 做音乐，不是为了替代创作，而是为了扩张创作的边界。当一个 beat 出现在脑子里的时候，我希望实现它的速度跟得上我的想象力。</p>
      <p style={{ fontSize: 14, color: "#4A4A5A", lineHeight: 1.85, marginBottom: 14 }}>Cubase 是我的主战场。808 bassline 的 saturation，vocal chain 的 de-ess 频段，这些细节决定了作品的质感。AI 工具帮我更快地验证想法，但最终推出去的每个元素，还是我亲手捏的。</p>
      <div style={{ marginTop: 24, fontFamily: "monospace", fontSize: 10, color: "#8A8A9A" }}>— Ollie x · 2026</div>
    </div>
  );
}

function AILabWindow() {
  const projs = [
    { n: "Trading Agent System", d: "多策略量化交易 Agent，含情绪分析模块", t: "Python · LangChain" },
    { n: "RAG Knowledge Base",   d: "个人知识库 RAG，支持自然语言检索",     t: "TypeScript · Vector DB" },
    { n: "Beat Classifier",      d: "ML 自动分类 beatmaking 素材",          t: "Python · Audio ML" },
  ];
  return (
    <div style={{ padding: 28, fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>
      <h1 style={{ fontFamily: "var(--font-fraunces)", fontSize: 20, fontWeight: 900, color: "#1E5BA8", marginBottom: 20 }}>
        <span style={{ fontFamily: "monospace", fontWeight: 400, color: "#2B7FD8", fontSize: 14 }}># </span>AI Lab
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projs.map((p, i) => (
          <div key={i} style={{ background: "#fefcf6", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}><span>📁</span><span style={{ fontWeight: 500, fontSize: 14 }}>{p.n}</span></div>
            <div style={{ fontSize: 12, color: "#4A4A5A", lineHeight: 1.6, marginLeft: 22, marginBottom: 8 }}>{p.d}</div>
            <span style={{ fontSize: 10, fontFamily: "monospace", padding: "2px 8px", borderRadius: 999, background: "#2B7FD815", color: "#2B7FD8", marginLeft: 22 }}>{p.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Context Menu
// ─────────────────────────────────────────────────────────────────────────────
interface CtxMenuState { x: number; y: number; }

function ContextMenu({ pos, wallpaper, setWallpaper, onClose, onNewFolder }: {
  pos: CtxMenuState;
  wallpaper: WallpaperKey;
  setWallpaper: (k: WallpaperKey) => void;
  onClose: () => void;
  onNewFolder: () => void;
}) {
  const [wpOpen, setWpOpen] = useState(false);

  useEffect(() => {
    const h = () => onClose();
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    setTimeout(() => { document.addEventListener("click", h); document.addEventListener("keydown", k); }, 10);
    return () => { document.removeEventListener("click", h); document.removeEventListener("keydown", k); };
  }, [onClose]);

  const menuStyle: React.CSSProperties = {
    position: "fixed", top: pos.y, left: pos.x, zIndex: 9000,
    background: "rgba(248,246,242,0.94)", backdropFilter: "blur(24px)",
    border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10,
    padding: "4px 0", minWidth: 200,
    boxShadow: "0 10px 40px rgba(0,0,0,0.16)",
    fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
    fontSize: 13,
  };
  const itemStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "6px 14px", cursor: "pointer",
    color: "#1A1A2E", transition: "background 0.1s",
  };
  const sepStyle: React.CSSProperties = { height: 1, background: "rgba(0,0,0,0.08)", margin: "4px 0" };

  return (
    <div className="ctx-menu" style={menuStyle} onClick={e => e.stopPropagation()}>
      {[
        { icon: "⊞", label: "排列图标", act: onClose },
        { icon: "↻", label: "刷新桌面", act: onClose },
      ].map(i => (
        <div key={i.label} style={itemStyle} onClick={i.act}
          onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(43,127,216,0.1)"}
          onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
        ><span>{i.icon}</span><span>{i.label}</span></div>
      ))}
      <div style={sepStyle} />
      {[
        { icon: "📁", label: "新建文件夹", act: () => { onNewFolder(); onClose(); } },
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
            background: "rgba(248,246,242,0.96)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(0,0,0,0.12)", borderRadius: 10,
            padding: "8px", display: "flex", gap: 8,
            boxShadow: "0 10px 40px rgba(0,0,0,0.16)", zIndex: 9001,
          }}>
            {(Object.keys(WALLPAPERS) as WallpaperKey[]).map(k => (
              <div key={k} onClick={() => { setWallpaper(k); onClose(); }}
                style={{ cursor: "pointer", textAlign: "center" }}
              >
                <div style={{
                  width: 40, height: 28, borderRadius: 6,
                  background: WALLPAPERS[k].bg,
                  border: k === wallpaper ? "2px solid #2B7FD8" : "2px solid transparent",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }} />
                <div style={{ fontSize: 9, marginTop: 3, color: "#4A4A5A", fontFamily: "monospace" }}>{WALLPAPERS[k].name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={sepStyle} />
      <div style={itemStyle}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "rgba(43,127,216,0.1)"}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
        onClick={onClose}
      ><span>ℹ️</span><span>关于 OllieOS</span></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Draggable Sticker
// ─────────────────────────────────────────────────────────────────────────────
function StickerEl() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dr = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  return (
    <div
      onPointerDown={e => { e.stopPropagation(); dr.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (!dr.current) return; setPos({ x: dr.current.px + e.clientX - dr.current.sx, y: dr.current.py + e.clientY - dr.current.sy }); }}
      onPointerUp={() => { dr.current = null; }}
      style={{
        position: "absolute", bottom: 60, right: "18%",
        transform: `translate(${pos.x}px,${pos.y}px)`,
        cursor: "grab", userSelect: "none", zIndex: 5, touchAction: "none",
      }}
    >
      <div style={{ width: 110, height: 130, background: "linear-gradient(135deg,#1E5BA8,#2B7FD8)", borderRadius: 18, boxShadow: "0 8px 28px rgba(0,0,0,0.28)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px solid rgba(244,215,88,0.35)", gap: 8 }}>
        <div style={{ fontSize: 46 }}>🤖</div>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "#F4D758", letterSpacing: 1 }}>OLLIE X</div>
      </div>
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
const ICONS = [
  { id: "about",    label: "About_Me",       iconEl: <FolderArt color="#F4D758" /> },
  { id: "music",    label: "Music_Studio",   iconEl: <FolderArt color="#E84A5F" /> },
  { id: "ai",       label: "AI_Lab",         iconEl: <FolderArt color="#2B7FD8" /> },
  { id: "terminal", label: "Terminal",        iconEl: <AppArt emoji=">_" /> },
  { id: "note",     label: "_notes.md",      iconEl: <FileArt ext="MD" color="#2B7FD8" /> },
  { id: "canvas",   label: "Infinite_Canvas", iconEl: <AppArt emoji="🌌" /> },
] as const;

const ICON_POSITIONS = [
  { top: 56,  left: 16 },
  { top: 156, left: 16 },
  { top: 256, left: 16 },
  { top: 356, left: 16 },
  { top: 456, left: 16 },
  { top: 556, left: 16 },
];

const WIN_CONFIGS: Partial<Record<string, Omit<WindowDef, "zIndex" | "x" | "y">>> = {
  about:    { id: "about",    title: "About_Me",     type: "about",    w: 440, h: 480 },
  music:    { id: "music",    title: "Music_Studio", type: "music",    w: 380, h: 520 },
  ai:       { id: "ai",       title: "AI_Lab",       type: "ai",       w: 460, h: 440 },
  terminal: { id: "terminal", title: "Terminal",     type: "terminal", w: 500, h: 360 },
  note:     { id: "note",     title: "_notes.md",   type: "note",     w: 440, h: 440 },
};

export default function DesktopOS({ onGoSystem }: { onGoSystem: () => void }) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const time       = useClock();
  useStars(surfaceRef);

  const [wallpaper, setWallpaper]   = useState<WallpaperKey>("blue");
  const [selected,  setSelected]    = useState<string | null>(null);
  const [ctxMenu,   setCtxMenu]     = useState<CtxMenuState | null>(null);
  const { windows, openWindow, closeWindow, bringToFront, updateWindow } = useWindowManager();

  const handleOpenIcon = (id: string) => {
    if (id === "canvas") { onGoSystem(); return; }
    const cfg = WIN_CONFIGS[id];
    if (!cfg) return;
    const W = typeof window !== "undefined" ? window.innerWidth  : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;
    openWindow({
      ...cfg,
      x: Math.max(100, (W - cfg.w) / 2 + (Math.random() - 0.5) * 120),
      y: Math.max(50,  (H - cfg.h) / 2 + (Math.random() - 0.5) * 80),
    });
  };

  const renderContent = (win: WindowDef) => {
    switch (win.type) {
      case "about":    return <AboutWindow />;
      case "music":    return <MusicWindow />;
      case "ai":       return <AILabWindow />;
      case "terminal": return <TerminalWindow />;
      case "note":     return <NoteWindow />;
      default:         return null;
    }
  };

  const wp = WALLPAPERS[wallpaper];

  return (
    <div className="w-full h-screen flex flex-col" style={{ background: wp.bg, overflow: "hidden" }}>

      {/* ── macOS Menubar ── */}
      <div style={{
        height: 30, display: "flex", alignItems: "center",
        padding: "0 16px", gap: 16, flexShrink: 0, zIndex: 800, position: "relative",
        background: "rgba(43,127,216,0.94)", backdropFilter: "blur(14px)",
        fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
        fontSize: 13, color: "rgba(255,255,255,0.92)",
      }}>
        {/* Left: logo + menus */}
        <span style={{ fontFamily: "var(--font-fira-code)", fontSize: 15, fontWeight: 700, color: "#F4D758" }}>OllieOS</span>
        {["文件", "编辑", "显示", "窗口", "帮助"].map(m => (
          <span key={m} style={{ opacity: 0.55, cursor: "default", fontSize: 13 }}>{m}</span>
        ))}

        {/* Right: system icons */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
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
        onClick={() => { setSelected(null); setCtxMenu(null); }}
        onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
      >
        <StickerEl />

        {/* Icons */}
        {ICONS.map((icon, i) => (
          <div key={icon.id} style={{ position: "absolute", ...ICON_POSITIONS[i] }}>
            <DesktopIcon
              id={icon.id} label={icon.label} iconEl={icon.iconEl}
              selected={selected === icon.id}
              onSelect={() => setSelected(icon.id)}
              onOpen={() => handleOpenIcon(icon.id)}
            />
          </div>
        ))}

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
            wallpaper={wallpaper}
            setWallpaper={setWallpaper}
            onClose={() => setCtxMenu(null)}
            onNewFolder={() => {/* future: add new folder icon */}}
          />
        )}
      </div>
    </div>
  );
}
