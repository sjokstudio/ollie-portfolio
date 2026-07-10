"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TerminalIntro({
  typingDone,
  onLaunch,
  isLaunched,
}: {
  typingDone: boolean;
  onLaunch: () => void;
  isLaunched: boolean;
}) {
  const [lines, setLines] = useState<number>(0);
  const [progress, setProgress] = useState(0);

  const script = [
    { type: "cmd", text: "whoami" },
    { type: "output", text: "> Ollie." },
    { type: "output", text: "  AI / Crypto / Music / 数字难民" },
    { type: "blank" },
    { type: "cmd", text: "cat about.md" },
    { type: "output", text: "> 常驻 X，偶尔正常。" },
    { type: "output", text: "  刷 AI，刷币圈，也刷互联网里的各种怪东西。" },
    { type: "blank" },
    { type: "cmd", text: "echo '常驻 X，偶尔正常。'" },
    { type: "gold", text: "> 常驻 X，偶尔正常。" },
    { type: "blank" },
    { type: "cmd", text: "open system.app", cursor: true },
  ];

  useEffect(() => {
    if (typingDone) {
      const id = window.setTimeout(() => setLines(script.length), 0);
      return () => window.clearTimeout(id);
    }

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < script.length) {
        setLines(currentLine + 1);
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [typingDone, script.length]);

  useEffect(() => {
    if (isLaunched) {
      let p = 0;
      const int = setInterval(() => {
        p += 10;
        setProgress(p);
        if (p >= 100) clearInterval(int);
      }, 100);
      return () => clearInterval(int);
    }
  }, [isLaunched]);

  return (
    <div className="w-full h-full p-8 terminal-text text-sm sm:text-base md:text-lg flex flex-col justify-end pb-[10%]">
      {script.slice(0, lines).map((line, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2"
        >
          {line.type === "blank" && <span>&nbsp;</span>}
          {line.type === "cmd" && (
            <div>
              <span className="text-neon-blue font-bold">$ </span>
              <span className="text-white">{line.text}</span>
              {line.cursor && !isLaunched && (
                <span className="inline-block w-2.5 h-4 bg-neon-green ml-1 cursor-blink align-middle"></span>
              )}
            </div>
          )}
          {line.type === "output" && (
            <div className="text-gray-300 opacity-80">{line.text}</div>
          )}
          {line.type === "gold" && (
            <div className="text-black bg-neon-green px-2 py-0.5 inline-block rounded font-bold mt-1">
              {line.text}
            </div>
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {typingDone && !isLaunched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-center text-gray-500 animate-pulse cursor-pointer"
            onClick={onLaunch}
          >
            Press Enter or Click to Launch ↵
          </motion.div>
        )}
      </AnimatePresence>

      {isLaunched && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4"
        >
          <div className="text-neon-blue">{"> launching..."}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-500">[</span>
            <div className="w-48 h-3 bg-gray-900 border border-gray-700 relative overflow-hidden">
              <div 
                className="h-full bg-neon-green transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-gray-500">] {progress}%</span>
          </div>
        </motion.div>
      )}

      {/* Global Enter listener */}
      <GlobalEnterListener onEnter={onLaunch} enabled={typingDone && !isLaunched} />
    </div>
  );
}

// A tiny helper component to listen for Enter without attaching it directly in the effect above to avoid stale state.
function GlobalEnterListener({ onEnter, enabled }: { onEnter: () => void, enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") onEnter();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enabled, onEnter]);
  return null;
}
