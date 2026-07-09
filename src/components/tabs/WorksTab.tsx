"use client";
import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Logic Pro Replica
// ─────────────────────────────────────────────────────────────────────────────

interface TrackData {
  id: string;
  name: string;
  icon: string;
  color: string;
  muted: boolean;
  solo: boolean;
  volume: number; // 0-100
  regions: { id: string; start: number; length: number; name: string }[];
}

const INITIAL_TRACKS: TrackData[] = [
  {
    id: "t1", name: "Lead Vocal", icon: "🎤", color: "#E84A5F", muted: false, solo: false, volume: 85,
    regions: [
      { id: "r1", start: 8, length: 16, name: "Verse 1" },
      { id: "r2", start: 32, length: 16, name: "Chorus" },
    ],
  },
  {
    id: "t2", name: "808 Bass", icon: "🎸", color: "#F4D758", muted: false, solo: false, volume: 90,
    regions: [
      { id: "r3", start: 8, length: 8, name: "808 Pattern A" },
      { id: "r4", start: 16, length: 8, name: "808 Pattern B" },
      { id: "r5", start: 32, length: 16, name: "808 Drop" },
    ],
  },
  {
    id: "t3", name: "Drum Machine", icon: "🥁", color: "#2B7FD8", muted: false, solo: false, volume: 80,
    regions: [
      { id: "r6", start: 0, length: 8, name: "HiHat Intro" },
      { id: "r7", start: 8, length: 16, name: "Main Groove" },
      { id: "r8", start: 32, length: 16, name: "Main Groove" },
    ],
  },
  {
    id: "t4", name: "Ambient Pad", icon: "🎹", color: "#4ade80", muted: true, solo: false, volume: 60,
    regions: [
      { id: "r9", start: 0, length: 16, name: "Intro Chords" },
      { id: "r10", start: 32, length: 32, name: "Chorus Pad" },
    ],
  },
];

const PIXELS_PER_BAR = 30; // Scale of the timeline

export default function WorksTab() {
  const [tracks, setTracks] = useState<TrackData[]>(INITIAL_TRACKS);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0); // in bars
  const reqRef = useRef<number | null>(null);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying(p => !p);
      }
      if (e.code === "Enter" || e.code === "Return") {
        e.preventDefault();
        setPlayhead(0);
        setPlaying(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // ── Playhead animation ──
  useEffect(() => {
    let lastTime = performance.now();
    const bpm = 140;
    const barsPerSecond = bpm / 4 / 60; // 140 beats per min = 140/4 bars per min = 140/240 bars per sec

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      if (playing) {
        setPlayhead(p => {
          const np = p + dt * barsPerSecond;
          if (np > 100) { setPlaying(false); return 0; } // Auto stop at bar 100
          return np;
        });
      }
      reqRef.current = requestAnimationFrame(loop);
    };
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [playing]);

  const toggleMute = (id: string) => setTracks(ts => ts.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
  const toggleSolo = (id: string) => setTracks(ts => ts.map(t => t.id === id ? { ...t, solo: !t.solo } : t));

  return (
    <div style={{
      width: "100%", height: "100vh", display: "flex", flexDirection: "column",
      background: "#1c1c1e", color: "#fff",
      fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
      userSelect: "none", overflow: "hidden"
    }}>
      {/* ── Top Control Bar ── */}
      <div style={{
        height: 54, background: "linear-gradient(180deg, #3a3a3c 0%, #2c2c2e 100%)",
        borderBottom: "1px solid #111", display: "flex", alignItems: "center", padding: "0 20px", gap: 30,
        boxShadow: "0 1px 4px rgba(0,0,0,0.5)", zIndex: 10,
      }}>
        {/* Left: Window controls mock */}
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
        </div>

        {/* Transport controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setPlayhead(0)} style={transportBtnStyle}>⏮</button>
          <button onClick={() => setPlaying(false)} style={transportBtnStyle}>⏹</button>
          <button onClick={() => setPlaying(true)} style={{ ...transportBtnStyle, color: playing ? "#4ade80" : "#fff" }}>▶</button>
          <button style={{ ...transportBtnStyle, color: "#E84A5F" }}>⏺</button>
          <button style={{ ...transportBtnStyle, color: "#F4D758", marginLeft: 8 }}>↻</button>
        </div>

        {/* LCD Display */}
        <div style={{
          background: "linear-gradient(180deg, #181c20 0%, #111417 100%)",
          border: "1px solid #000", borderRadius: 6, padding: "4px 16px",
          display: "flex", gap: 32, alignItems: "center", minWidth: 320,
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.1)",
        }}>
          {/* Time / Bar */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, color: "#2B7FD8", fontWeight: 700 }}>BAR / BEAT</span>
            <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 18, color: "#2B7FD8", letterSpacing: 1 }}>
              {Math.floor(playhead) + 1} <span style={{ opacity: 0.5 }}>{Math.floor((playhead % 1) * 4) + 1}</span>
            </span>
          </div>
          <div style={{ width: 1, height: 28, background: "#222" }} />
          {/* Tempo / Key */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, color: "#8A8A9A", fontWeight: 700 }}>TEMPO</span>
            <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 15, color: "#ccc" }}>140.0</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 9, color: "#8A8A9A", fontWeight: 700 }}>KEY</span>
            <span style={{ fontFamily: "'SF Mono','Fira Code',monospace", fontSize: 15, color: "#ccc" }}>F#m</span>
          </div>
        </div>

        <div style={{ marginLeft: "auto", fontSize: 11, color: "#8A8A9A", display: "flex", gap: 16 }}>
          <span>Space: Play/Pause</span>
          <span>Return: Stop & Reset</span>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        
        {/* Left Inspector (Track Headers) */}
        <div style={{
          width: 260, background: "#252528", borderRight: "1px solid #111",
          display: "flex", flexDirection: "column",
        }}>
          {/* Inspector Header */}
          <div style={{ height: 32, borderBottom: "1px solid #111", display: "flex", alignItems: "center", padding: "0 12px", gap: 10, background: "#2c2c2e" }}>
            <span style={{ fontSize: 14 }}>＋</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>Tracks</span>
          </div>

          {/* Tracks */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {tracks.map(t => (
              <div key={t.id} style={{
                height: 64, borderBottom: "1px solid #111", background: t.muted ? "#1c1c1e" : "#2a2a2c",
                display: "flex", flexDirection: "column", padding: "4px 8px 4px 0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
                  {/* Track color bar */}
                  <div style={{ width: 4, height: "100%", background: t.muted ? "#444" : t.color, borderRadius: "0 2px 2px 0" }} />
                  {/* Icon */}
                  <div style={{ fontSize: 18, filter: t.muted ? "grayscale(100%) opacity(50%)" : "none" }}>{t.icon}</div>
                  {/* Name */}
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: t.muted ? "#888" : "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name}
                  </div>
                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => toggleMute(t.id)} style={{ ...trackBtnStyle, background: t.muted ? "#3B82F6" : "#3a3a3c", color: t.muted ? "#fff" : "#aaa" }}>M</button>
                    <button onClick={() => toggleSolo(t.id)} style={{ ...trackBtnStyle, background: t.solo ? "#F4D758" : "#3a3a3c", color: t.solo ? "#000" : "#aaa" }}>S</button>
                    <button style={trackBtnStyle}>R</button>
                  </div>
                </div>
                {/* Volume fader mock */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 12, paddingRight: 4, height: 20 }}>
                  <span style={{ fontSize: 9, color: "#666" }}>Vol</span>
                  <div style={{ flex: 1, height: 4, background: "#111", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${t.volume}%`, background: t.muted ? "#444" : "#4ade80", borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrangement (Timeline) */}
        <div style={{ flex: 1, background: "#1a1a1c", display: "flex", flexDirection: "column", position: "relative" }}>
          
          {/* Ruler */}
          <div style={{ height: 32, background: "#2c2c2e", borderBottom: "1px solid #111", display: "flex", position: "relative" }}>
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute", left: i * PIXELS_PER_BAR, top: 0, bottom: 0,
                borderLeft: "1px solid #444", paddingLeft: 4, fontSize: 10, color: "#888",
                display: "flex", alignItems: "flex-end", paddingBottom: 2,
              }}>
                {i % 4 === 0 ? i + 1 : ""}
              </div>
            ))}
          </div>

          {/* Tracks Area */}
          <div style={{ flex: 1, position: "relative", overflowX: "auto", overflowY: "hidden" }}>
            {/* Grid lines */}
            <svg style={{ position: "absolute", top: 0, left: 0, width: 3000, height: "100%", pointerEvents: "none" }}>
              <defs>
                <pattern id="grid" width={PIXELS_PER_BAR} height={64} patternUnits="userSpaceOnUse">
                  <line x1={0} y1={0} x2={0} y2={64} stroke="#ffffff" strokeOpacity={0.03} strokeWidth={1} />
                  <line x1={0} y1={64} x2={PIXELS_PER_BAR} y2={64} stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} />
                </pattern>
                <pattern id="grid-beat" width={PIXELS_PER_BAR/4} height={64} patternUnits="userSpaceOnUse">
                  <line x1={0} y1={0} x2={0} y2={64} stroke="#ffffff" strokeOpacity={0.015} strokeWidth={1} />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-beat)" />
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Regions */}
            {tracks.map((t, idx) => (
              <div key={t.id} style={{ position: "absolute", top: idx * 64, left: 0, width: 3000, height: 64 }}>
                {t.regions.map(r => (
                  <div key={r.id} style={{
                    position: "absolute",
                    left: r.start * PIXELS_PER_BAR,
                    width: r.length * PIXELS_PER_BAR,
                    top: 2, height: 59,
                    background: t.muted ? "#333" : t.color,
                    border: "1px solid rgba(0,0,0,0.5)",
                    borderRadius: 4,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
                    opacity: t.muted ? 0.6 : 0.9,
                    cursor: "pointer",
                    overflow: "hidden"
                  }}>
                    {/* Region waveform mock */}
                    <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, opacity: 0.15, pointerEvents: "none" }}>
                      <path d={`M0,30 ${Array.from({ length: r.length * 2 }).map((_, i) => `L${i * (PIXELS_PER_BAR/2)},${10 + Math.random() * 40}`).join(" ")} L${r.length * PIXELS_PER_BAR},30 Z`} fill="none" stroke="#000" strokeWidth={1.5} />
                    </svg>
                    <div style={{ fontSize: 10, color: "#000", fontWeight: 600, padding: "2px 6px", whiteSpace: "nowrap" }}>
                      {r.name}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Playhead Line */}
            <div style={{
              position: "absolute", top: -32, bottom: 0,
              left: playhead * PIXELS_PER_BAR,
              width: 1, background: "#fff", zIndex: 10,
              boxShadow: "0 0 4px rgba(255,255,255,0.8)",
              pointerEvents: "none",
            }}>
              {/* Playhead triangle */}
              <div style={{
                position: "absolute", top: 12, left: -6, width: 0, height: 0,
                borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "10px solid #fff"
              }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Styles
// ─────────────────────────────────────────────────────────────────────────────
const transportBtnStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #444 0%, #333 100%)",
  border: "1px solid #111", borderRadius: 4, width: 36, height: 32,
  color: "#fff", fontSize: 14, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
};

const trackBtnStyle: React.CSSProperties = {
  width: 18, height: 18, border: "1px solid #111", borderRadius: 3,
  fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};
