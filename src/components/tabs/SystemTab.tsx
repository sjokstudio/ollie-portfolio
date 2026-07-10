"use client";
import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface CardNode {
  id: string;
  x: number; y: number; w: number;
  title: string; body: string;
  color: "blue" | "yellow" | "red";
}

interface CanvasData {
  id: string;
  name: string;
  icon: string;
  nodes: CardNode[];
}

const COLOR = {
  blue:   { border: "#2B7FD8", bg: "color-mix(in srgb,#2B7FD8 12%,var(--ollie-surface))", tag: "#2B7FD8" },
  yellow: { border: "#F4D758", bg: "color-mix(in srgb,#F4D758 14%,var(--ollie-surface))", tag: "#b89400" },
  red:    { border: "#E84A5F", bg: "color-mix(in srgb,#E84A5F 10%,var(--ollie-surface))", tag: "#E84A5F" },
};

// ─────────────────────────────────────────────────────────────────────────────
// Initial canvas data
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_CANVASES: CanvasData[] = [
  {
    id: "c1", name: "OllieOS", icon: "🖥",
    nodes: [
      { id: "n1", x: 1700, y: 1680, w: 280, title: "Ollie.",       body: "AI / Crypto / Music / 数字难民。常驻 X，合作私信。",  color: "blue"   },
      { id: "n2", x: 2080, y: 1640, w: 260, title: "AI", body: "工具、模型、工作流、自动化，还有各种让人又兴奋又焦虑的新东西。",                   color: "yellow" },
      { id: "n3", x: 1750, y: 1980, w: 260, title: "Crypto",  body: "叙事、情绪、土狗、DEX、暴涨暴跌，以及人性反复横跳。",                   color: "red"    },
      { id: "n4", x: 2060, y: 1920, w: 260, title: "Design System",     body: "Blue #2B7FD8 · Yellow #F4D758 · Red #E84A5F. Fraunces + Fira Code.",                       color: "blue"   },
    ],
  },
  {
    id: "c2", name: "Music", icon: "🎵",
    nodes: [
      { id: "m1", x: 1760, y: 1720, w: 260, title: "Beat Pack Vol.1",   body: "8 instrumentals: Trap / Boom-Bap / Drill. Target release Q3 2026.",                     color: "red"    },
      { id: "m2", x: 2060, y: 1700, w: 260, title: "Cubase Template",   body: "Master template: 808 chain, vocal FX rack, sidechain compression preset.",              color: "yellow" },
      { id: "m3", x: 1780, y: 1980, w: 260, title: "Track 01 — Draft",  body: "Intro: ambient pad → 808 drop at bar 9. BPM 140. Key: F# minor.",                       color: "blue"   },
    ],
  },
  {
    id: "c3", name: "Crypto Watch", icon: "📈",
    nodes: [
      { id: "t1", x: 1740, y: 1700, w: 280, title: "BTC Sentiment Model", body: "Fear & Greed Index + on-chain net flow. Long when FGI < 25 and inflows.",             color: "yellow" },
      { id: "t2", x: 2060, y: 1700, w: 260, title: "Agent Architecture",  body: "Multi-agent: DataFetcher → SentimentAnalyzer → StrategyEngine → Executor.",           color: "blue"   },
      { id: "t3", x: 1780, y: 1960, w: 260, title: "Risk Rules",          body: "Max drawdown 8%. Position size: 2% per trade. Stop-loss mandatory.",                   color: "red"    },
    ],
  },
];

const CANVAS_VIRTUAL_SIZE = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Card Node Component
// ─────────────────────────────────────────────────────────────────────────────
function CardNodeEl({ node, selected, scale, onSelect, onMove, onUpdate, onDelete }: {
  node: CardNode; selected: boolean; scale: number;
  onSelect: () => void;
  onMove: (dx: number, dy: number) => void;
  onUpdate: (p: Partial<CardNode>) => void;
  onDelete: () => void;
}) {
  const c  = COLOR[node.color];
  const dr = useRef<{ sx: number; sy: number } | null>(null);
  const [editing, setEditing] = useState<"title" | "body" | null>(null);

  const COLORS: CardNode["color"][] = ["blue", "yellow", "red"];
  const activeEditing = selected ? editing : null;

  return (
    <div
      style={{
        position: "absolute", left: node.x, top: node.y, width: node.w,
        background: c.bg, borderRadius: 12, padding: "14px 16px",
        border: `2px solid ${selected ? c.border : c.border + "55"}`,
        boxShadow: selected ? `0 0 0 3px ${c.border}28, 0 8px 24px rgba(0,0,0,0.1)` : "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "grab", userSelect: "none",
        fontFamily: "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif",
        transition: "box-shadow 0.15s",
      }}
      onPointerDown={e => {
        if ((e.target as HTMLElement).tagName === "TEXTAREA" || (e.target as HTMLElement).tagName === "INPUT") return;
        e.stopPropagation();
        dr.current = { sx: e.clientX, sy: e.clientY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        onSelect();
      }}
      onPointerMove={e => {
        if (!dr.current) return;
        onMove((e.clientX - dr.current.sx) / scale, (e.clientY - dr.current.sy) / scale);
        dr.current = { sx: e.clientX, sy: e.clientY };
      }}
      onPointerUp={() => { dr.current = null; }}
      onDoubleClick={() => setEditing("title")}
    >
      {/* Toolbar */}
      {selected && (
        <div style={{ position: "absolute", top: -36, left: 0, display: "flex", gap: 5, alignItems: "center" }}>
          {COLORS.map(col => (
            <button key={col} onClick={e => { e.stopPropagation(); onUpdate({ color: col }); }}
              style={{ width: 14, height: 14, borderRadius: "50%", border: col === node.color ? "2px solid var(--ollie-text)" : "2px solid transparent", background: COLOR[col].border, cursor: "pointer" }}
            />
          ))}
          <button onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ marginLeft: 6, background: "#E84A5F", color: "#fff", border: "none", borderRadius: 4, padding: "2px 7px", fontSize: 10, cursor: "pointer", fontFamily: "monospace" }}>✕</button>
        </div>
      )}
      <div style={{ fontFamily: "monospace", fontSize: 10, color: c.tag, marginBottom: 7, letterSpacing: 0.4 }}>{new Date().toISOString().split("T")[0]}</div>
      {activeEditing === "title" ? (
        <input autoFocus defaultValue={node.title} onBlur={e => { onUpdate({ title: e.target.value }); setEditing("body"); }} onKeyDown={e => { if (e.key === "Enter") { onUpdate({ title: (e.target as HTMLInputElement).value }); setEditing("body"); } }} style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "var(--font-fraunces)", fontSize: 15, fontWeight: 700, color: "var(--ollie-text)", marginBottom: 7 }} />
      ) : (
        <h3 style={{ fontFamily: "var(--font-fraunces)", fontSize: 15, fontWeight: 700, color: "var(--ollie-text)", marginBottom: 7, lineHeight: 1.3 }} onDoubleClick={() => setEditing("title")}>{node.title}</h3>
      )}
      {activeEditing === "body" ? (
        <textarea autoFocus defaultValue={node.body} rows={3} onBlur={e => { onUpdate({ body: e.target.value }); setEditing(null); }} style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontFamily: "-apple-system,sans-serif", fontSize: 12, color: "var(--ollie-text-soft)", lineHeight: 1.65 }} />
      ) : (
        <p style={{ fontSize: 12, color: "var(--ollie-text-soft)", lineHeight: 1.65, margin: 0 }} onDoubleClick={() => setEditing("body")}>{node.body}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Minimap
// ─────────────────────────────────────────────────────────────────────────────
function Minimap({ nodes, pan, scale, containerW, containerH, onJump, onDragView }: {
  nodes: CardNode[];
  pan: { x: number; y: number };
  scale: number;
  containerW: number;
  containerH: number;
  onJump: (px: number, py: number) => void;
  onDragView: (dx: number, dy: number) => void;
}) {
  const MAP_W = 188; // Slightly narrower to fit well in sidebar
  const MAP_H = 130;
  const MS    = MAP_W / CANVAS_VIRTUAL_SIZE; 

  const vx = -pan.x / scale;
  const vy = -pan.y / scale;
  const vw = containerW / scale;
  const vh = containerH / scale;

  const rx = vx * MS;
  const ry = vy * MS;
  const rw = Math.min(MAP_W, vw * MS);
  const rh = Math.min(MAP_H, vh * MS);

  const dragRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (dragRef.current) return; // Ignore click if we were dragging
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const mx   = e.clientX - rect.left;
    const my   = e.clientY - rect.top;
    const cx   = (mx / MS);
    const cy   = (my / MS);
    onJump(-(cx * scale - containerW / 2), -(cy * scale - containerH / 2));
  };

  const onPointerDownView = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMoveView = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    // dx in minimap translates to dx/MS in canvas, then scaled for pan
    const dMinimapX = e.clientX - dragRef.current.sx;
    const dMinimapY = e.clientY - dragRef.current.sy;
    // pan is negative of viewport top-left scaled
    const dPanX = -(dMinimapX / MS) * scale;
    const dPanY = -(dMinimapY / MS) * scale;
    onDragView(dragRef.current.px + dPanX, dragRef.current.py + dPanY);
  };
  const onPointerUpView = () => { dragRef.current = null; };

  return (
    <div
      onClick={handleClick}
      style={{
        width: MAP_W, height: MAP_H, margin: "16px auto", position: "relative",
        background: "var(--ollie-surface)", border: "1px solid var(--ollie-border)",
        borderRadius: 8, overflow: "hidden", cursor: "crosshair",
        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {nodes.map(n => {
        const c = COLOR[n.color];
        return (
          <div key={n.id} style={{
            position: "absolute", left: n.x * MS, top: n.y * MS,
            width: Math.max(6, n.w * MS), height: Math.max(4, 60 * MS),
            background: c.border + "88", borderRadius: 2,
          }} />
        );
      })}
      {/* Viewport rectangle - Draggable */}
      <div
        onPointerDown={onPointerDownView}
        onPointerMove={onPointerMoveView}
        onPointerUp={onPointerUpView}
        style={{
          position: "absolute",
          left: rx, top: ry, width: rw, height: rh,
          border: "2px solid #2B7FD8",
          background: "rgba(43,127,216,0.15)",
          borderRadius: 3, cursor: "grab",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.5)",
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main SystemTab
// ─────────────────────────────────────────────────────────────────────────────
export default function SystemTab() {
  const [canvases, setCanvases]   = useState<CanvasData[]>(INITIAL_CANVASES);
  const [activeId, setActiveId]   = useState("c1");
  const [pan,      setPan]        = useState({ x: -1700 + 400, y: -1700 + 300 });
  const [scale,    setScale]      = useState(0.72);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [sidebarW] = useState(240);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 1200, h: 800 });
  
  const isPanning = useRef(false);
  const panStart  = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const activeCanvas = canvases.find(c => c.id === activeId)!;

  useEffect(() => {
    const obs = new ResizeObserver(([e]) => setContainerSize({ w: e.contentRect.width, h: e.contentRect.height }));
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedNode) return;
      const active = document.activeElement?.tagName;
      if (active === "INPUT" || active === "TEXTAREA") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        setCanvases(cs => cs.map(c => c.id === activeId ? { ...c, nodes: c.nodes.filter(n => n.id !== selectedNode) } : c));
        setSelectedNode(null);
      }
      if (e.key === "Escape") setSelectedNode(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode, activeId]);

  const addNode = () => {
    const id = `n${Date.now()}`;
    const COLS: CardNode["color"][] = ["blue", "yellow", "red"];
    const newNode: CardNode = {
      id, title: "New Note", body: "Double-click to edit...",
      x: -pan.x / scale + containerSize.w/2/scale,
      y: -pan.y / scale + containerSize.h/2/scale,
      w: 260, color: COLS[Math.floor(Math.random() * 3)],
    };
    setCanvases(cs => cs.map(c => c.id === activeId ? { ...c, nodes: [...c.nodes, newNode] } : c));
    setSelectedNode(id);
  };
  const moveNode = useCallback((id: string, dx: number, dy: number) => setCanvases(cs => cs.map(c => c.id === activeId ? { ...c, nodes: c.nodes.map(n => n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n) } : c)), [activeId]);
  const updateNode = useCallback((id: string, p: Partial<CardNode>) => setCanvases(cs => cs.map(c => c.id === activeId ? { ...c, nodes: c.nodes.map(n => n.id === id ? { ...n, ...p } : n) } : c)), [activeId]);
  const deleteNode = useCallback((id: string) => { setCanvases(cs => cs.map(c => c.id === activeId ? { ...c, nodes: c.nodes.filter(n => n.id !== id) } : c)); setSelectedNode(null); }, [activeId]);

  const addCanvas = () => {
    const id = `c${Date.now()}`;
    setCanvases(cs => [...cs, { id, name: "新画布", icon: "📋", nodes: [] }]);
    setActiveId(id);
    setPan({ x: -1700 + 400, y: -1700 + 300 });
    setScale(0.72);
  };

  const switchCanvas = (id: string) => {
    setActiveId(id);
    setSelectedNode(null);
    setPan({ x: -1700 + 400, y: -1700 + 300 });
    setScale(0.72);
  };

  // Plain left-click drag for pan
  const onCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      isPanning.current = true;
      (e.currentTarget as HTMLElement).style.cursor = "grabbing";
      panStart.current  = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setSelectedNode(null);
  };
  const onCanvasPM = (e: React.PointerEvent) => {
    if (!isPanning.current) return;
    setPan({ x: panStart.current.px + e.clientX - panStart.current.mx, y: panStart.current.py + e.clientY - panStart.current.my });
  };
  const onCanvasPU = (e: React.PointerEvent) => { isPanning.current = false; (e.currentTarget as HTMLElement).style.cursor = "grab"; };
  
  const zoomAt = useCallback((clientX: number, clientY: number, deltaY: number) => {
    const delta = Math.exp(-deltaY * 0.005);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const nx = mx - (mx - pan.x) * delta;
      const ny = my - (my - pan.y) * delta;
      setPan({ x: nx, y: ny });
    }
    setScale(s => Math.min(3, Math.max(0.1, s * delta)));
  }, [pan.x, pan.y]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      zoomAt(e.clientX, e.clientY, e.deltaY);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const connections: [string, string][] = activeId === "c1" ? [["n1","n2"],["n1","n3"],["n1","n4"],["n2","n4"]] : activeId === "c2" ? [["m1","m3"],["m2","m3"]] : [["t1","t2"],["t1","t3"]];
  const nodes = activeCanvas.nodes;

  return (
    <div className="ollie-theme-transition" style={{ width: "100%", height: "100vh", display: "flex", overflow: "hidden", background: "var(--ollie-article-paper)", color: "var(--ollie-text)", fontFamily: "-apple-system,'SF Pro Text',sans-serif" }}>

      {/* ── Left Sidebar ── */}
      <div style={{
        width: sidebarW, flexShrink: 0, height: "100%",
        background: "var(--ollie-surface-soft)", borderRight: "1px solid var(--ollie-border)",
        display: "flex", flexDirection: "column",
        boxShadow: "2px 0 16px rgba(0,0,0,0.03)",
        zIndex: 50,
      }}>
        {/* Header */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--ollie-border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ollie-muted)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Spaces</div>
          <div style={{ fontSize: 22, fontWeight: 300, color: "var(--ollie-text)" }}>Canvases</div>
        </div>

        {/* Canvas List */}
        <div style={{ flex: 1, overflow: "auto", padding: "12px 10px 0" }}>
          {canvases.map(canvas => {
            const isActive = canvas.id === activeId;
            return (
              <div key={canvas.id} onClick={() => switchCanvas(canvas.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, marginBottom: 4, cursor: "pointer",
                  background: isActive ? "var(--ollie-surface)" : "transparent",
                  boxShadow: isActive ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
                  borderLeft: isActive ? "3px solid #2B7FD8" : "3px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "var(--ollie-surface-hover)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 18 }}>{canvas.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--ollie-text)" : "var(--ollie-text-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{canvas.name}</div>
                  <div style={{ fontSize: 10, color: "var(--ollie-muted)", fontFamily: "monospace", marginTop: 2 }}>{canvas.nodes.length} nodes</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimap in Sidebar */}
        <div style={{ padding: "0 12px", borderTop: "1px solid var(--ollie-border)", background: "var(--ollie-input)" }}>
          <Minimap
            nodes={nodes} pan={pan} scale={scale} containerW={containerSize.w} containerH={containerSize.h}
            onJump={(px, py) => setPan({ x: px, y: py })}
            onDragView={(px, py) => setPan({ x: px, y: py })}
          />
        </div>

        {/* Add Canvas */}
        <div style={{ padding: "16px", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <button onClick={addCanvas} style={{
            width: "100%", padding: "10px 0", borderRadius: 10, border: "1.5px dashed rgba(43,127,216,0.35)",
            background: "none", color: "#2B7FD8", fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "rgba(43,127,216,0.06)"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "none"}
          >
            <span style={{ fontSize: 16 }}>＋</span> 新建画布
          </button>
        </div>
      </div>

      {/* ── Canvas Area ── */}
      <div
        ref={containerRef}
        style={{ flex: 1, position: "relative", overflow: "hidden", cursor: "grab", touchAction: "none", overscrollBehavior: "contain" }}
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPM}
        onPointerUp={onCanvasPU}
      >
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs>
            <pattern id="dot" x={pan.x % (24 * scale)} y={pan.y % (24 * scale)} width={24 * scale} height={24 * scale} patternUnits="userSpaceOnUse">
              <circle cx={1.5} cy={1.5} r={1} fill="var(--ollie-text)" opacity={0.12} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot)" />
        </svg>

        <div style={{ position: "absolute", inset: 0, transform: `translate(${pan.x}px,${pan.y}px) scale(${scale})`, transformOrigin: "0 0", pointerEvents: "none" }}>
          <svg style={{ position: "absolute", inset: 0, width: `${CANVAS_VIRTUAL_SIZE}px`, height: `${CANVAS_VIRTUAL_SIZE}px`, overflow: "visible", pointerEvents: "none" }}>
            {connections.map(([a, b]) => {
              const na = nodes.find(n => n.id === a), nb = nodes.find(n => n.id === b);
              if (!na || !nb) return null;
              return <line key={`${a}-${b}`} x1={na.x + na.w / 2} y1={na.y + 50} x2={nb.x + nb.w / 2} y2={nb.y + 50} stroke="#2B7FD855" strokeWidth={2} strokeDasharray="6 6" />;
            })}
          </svg>
          {nodes.map(node => (
            <div key={node.id} style={{ pointerEvents: "auto" }}>
              <CardNodeEl node={node} selected={selectedNode === node.id} scale={scale} onSelect={() => setSelectedNode(node.id)} onMove={(dx, dy) => moveNode(node.id, dx, dy)} onUpdate={p => updateNode(node.id, p)} onDelete={() => deleteNode(node.id)} />
            </div>
          ))}
        </div>

        {/* Floating Toolbar */}
        <div style={{
          position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 12, alignItems: "center", zIndex: 100,
          background: "var(--ollie-menu)", backdropFilter: "blur(20px)",
          border: "1px solid var(--ollie-border)", borderRadius: 999,
          padding: "8px 20px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          fontFamily: "monospace", fontSize: 12, color: "var(--ollie-text-soft)",
        }}>
          <button onClick={addNode} style={{ background: "#1A1A2E", color: "#fff", border: "none", borderRadius: 999, padding: "8px 16px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#F4D758" }}>＋</span> 新建卡片
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(26,26,46,0.1)" }} />
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => { setScale(0.72); setPan({ x: -1700 + 400, y: -1700 + 300 }); }} style={{ background: "none", border: "1px solid var(--ollie-border-strong)", borderRadius: 999, padding: "4px 12px", cursor: "pointer", color: "var(--ollie-text-soft)" }}>重置视角</button>
          <div style={{ width: 1, height: 20, background: "rgba(26,26,46,0.1)" }} />
          <span style={{ color: "var(--ollie-muted)", fontSize: 11 }}>鼠标拖拽平移 · 滚轮缩放</span>
        </div>
      </div>
    </div>
  );
}
