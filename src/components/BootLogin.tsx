"use client";
import { useEffect, useState, useCallback } from "react";

type Phase = "booting" | "login" | "entering";

const BOOT_STEPS = [
  { text: "正在启动 OllieOS...",             dur: 240 },
  { text: "加载 AI / Crypto / Music...",     dur: 260 },
  { text: "恢复数字难民状态...",              dur: 230 },
  { text: "打开桌面...",                      dur: 200 },
  { text: "Welcome back, Ollie.",           dur: 180 },
];

const TOTAL_DUR = BOOT_STEPS.reduce((s, b) => s + b.dur, 0);

function useLiveClock() {
  const [t, setT] = useState({ h: "", d: "" });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setT({
        h: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        d: now.toLocaleDateString("zh-CN", { weekday: "long", month: "long", day: "numeric" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function BootLogin({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<Phase>("booting");
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const [countdown, setCountdown] = useState(2);
  const [hovered, setHovered] = useState(false);
  const clock = useLiveClock();

  const doEnter = useCallback(() => {
    if (phase === "entering") return;
    setPhase("entering");
    setTimeout(() => onEnter(), 380);
  }, [phase, onEnter]);

  /* ── Boot animation ── */
  useEffect(() => {
    if (phase !== "booting") return;
    let idx = 0;
    let elapsed = 0;

    const step = () => {
      if (idx >= BOOT_STEPS.length) {
        setProgress(100);
        setTimeout(() => setPhase("login"), 500);
        return;
      }
      setMsgIdx(idx);
      elapsed += BOOT_STEPS[idx].dur;
      setProgress(Math.min(95, Math.round((elapsed / TOTAL_DUR) * 100)));
      const dur = BOOT_STEPS[idx].dur;
      idx++;
      setTimeout(step, dur);
    };

    const id = setTimeout(step, 140);
    return () => clearTimeout(id);
  }, [phase]);

  /* ── Countdown ── */
  useEffect(() => {
    if (phase !== "login") return;
    const id = setTimeout(() => {
      if (countdown <= 0) doEnter();
      else setCountdown(c => c - 1);
    }, countdown <= 0 ? 0 : 1000);
    return () => clearTimeout(id);
  }, [phase, countdown, doEnter]);

  /* ── SVG ring maths ── */
  const R = 58;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (countdown / 2);

  /* ─────────────────────────────────────────────────────
     Phase: booting
  ───────────────────────────────────────────────────── */
  if (phase === "booting") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "var(--ollie-boot-bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
      }}>
        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: 20, marginBottom: 48,
          background: "linear-gradient(135deg,#2B7FD8,#1E5BA8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40,
          boxShadow: "0 0 60px rgba(43,127,216,0.35)",
          animation: "logoPulse 2.4s ease-in-out infinite",
        }}>🤖</div>

        {/* Progress bar */}
        <div style={{ width: 180, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 999, marginBottom: 20 }}>
          <div style={{
            height: "100%", borderRadius: 999,
            width: `${progress}%`,
            background: "rgba(255,255,255,0.82)",
            transition: "width 0.35s ease",
            boxShadow: "0 0 8px rgba(255,255,255,0.3)",
          }} />
        </div>

        {/* Status text */}
        <div style={{
          height: 18, overflow: "hidden",
          fontFamily: "'SF Mono','Fira Code',monospace",
          fontSize: 11, letterSpacing: 0.4,
          color: "var(--ollie-boot-muted)",
          transition: "opacity 0.3s",
        }}>
          {BOOT_STEPS[msgIdx]?.text}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────
     Phase: login / entering
  ───────────────────────────────────────────────────── */
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--ollie-login-bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif",
      opacity: phase === "entering" ? 0 : 1,
      transition: phase === "entering" ? "opacity 0.38s ease" : "opacity 0.32s ease",
    }}>

      {/* ── Big clock (top, like macOS login) ── */}
      <div style={{
        position: "absolute", top: 56, textAlign: "center",
        animation: "fadeUp 0.6s ease both",
      }}>
        <div style={{
          fontSize: "clamp(52px,8vw,80px)", fontWeight: 200,
          color: "#fff", letterSpacing: -2, lineHeight: 1,
        }}>{clock.h}</div>
        <div style={{
          fontSize: 14, fontWeight: 400,
          color: "rgba(255,255,255,0.6)", marginTop: 8,
        }}>{clock.d}</div>
      </div>

      {/* ── Center card (avatar + info) ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
        animation: "fadeUp 0.7s 0.15s ease both",
      }}>
        {/* Avatar with countdown ring */}
        <div
          style={{
            position: "relative", width: 128, height: 128,
            cursor: "pointer",
            transform: hovered ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          }}
          onClick={doEnter}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* SVG countdown ring */}
          <svg
            style={{ position: "absolute", top: -10, left: -10, width: 148, height: 148 }}
            viewBox="0 0 148 148"
          >
            {/* track */}
            <circle cx="74" cy="74" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
            {/* progress */}
            <circle
              cx="74" cy="74" r={R} fill="none"
              stroke="#F4D758" strokeWidth="3"
              strokeDasharray={CIRC}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 74 74)"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>

          {/* Avatar circle */}
          <div style={{
            width: 128, height: 128, borderRadius: "50%",
            background: "linear-gradient(135deg,#2B7FD8,#1E5BA8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 58,
            boxShadow: hovered
              ? "0 0 0 4px rgba(244,215,88,0.55), 0 24px 60px rgba(0,0,0,0.5)"
              : "0 0 0 3px rgba(255,255,255,0.18), 0 20px 50px rgba(0,0,0,0.45)",
            transition: "box-shadow 0.22s",
          }}>🎤</div>
        </div>

        {/* Name + role */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 24, fontWeight: 300,
            color: "#fff", letterSpacing: -0.5,
          }}>Ollie.</div>
          <div style={{
            fontSize: 12, marginTop: 5,
            color: "rgba(255,255,255,0.5)",
          }}>AI | Crypto | Music | 数字难民</div>
        </div>

        {/* Countdown hint */}
        <div style={{
          fontSize: 12, color: "rgba(255,255,255,0.35)",
          fontFamily: "'SF Mono','Fira Code',monospace",
          letterSpacing: 0.3,
        }}>
          {countdown > 0
            ? `${countdown}s 后自动登录 · 点击头像立即进入`
            : "正在登录…"}
        </div>
      </div>

      {/* ── Decorative bottom dock ── */}
      <div style={{
        position: "absolute", bottom: 36,
        display: "flex", gap: 12, alignItems: "center",
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: "10px 16px",
        animation: "fadeUp 0.8s 0.3s ease both",
      }}>
        {["🤖", "🎵", "📈", ">_", "🌌"].map((icon, i) => (
          <div key={i} style={{
            width: 46, height: 46, borderRadius: 13,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>{icon}</div>
        ))}
      </div>

      <style>{`
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 40px rgba(43,127,216,0.25); }
          50%      { box-shadow: 0 0 80px rgba(43,127,216,0.55); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
