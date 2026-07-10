"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Logic Pro Replica with Web Audio API Synthesizer
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
    id: "t1", name: "Synth Lead", icon: "🎹", color: "#E84A5F", muted: false, solo: false, volume: 75,
    regions: [
      { id: "r1", start: 4, length: 12, name: "Melody A" },
      { id: "r2", start: 20, length: 12, name: "Melody B" },
    ],
  },
  {
    id: "t2", name: "808 Bass", icon: "🎸", color: "#F4D758", muted: false, solo: false, volume: 90,
    regions: [
      { id: "r3", start: 0, length: 16, name: "808 Pattern A" },
      { id: "r4", start: 16, length: 16, name: "808 Pattern B" },
    ],
  },
  {
    id: "t3", name: "Drum Machine", icon: "🥁", color: "#2B7FD8", muted: false, solo: false, volume: 80,
    regions: [
      { id: "r6", start: 0, length: 8, name: "HiHat Intro" },
      { id: "r7", start: 8, length: 24, name: "Main Groove" },
    ],
  },
  {
    id: "t4", name: "Ambient Pad", icon: "🌌", color: "#4ade80", muted: false, solo: false, volume: 60,
    regions: [
      { id: "r9", start: 0, length: 16, name: "Intro Chords" },
      { id: "r10", start: 16, length: 16, name: "Chorus Pad" },
    ],
  },
];

const PIXELS_PER_BAR = 30; // Scale of the timeline
const BPM = 140;
const BARS_PER_SECOND = BPM / 4 / 60;

// --- Audio Engine ---
class AudioEngine {
  ctx: AudioContext | null = null;
  isPlaying: boolean = false;
  nextNoteTime: number = 0;
  current16thNote: number = 0;
  timerID: number | null = null;
  lookahead: number = 25.0; // ms
  scheduleAheadTime: number = 0.1; // s

  tracksState: TrackData[] = [];
  masterGain: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  updateTracks(tracks: TrackData[]) {
    this.tracksState = tracks;
  }

  play808(time: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.1);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

    osc.start(time);
    osc.stop(time + 0.8);
  }

  playHihat(time: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "square";
    filter.type = "highpass";
    filter.frequency.value = 7000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(400, time);
    gain.gain.setValueAtTime(vol * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  playSnare(time: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(250, time);
    gain.gain.setValueAtTime(vol * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  playPad(time: number, chord: number[], vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    chord.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol * 0.2, time + 0.5);
      gain.gain.linearRampToValueAtTime(0, time + 2.0);

      osc.start(time);
      osc.stop(time + 2.0);
    });
  }

  playLead(time: number, freq: number, vol: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(vol * 0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  scheduleNote(beatNumber: number, time: number, currentBar: number) {
    // Determine active tracks based on regions
    const isTrackActive = (trackId: string) => {
      const track = this.tracksState.find(t => t.id === trackId);
      if (!track || track.muted) return false;
      // Solo logic: if any track is soloed, only soloed tracks play
      const anySolo = this.tracksState.some(t => t.solo);
      if (anySolo && !track.solo) return false;

      // Check if currentBar is within any region
      return track.regions.some(r => currentBar >= r.start && currentBar < r.start + r.length);
    };

    const getVol = (trackId: string) => {
      const track = this.tracksState.find(t => t.id === trackId);
      return track ? track.volume / 100 : 0;
    };

    // --- Drum Machine (t3) ---
    if (isTrackActive("t3")) {
      const vol = getVol("t3");
      // Hi-hats every 8th note
      if (beatNumber % 2 === 0) {
        this.playHihat(time, vol);
      }
      // Snare on beats 2 and 4 (16th notes: 4, 12)
      if (beatNumber === 4 || beatNumber === 12) {
        this.playSnare(time, vol);
      }
    }

    // --- 808 Bass (t2) ---
    if (isTrackActive("t2")) {
      const vol = getVol("t2");
      // Kick pattern
      if (beatNumber === 0 || beatNumber === 7 || beatNumber === 10) {
        this.play808(time, vol);
      }
    }

    // --- Ambient Pad (t4) ---
    if (isTrackActive("t4")) {
      const vol = getVol("t4");
      // Play chord at the start of every bar
      if (beatNumber === 0) {
        // Simple F#m -> D -> A -> E progression based on bar
        const prog = currentBar % 4;
        let chord = [185.00, 220.00, 277.18]; // F#m
        if (prog === 1) chord = [146.83, 185.00, 220.00]; // D
        if (prog === 2) chord = [220.00, 277.18, 329.63]; // A
        if (prog === 3) chord = [164.81, 207.65, 246.94]; // E
        this.playPad(time, chord, vol);
      }
    }

    // --- Synth Lead (t1) ---
    if (isTrackActive("t1")) {
      const vol = getVol("t1");
      const prog = currentBar % 4;
      const root = prog === 0 ? 369.99 : prog === 1 ? 293.66 : prog === 2 ? 440.00 : 329.63;

      if (beatNumber === 2 || beatNumber === 5 || beatNumber === 14) {
        this.playLead(time, root * 1.5, vol);
      }
    }
  }

  scheduler() {
    if (!this.ctx) return;
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      // Calculate current bar based on total 16th notes elapsed
      // (This is a simplified assumption that playhead drives the sequencer)
      // Actually, we should sync it perfectly with the React state playhead,
      // but Web Audio scheduling needs to run slightly ahead.

      const currentBar = Math.floor(this.current16thNote / 16);
      this.scheduleNote(this.current16thNote % 16, this.nextNoteTime, currentBar);

      // Advance time
      const secondsPerBeat = 60.0 / BPM;
      this.nextNoteTime += 0.25 * secondsPerBeat; // 16th note
      this.current16thNote++;
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  start(startBar: number) {
    if (!this.ctx) this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.current16thNote = Math.floor(startBar * 16);
    this.nextNoteTime = this.ctx!.currentTime + 0.05;
    this.scheduler();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerID !== null) {
      window.clearTimeout(this.timerID);
      this.timerID = null;
    }
  }
}

const audio = typeof window !== "undefined" ? new AudioEngine() : null;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function WorksTab() {
  const [tracks, setTracks] = useState<TrackData[]>(INITIAL_TRACKS);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0); // in bars
  const [referenceUrl, setReferenceUrl] = useState<string | null>(null);
  const reqRef = useRef<number | null>(null);
  const referenceAudioRef = useRef<HTMLAudioElement>(null);

  // Sync tracks to audio engine
  useEffect(() => {
    if (audio) audio.updateTracks(tracks);
  }, [tracks]);

  // Handle play/stop logic
  useEffect(() => {
    if (playing) {
      if (referenceUrl && referenceAudioRef.current) {
        referenceAudioRef.current.currentTime = playhead / BARS_PER_SECOND;
        void referenceAudioRef.current.play();
      } else if (audio) {
        audio.init(); // Must be called from user interaction first time
        audio.start(playhead);
      }

      let lastTime = performance.now();
      const loop = (time: number) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        setPlayhead(p => {
          const np = p + dt * BARS_PER_SECOND;
          if (np > 100) {
            setPlaying(false);
            if (referenceAudioRef.current) {
              referenceAudioRef.current.pause();
              referenceAudioRef.current.currentTime = 0;
            }
            if (audio) audio.stop();
            return 0;
          }
          return np;
        });
        reqRef.current = requestAnimationFrame(loop);
      };
      reqRef.current = requestAnimationFrame(loop);

    } else {
      if (referenceAudioRef.current) {
        referenceAudioRef.current.pause();
      }
      if (audio) audio.stop();
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    }

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [playing, referenceUrl]); // Playhead is intentionally not a dependency while transport is running

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying(p => !p);
      }
      if (e.code === "Enter" || e.code === "Return") {
        e.preventDefault();
        setPlaying(false);
        setPlayhead(0);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggleMute = useCallback((id: string) => setTracks(ts => ts.map(t => t.id === id ? { ...t, muted: !t.muted } : t)), []);
  const toggleSolo = useCallback((id: string) => setTracks(ts => ts.map(t => t.id === id ? { ...t, solo: !t.solo } : t)), []);
  const setVolume = useCallback((id: string, vol: number) => setTracks(ts => ts.map(t => t.id === id ? { ...t, volume: vol } : t)), []);
  const importReference = (file: File) => {
    if (referenceAudioRef.current) referenceAudioRef.current.pause();
    setReferenceUrl(URL.createObjectURL(file));
    setPlaying(false);
    setPlayhead(0);
  };

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
          <button onClick={() => { setPlaying(false); setPlayhead(0); }} style={transportBtnStyle}>⏮</button>
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
          <label style={{ color: referenceUrl ? "#4ade80" : "#E84A5F", cursor: "pointer" }}>
            {referenceUrl ? "完整音乐已载入" : "导入完整音乐"}
            <input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/*" onChange={e => { const file = e.target.files?.[0]; if (file) importReference(file); e.currentTarget.value = ""; }} style={{ display: "none" }} />
          </label>
          <span>Space: Play/Pause</span>
          <span>Return: Stop & Reset</span>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <audio ref={referenceAudioRef} src={referenceUrl ?? undefined} onEnded={() => { setPlaying(false); setPlayhead(0); }} />

        {/* Left Inspector (Track Headers) */}
        <div style={{
          width: 260, background: "#252528", borderRight: "1px solid #111",
          display: "flex", flexDirection: "column",
        }}>
          {/* Inspector Header */}
          <div style={{ height: 32, borderBottom: "1px solid #111", display: "flex", alignItems: "center", padding: "0 12px", gap: 10, background: "#2c2c2e" }}>
            <span style={{ fontSize: 14 }}>＋</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>Visual Layers</span>
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
                  </div>
                </div>
                {/* Volume slider */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 12, paddingRight: 4, height: 20 }}>
                  <span style={{ fontSize: 9, color: "#666" }}>Vol</span>
                  <input
                    type="range" min="0" max="100" value={t.volume}
                    onChange={e => setVolume(t.id, parseInt(e.target.value))}
                    style={{ flex: 1, height: 4, appearance: "none", background: "#111", borderRadius: 2, outline: "none", cursor: "pointer" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrangement (Timeline) */}
        <div style={{ flex: 1, background: "#1a1a1c", display: "flex", flexDirection: "column", position: "relative" }}>

          {/* Ruler */}
          <div style={{ cursor: "text", height: 32, background: "#2c2c2e", borderBottom: "1px solid #111", display: "flex", position: "relative" }}
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const x = e.clientX - rect.left;
                 setPlayhead(x / PIXELS_PER_BAR);
               }}
          >
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute", left: i * PIXELS_PER_BAR, top: 0, bottom: 0,
                borderLeft: "1px solid #444", paddingLeft: 4, fontSize: 10, color: "#888",
                display: "flex", alignItems: "flex-end", paddingBottom: 2, pointerEvents: "none"
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
