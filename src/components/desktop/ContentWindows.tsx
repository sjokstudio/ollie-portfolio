"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  AudioWaveform,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Copy,
  Eye,
  FilePlus2,
  LocateFixed,
  Monitor,
  Moon,
  Network,
  Pencil,
  Pin,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react";
import { AI_LAB_PROJECTS, ARTICLES, CONTACTS, NOW_ITEMS, SHORT_SIGNALS } from "@/content/ollieContent";
import { useTheme, type ThemeMode } from "@/components/theme/ThemeProvider";
import type { IdeaItem, LocalNote, WeatherPreference } from "./desktopStore";

const mono = "var(--font-fira-code), ui-monospace, SFMono-Regular, Menlo, monospace";
const sans = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";
const buttonStyle: React.CSSProperties = { minHeight: 38, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: "1px solid var(--ollie-border)", borderRadius: 9, padding: "7px 10px", background: "var(--ollie-surface)", color: "var(--ollie-text)", cursor: "pointer", fontSize: 12 };

export function SystemWindow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`ollie-theme-transition ${className ?? ""}`} style={{ height: "100%", overflow: "auto", padding: 22, background: "var(--ollie-window)", color: "var(--ollie-text)", fontFamily: sans }}>{children}</div>;
}

function openDesktopWindow(id: string) {
  window.dispatchEvent(new CustomEvent("ollie:open-window", { detail: id }));
}

export function NowWindow() {
  const [expanded, setExpanded] = useState<string | null>(NOW_ITEMS[0].id);
  return <SystemWindow>
    <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
      <div><div style={{ fontSize: 10, color: "#2B7FD8", fontFamily: mono, letterSpacing: "0.12em" }}>NOW / OLLIE</div><h2 style={{ margin: "5px 0 0", fontSize: 26, letterSpacing: "-0.035em" }}>此刻正在发生</h2></div>
      <span style={{ fontSize: 10, color: "var(--ollie-muted)", fontFamily: mono }}>UPDATED 2026.07</span>
    </header>
    <div className="ollie-now-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
      {NOW_ITEMS.map(item => {
        const active = item.id === expanded;
        return <button key={item.id} onClick={() => setExpanded(active ? null : item.id)} aria-expanded={active} style={{ minHeight: active ? 176 : 132, padding: 15, borderRadius: 13, border: active ? "1px solid rgba(43,127,216,.5)" : "1px solid var(--ollie-border)", background: active ? "color-mix(in srgb, #2B7FD8 13%, var(--ollie-surface))" : "var(--ollie-surface)", color: "var(--ollie-text)", textAlign: "left", cursor: "pointer", transition: "transform 180ms ease, min-height 220ms ease, background 220ms ease" }}>
          <span style={{ display: "block", marginBottom: 8, color: active ? "#2B7FD8" : "var(--ollie-muted)", fontSize: 10, fontFamily: mono }}>{item.label}</span>
          <strong style={{ display: "block", fontSize: 14, lineHeight: 1.45 }}>{item.title}</strong>
          {active && <><span style={{ display: "block", marginTop: 9, color: "var(--ollie-text-soft)", fontSize: 12, lineHeight: 1.62 }}>{item.body}</span><span onClick={event => { event.stopPropagation(); openDesktopWindow(item.action); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, color: "#2B7FD8", fontSize: 11, fontWeight: 700 }}>{item.actionLabel}<ArrowUpRight size={13} /></span></>}
        </button>;
      })}
    </div>
    <p style={{ margin: "16px 0 0", color: "var(--ollie-muted)", fontSize: 11, lineHeight: 1.6 }}>它不假装实时，只记录这个阶段真正占据注意力的事情。</p>
  </SystemWindow>;
}

export function SignalWindow() {
  return <SystemWindow>
    <header style={{ marginBottom: 20 }}><div style={{ fontSize: 10, color: "#2B7FD8", fontFamily: mono, letterSpacing: "0.12em" }}>SIGNAL BOARD / 02</div><h2 style={{ margin: "5px 0 8px", fontSize: 27, letterSpacing: "-0.035em" }}>观察不是预测，是留下坐标。</h2><p style={{ margin: 0, maxWidth: 560, color: "var(--ollie-text-soft)", fontSize: 12, lineHeight: 1.65 }}>两篇完整文章，以及两条仍在继续观察的短信号。</p></header>
    <div className="ollie-signal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
      {ARTICLES.map((article, index) => <button key={article.slug} onClick={() => window.open(`/articles/${article.slug}`, "_blank", "noopener,noreferrer")} style={{ position: "relative", minHeight: 246, padding: 17, overflow: "hidden", border: "1px solid var(--ollie-border)", borderRadius: 15, background: `linear-gradient(145deg, color-mix(in srgb, ${article.accent} 18%, var(--ollie-surface)), var(--ollie-surface))`, color: "var(--ollie-text)", cursor: "pointer", textAlign: "left" }}>
        <div aria-hidden="true" style={{ position: "absolute", width: 138, height: 138, right: -38, top: -42, borderRadius: "50%", border: `22px solid color-mix(in srgb, ${article.accent} 20%, transparent)` }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", gap: 10, color: article.accent, fontFamily: mono, fontSize: 10 }}><span>0{index + 1} / {article.category.toUpperCase()}</span><ArrowUpRight size={15} /></div>
        <h3 style={{ position: "relative", maxWidth: 250, margin: "45px 0 10px", fontFamily: "var(--font-fraunces)", fontSize: 21, lineHeight: 1.22 }}>{article.title}</h3>
        <p style={{ position: "relative", margin: 0, color: "var(--ollie-text-soft)", fontSize: 11, lineHeight: 1.62 }}>{article.excerpt}</p>
        <div style={{ position: "absolute", left: 17, bottom: 15, color: "var(--ollie-muted)", fontFamily: mono, fontSize: 9 }}>{article.readingTime} · {article.tags.slice(0, 2).join(" / ")}</div>
      </button>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginTop: 12 }}>
      {SHORT_SIGNALS.map(signal => <div key={signal.category} style={{ padding: 14, borderRadius: 12, borderLeft: `4px solid ${signal.accent}`, background: "var(--ollie-surface)" }}><strong style={{ fontSize: 12 }}>{signal.category}</strong><p style={{ margin: "7px 0 0", color: "var(--ollie-text-soft)", fontSize: 11, lineHeight: 1.58 }}>{signal.body}</p></div>)}
    </div>
  </SystemWindow>;
}

export function LinksWindow({ notify }: { notify: (message: string) => void }) {
  const copyTelegram = async () => {
    try { await navigator.clipboard.writeText(CONTACTS.telegram.label); notify("已复制 Telegram 用户名"); }
    catch { notify(`Telegram：${CONTACTS.telegram.label}`); }
  };
  return <SystemWindow>
    <div style={{ fontSize: 10, color: "#B64FD2", fontFamily: mono, letterSpacing: "0.12em" }}>LINK LOCKER</div>
    <h2 style={{ margin: "5px 0 8px", fontSize: 27, letterSpacing: "-0.035em" }}>把门留在这里</h2>
    <p style={{ margin: "0 0 20px", color: "var(--ollie-text-soft)", fontSize: 12, lineHeight: 1.65 }}>公开表达留在 X，直接联系走 Telegram。</p>
    <a href={CONTACTS.x.url} target="_blank" rel="noreferrer" style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "17px 18px", borderRadius: 14, background: "#111827", color: "#fff", textDecoration: "none", marginBottom: 11 }}><span><strong>𝕏 {CONTACTS.x.label}</strong><small style={{ display: "block", marginTop: 5, opacity: .62 }}>观点、工具、实验与日常信号</small></span><ArrowUpRight size={18} /></a>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "17px 18px", borderRadius: 14, background: "linear-gradient(145deg,#268bd2,#2B7FD8)", color: "#fff" }}>
      <a href={CONTACTS.telegram.url} target="_blank" rel="noreferrer" style={{ flex: 1, color: "inherit", textDecoration: "none" }}><strong>Telegram {CONTACTS.telegram.label}</strong><small style={{ display: "block", marginTop: 5, opacity: .76 }}>私信、合作与更直接的联系</small></a>
      <button type="button" onClick={copyTelegram} aria-label="复制 Telegram 用户名" title="复制用户名" style={{ width: 42, height: 42, display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.28)", borderRadius: 11, background: "rgba(255,255,255,.12)", color: "#fff", cursor: "pointer" }}><Copy size={17} /></button>
    </div>
  </SystemWindow>;
}

function MarkdownPreview({ body }: { body: string }) {
  const lines = body.split("\n");
  return <div style={{ minHeight: 250, color: "var(--ollie-text-soft)", fontSize: 13, lineHeight: 1.75 }}>
    {lines.map((line, index) => {
      if (line.startsWith("# ")) return <h2 key={index} style={{ margin: "0 0 14px", color: "var(--ollie-text)", fontFamily: "var(--font-fraunces)", fontSize: 24 }}>{line.slice(2)}</h2>;
      if (line.startsWith("## ")) return <h3 key={index} style={{ margin: "18px 0 8px", color: "var(--ollie-text)", fontSize: 17 }}>{line.slice(3)}</h3>;
      if (line.startsWith("- ")) return <div key={index} style={{ display: "flex", gap: 8, marginBottom: 5 }}><span style={{ color: "#2B7FD8" }}>•</span><span>{line.slice(2)}</span></div>;
      return line ? <p key={index} style={{ margin: "0 0 10px" }}>{line}</p> : <div key={index} style={{ height: 6 }} />;
    })}
  </div>;
}

export function MemoWindow({ notes, onChange, onCreate, onDelete }: {
  notes: LocalNote[];
  onChange: (id: string, patch: Partial<LocalNote>) => void;
  onCreate: () => string;
  onDelete: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(notes.find(note => note.pinned)?.id ?? notes[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(true);
  const note = notes.find(item => item.id === selectedId) ?? notes[0];
  const filtered = notes.filter(item => `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.updatedAt.localeCompare(a.updatedAt));

  useEffect(() => {
    if (saved) return;
    const id = window.setTimeout(() => setSaved(true), 550);
    return () => window.clearTimeout(id);
  }, [saved, note?.body, note?.title]);

  return <SystemWindow className="memo-window">
    <div style={{ display: "grid", gridTemplateColumns: "180px minmax(0, 1fr)", minHeight: "100%", gap: 16 }}>
      <aside style={{ paddingRight: 14, borderRight: "1px solid var(--ollie-border)" }}>
        <div style={{ display: "flex", gap: 7 }}><label style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6, height: 36, padding: "0 9px", border: "1px solid var(--ollie-border)", borderRadius: 9, background: "var(--ollie-input)" }}><Search size={14} color="var(--ollie-muted)" /><input value={query} onChange={event => setQuery(event.target.value)} aria-label="搜索备忘录" placeholder="搜索" style={{ width: "100%", border: 0, outline: 0, background: "transparent", color: "var(--ollie-text)", fontSize: 11 }} /></label><button aria-label="新建备忘录" onClick={() => setSelectedId(onCreate())} style={{ ...buttonStyle, width: 36, padding: 0 }}><Plus size={15} /></button></div>
        <div style={{ marginTop: 10, display: "grid", gap: 5 }}>
          {filtered.map(item => <button key={item.id} onClick={() => setSelectedId(item.id)} style={{ width: "100%", padding: "9px 10px", border: "1px solid", borderColor: selectedId === item.id ? "rgba(43,127,216,.45)" : "transparent", borderRadius: 9, background: selectedId === item.id ? "color-mix(in srgb, #2B7FD8 13%, var(--ollie-surface))" : "transparent", color: "var(--ollie-text)", textAlign: "left", cursor: "pointer" }}><span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700 }}>{item.pinned && <Pin size={10} fill="currentColor" />}{item.title}</span><small style={{ display: "block", marginTop: 4, color: "var(--ollie-muted)", fontSize: 9 }}>{new Date(item.updatedAt).toLocaleDateString("zh-CN")}</small></button>)}
          {!filtered.length && <p style={{ color: "var(--ollie-muted)", fontSize: 11 }}>没有匹配的备忘录。</p>}
        </div>
      </aside>
      <section style={{ minWidth: 0 }}>
        {note ? <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}><div><div style={{ color: "#D4AB22", fontFamily: mono, fontSize: 9, letterSpacing: ".12em" }}>MEMO / LOCAL</div><span aria-live="polite" style={{ color: "var(--ollie-muted)", fontSize: 9 }}>{saved ? "已自动保存" : "正在保存…"}</span></div><div style={{ display: "flex", gap: 6 }}><button onClick={() => onChange(note.id, { pinned: !note.pinned })} aria-label={note.pinned ? "取消置顶" : "置顶"} style={buttonStyle}><Pin size={14} fill={note.pinned ? "currentColor" : "none"} /></button><button onClick={() => setPreview(value => !value)} aria-label={preview ? "编辑" : "预览"} style={buttonStyle}>{preview ? <Pencil size={14} /> : <Eye size={14} />}</button><button onClick={() => onDelete(note.id)} aria-label="删除备忘录" style={{ ...buttonStyle, color: "#E84A5F" }}><Trash2 size={14} /></button></div></div>
          {preview ? <MarkdownPreview body={note.body} /> : <><input value={note.title} onChange={event => { onChange(note.id, { title: event.target.value, updatedAt: new Date().toISOString() }); setSaved(false); }} aria-label="备忘录标题" style={{ width: "100%", padding: "0 0 10px", border: 0, borderBottom: "1px solid var(--ollie-border)", outline: 0, background: "transparent", color: "var(--ollie-text)", fontSize: 22, fontWeight: 750 }} /><textarea value={note.body} onChange={event => { onChange(note.id, { body: event.target.value, updatedAt: new Date().toISOString() }); setSaved(false); }} aria-label="备忘录内容" style={{ width: "100%", minHeight: 270, marginTop: 13, padding: 0, resize: "none", border: 0, outline: 0, background: "transparent", color: "var(--ollie-text-soft)", fontFamily: sans, fontSize: 13, lineHeight: 1.75 }} /></>}
        </> : <div style={{ height: 280, display: "grid", placeItems: "center", color: "var(--ollie-muted)" }}><button onClick={() => setSelectedId(onCreate())} style={buttonStyle}><FilePlus2 size={15} />新建第一条备忘录</button></div>}
      </section>
    </div>
  </SystemWindow>;
}

const IDEA_STATUS: Record<IdeaItem["status"], { label: string; color: string }> = {
  seed: { label: "种子", color: "#8E9AAD" },
  growing: { label: "生长中", color: "#2B7FD8" },
  shipped: { label: "已完成", color: "#42B883" },
};

export function IdeaWindow({ ideas, onChange, onCreate, onDelete, onConvert }: {
  ideas: IdeaItem[];
  onChange: (id: string, patch: Partial<IdeaItem>) => void;
  onCreate: (title: string) => string;
  onDelete: (id: string) => void;
  onConvert: (idea: IdeaItem) => void;
}) {
  const [selectedId, setSelectedId] = useState(ideas[0]?.id ?? "");
  const [filter, setFilter] = useState<"all" | IdeaItem["status"]>("all");
  const [draft, setDraft] = useState("");
  const visible = filter === "all" ? ideas : ideas.filter(idea => idea.status === filter);
  const selected = ideas.find(idea => idea.id === selectedId) ?? visible[0];
  const add = () => { const title = draft.trim(); if (!title) return; setSelectedId(onCreate(title)); setDraft(""); };
  const random = () => { if (!visible.length) return; setSelectedId(visible[Math.floor(Math.random() * visible.length)].id); };

  return <SystemWindow>
    <header style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 16 }}><div><div style={{ color: "#D4AB22", fontFamily: mono, fontSize: 10, letterSpacing: ".12em" }}>IDEA BOX</div><h2 style={{ margin: "5px 0 0", fontSize: 25 }}>先留下，再决定它要长成什么。</h2></div><button onClick={random} style={buttonStyle}><Sparkles size={14} />随机抽一个</button></header>
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>{(["all", "seed", "growing", "shipped"] as const).map(status => <button key={status} onClick={() => setFilter(status)} style={{ ...buttonStyle, minHeight: 32, padding: "5px 9px", background: filter === status ? "#2B7FD8" : "var(--ollie-surface)", color: filter === status ? "#fff" : "var(--ollie-text)" }}>{status === "all" ? "全部" : IDEA_STATUS[status].label}</button>)}</div>
    <div className="ollie-idea-layout" style={{ display: "grid", gridTemplateColumns: "minmax(180px, .85fr) minmax(240px, 1.15fr)", gap: 12 }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 9 }}><input value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => event.key === "Enter" && add()} aria-label="新灵感标题" placeholder="快速记下一个想法" style={{ flex: 1, minWidth: 0, height: 38, padding: "0 10px", border: "1px solid var(--ollie-border)", borderRadius: 9, outline: 0, background: "var(--ollie-input)", color: "var(--ollie-text)", fontSize: 11 }} /><button onClick={add} aria-label="添加灵感" style={{ ...buttonStyle, width: 38, padding: 0 }}><Plus size={15} /></button></div>
        <div style={{ display: "grid", gap: 7, maxHeight: 300, overflow: "auto" }}>{visible.map(idea => <button key={idea.id} onClick={() => setSelectedId(idea.id)} style={{ padding: 11, border: selected?.id === idea.id ? `1px solid ${IDEA_STATUS[idea.status].color}` : "1px solid var(--ollie-border)", borderRadius: 10, background: "var(--ollie-surface)", color: "var(--ollie-text)", textAlign: "left", cursor: "pointer" }}><span style={{ display: "block", fontSize: 12, fontWeight: 700 }}>{idea.title}</span><small style={{ display: "block", marginTop: 6, color: IDEA_STATUS[idea.status].color }}>{IDEA_STATUS[idea.status].label}</small></button>)}</div>
      </div>
      {selected ? <div style={{ padding: 15, border: "1px solid var(--ollie-border)", borderRadius: 12, background: "var(--ollie-surface)" }}><input value={selected.title} onChange={event => onChange(selected.id, { title: event.target.value, updatedAt: new Date().toISOString() })} aria-label="灵感标题" style={{ width: "100%", border: 0, outline: 0, background: "transparent", color: "var(--ollie-text)", fontSize: 18, fontWeight: 750 }} /><textarea value={selected.summary} onChange={event => onChange(selected.id, { summary: event.target.value, updatedAt: new Date().toISOString() })} aria-label="灵感说明" style={{ width: "100%", minHeight: 108, marginTop: 12, padding: 0, resize: "none", border: 0, outline: 0, background: "transparent", color: "var(--ollie-text-soft)", fontSize: 12, lineHeight: 1.65 }} /><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{(["seed", "growing", "shipped"] as const).map(status => <button key={status} onClick={() => onChange(selected.id, { status, updatedAt: new Date().toISOString() })} style={{ ...buttonStyle, minHeight: 30, padding: "4px 8px", borderColor: selected.status === status ? IDEA_STATUS[status].color : "var(--ollie-border)", color: selected.status === status ? IDEA_STATUS[status].color : "var(--ollie-text-soft)" }}>{IDEA_STATUS[status].label}</button>)}</div><div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 16 }}><button onClick={() => onConvert(selected)} style={{ ...buttonStyle, background: "#2B7FD8", color: "#fff", borderColor: "#2B7FD8" }}><FilePlus2 size={14} />转为备忘录</button><button onClick={() => onDelete(selected.id)} aria-label="删除灵感" style={{ ...buttonStyle, color: "#E84A5F" }}><Trash2 size={14} /></button></div></div> : <div style={{ display: "grid", placeItems: "center", minHeight: 260, border: "1px dashed var(--ollie-border)", borderRadius: 12, color: "var(--ollie-muted)", fontSize: 12 }}>这个状态里还没有灵感。</div>}
    </div>
  </SystemWindow>;
}

type TerminalLine = { type: "system" | "user" | "assistant"; text: string };
const TERMINAL_SUGGESTIONS = ["你是谁", "Ollie 在做什么", "打开观察板", "介绍一下你的音乐", "查看天气"];

function terminalReply(input: string): { lines: string[]; action?: () => void } {
  const q = input.trim().toLowerCase();
  if (!q) return { lines: ["你可以直接问我问题，或者输入 help 查看能力。"] };
  if (q === "help" || q.includes("帮助")) return { lines: ["我可以介绍 Ollie、打开桌面模块、切换主题，或带你去看文章。", "试试：你是谁 / 打开观察板 / 查看天气 / theme dark"] };
  if (q.includes("你是谁") || q === "whoami" || q.includes("ollie 是谁")) return { lines: ["我是 Ollie Assistant，一个完全运行在当前网页里的本地模拟助手。", "我不会把输入发送给 AI 服务，但可以带你浏览 OllieOS。"] };
  if (q.includes("在做") || q === "now") return { lines: ["Ollie 正在把观点、音乐和工具实验整理成一个可以长期停留的个人空间。"], action: () => openDesktopWindow("now") };
  if (q.includes("音乐") || q === "music") return { lines: ["播放器里现在有《2026.331》和《3.27 灰色头像 miX3》两首本地音乐。"], action: () => openDesktopWindow("music") };
  if (q.includes("观察") || q.includes("文章") || q === "articles") return { lines: ["观察板里有两篇完整文章：一篇关于 AI 创作系统，一篇关于音乐与记忆。"], action: () => openDesktopWindow("signal") };
  if (q.includes("实验室") || q === "ai") return { lines: ["AI 实验室展示 Prompt、内容工作流、信号整理和声音视觉四个概念实验。"], action: () => openDesktopWindow("ai") };
  if (q.includes("联系") || q.includes("telegram") || q === "contact") return { lines: [`可以通过 X ${CONTACTS.x.label} 或 Telegram ${CONTACTS.telegram.label} 联系 Ollie。`], action: () => openDesktopWindow("links") };
  if (q.includes("btc") || q.includes("行情") || q.includes("比特币")) return { lines: ["正在打开 BTC 实时行情组件。"], action: () => openDesktopWindow("btc") };
  if (q.includes("天气") || q === "weather") return { lines: ["天气会先根据 IP 粗略定位，也可以在窗口里手动选择城市。"], action: () => openDesktopWindow("weather") };
  const theme = q.match(/theme\s+(light|dark|system)/)?.[1] as ThemeMode | undefined;
  if (theme || q.includes("浅色模式") || q.includes("深色模式") || q.includes("跟随系统")) {
    const mode: ThemeMode = theme ?? (q.includes("浅色") ? "light" : q.includes("深色") ? "dark" : "system");
    return { lines: [`主题已切换为 ${mode === "light" ? "浅色" : mode === "dark" ? "深色" : "跟随系统"}。`], action: () => window.dispatchEvent(new CustomEvent("ollie:set-theme", { detail: mode })) };
  }
  if (q === "clear") return { lines: ["__CLEAR__"] };
  return { lines: ["我没有接入在线大模型，因此不会假装知道所有答案。", "可以试试：你是谁、打开观察板、介绍音乐、查看天气、联系 Ollie。"] };
}

export function TerminalWindow() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: "system", text: "OLLIE ASSISTANT / LOCAL SIMULATION" },
    { type: "assistant", text: "你好，我在当前浏览器本地运行。问我一个问题，或者点击下面的提示。" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const endRef = useRef<HTMLDivElement>(null);

  const submit = (raw = input) => {
    const value = raw.trim();
    if (!value || thinking) return;
    setInput(""); setThinking(true); setHistory(items => [...items, value]); setHistoryIndex(-1);
    setLines(items => [...items, { type: "user", text: value }]);
    const result = terminalReply(value);
    window.setTimeout(() => {
      if (result.lines[0] === "__CLEAR__") setLines([{ type: "system", text: "OLLIE ASSISTANT / LOCAL SIMULATION" }]);
      else setLines(items => [...items, ...result.lines.map(text => ({ type: "assistant" as const, text }))]);
      result.action?.();
      setThinking(false);
    }, 320);
  };
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines, thinking]);

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0e141d", color: "#dfe9f7", fontFamily: mono }}>
    <div style={{ flex: 1, overflow: "auto", padding: "16px 17px" }}>
      {lines.map((line, index) => <div key={`${line.text}-${index}`} style={{ display: "flex", gap: 9, marginBottom: 9, color: line.type === "system" ? "#F4D758" : line.type === "user" ? "#7dbdff" : "#84e4a8", fontSize: line.type === "system" ? 10 : 12, lineHeight: 1.62 }}><span style={{ opacity: .48 }}>{line.type === "user" ? ">" : line.type === "assistant" ? "AI" : "●"}</span><span>{line.text}</span></div>)}
      {thinking && <div aria-live="polite" style={{ color: "#84e4a8", fontSize: 12 }}><span style={{ opacity: .48 }}>AI</span> · · ·</div>}
      <div ref={endRef} />
    </div>
    <div style={{ padding: "8px 13px", display: "flex", gap: 6, overflowX: "auto", borderTop: "1px solid rgba(255,255,255,.08)" }}>{TERMINAL_SUGGESTIONS.map(suggestion => <button key={suggestion} onClick={() => submit(suggestion)} disabled={thinking} style={{ flexShrink: 0, padding: "5px 8px", border: "1px solid rgba(125,189,255,.22)", borderRadius: 999, background: "rgba(125,189,255,.07)", color: "#a8cdec", cursor: "pointer", fontSize: 10 }}>{suggestion}</button>)}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 48, padding: "7px 14px", borderTop: "1px solid rgba(255,255,255,.08)" }}><span style={{ color: "#2B7FD8" }}>$</span><input autoFocus value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => {
      if (event.key === "Enter") submit();
      if (event.key === "ArrowUp" && history.length) { event.preventDefault(); const next = Math.min(history.length - 1, historyIndex + 1); setHistoryIndex(next); setInput(history[history.length - 1 - next]); }
      if (event.key === "ArrowDown") { event.preventDefault(); const next = historyIndex - 1; setHistoryIndex(next); setInput(next >= 0 ? history[history.length - 1 - next] : ""); }
    }} aria-label="向 Ollie Assistant 输入内容" placeholder="输入问题或命令…" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: "#84e4a8", fontFamily: mono, fontSize: 12 }} /><button onClick={() => submit()} disabled={!input.trim() || thinking} aria-label="发送" style={{ width: 36, height: 34, display: "grid", placeItems: "center", border: 0, borderRadius: 9, background: input.trim() ? "#2B7FD8" : "#293443", color: "#fff", cursor: input.trim() ? "pointer" : "default" }}><Send size={14} /></button></div>
  </div>;
}

type WeatherLocation = { city: string; country?: string; latitude: number; longitude: number; timezone?: string };
type WeatherData = { location: WeatherLocation; sourceMode?: WeatherPreference["mode"]; fetchedAt: number; current: { temperature: number; apparent: number; humidity: number; wind: number; code: number; isDay: boolean }; hourly: { time: string; temperature: number; code: number }[]; daily: { date: string; high: number; low: number; code: number }[] };
type GeoResult = { id: number; name: string; country?: string; admin1?: string; latitude: number; longitude: number; timezone?: string };
const WEATHER_CACHE_KEY = "ollieos-weather-cache-v1";

function weatherMeta(code: number, isDay = true): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: "晴朗", Icon: isDay ? Sun : Moon };
  if (code <= 3) return { label: "多云", Icon: CloudSun };
  if (code === 45 || code === 48) return { label: "有雾", Icon: Cloud };
  if (code >= 51 && code <= 67) return { label: "有雨", Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: "有雪", Icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: "阵雨", Icon: CloudRain };
  if (code >= 95) return { label: "雷雨", Icon: CloudLightning };
  return { label: "天气变化", Icon: Cloud };
}

async function detectLocation(signal: AbortSignal): Promise<WeatherLocation> {
  const response = await fetch("https://ipwho.is/", { cache: "no-store", signal });
  if (!response.ok) throw new Error("无法读取 IP 城市");
  const data = await response.json() as { success: boolean; city?: string; country?: string; latitude?: number; longitude?: number; timezone?: { id?: string } };
  if (!data.success || !data.city || !Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) throw new Error("IP 定位结果不可用");
  return { city: data.city, country: data.country, latitude: data.latitude!, longitude: data.longitude!, timezone: data.timezone?.id };
}

async function fetchWeather(location: WeatherLocation, signal: AbortSignal): Promise<WeatherData> {
  const query = new URLSearchParams({ latitude: String(location.latitude), longitude: String(location.longitude), current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m", hourly: "temperature_2m,weather_code", daily: "weather_code,temperature_2m_max,temperature_2m_min", timezone: location.timezone || "auto", forecast_days: "5" });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { cache: "no-store", signal });
  if (!response.ok) throw new Error("天气服务暂时不可用");
  const data = await response.json() as { current: Record<string, number>; hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] }; daily: { time: string[]; temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] } };
  const now = Date.now();
  const futureStart = Math.max(0, data.hourly.time.findIndex(time => new Date(time).getTime() >= now));
  return {
    location,
    fetchedAt: now,
    current: { temperature: data.current.temperature_2m, apparent: data.current.apparent_temperature, humidity: data.current.relative_humidity_2m, wind: data.current.wind_speed_10m, code: data.current.weather_code, isDay: data.current.is_day === 1 },
    hourly: data.hourly.time.slice(futureStart, futureStart + 6).map((time, index) => ({ time, temperature: data.hourly.temperature_2m[futureStart + index], code: data.hourly.weather_code[futureStart + index] })),
    daily: data.daily.time.map((date, index) => ({ date, high: data.daily.temperature_2m_max[index], low: data.daily.temperature_2m_min[index], code: data.daily.weather_code[index] })),
  };
}

export function WeatherWindow({ preference, onPreferenceChange }: { preference: WeatherPreference; onPreferenceChange: (preference: WeatherPreference) => void }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async (force = false, override?: WeatherLocation, nextMode?: WeatherPreference["mode"]) => {
    controller.current?.abort(); controller.current = new AbortController();
    setLoading(true); setError(null);
    try {
      const cachedRaw = window.localStorage.getItem(WEATHER_CACHE_KEY);
      let cached: WeatherData | null = null;
      if (cachedRaw) {
        try { cached = JSON.parse(cachedRaw) as WeatherData; }
        catch { window.localStorage.removeItem(WEATHER_CACHE_KEY); }
      }
      const mode = nextMode ?? preference.mode;
      const requestedCity = override?.city ?? preference.city;
      if (!force && cached && cached.sourceMode === mode && Date.now() - cached.fetchedAt < 15 * 60_000 && (mode === "auto" || cached.location.city === requestedCity)) { setWeather(cached); return; }
      const location = override ?? (mode === "manual" && preference.city && Number.isFinite(preference.latitude) && Number.isFinite(preference.longitude) ? { city: preference.city, country: preference.country, latitude: preference.latitude!, longitude: preference.longitude!, timezone: preference.timezone } : await detectLocation(controller.current.signal));
      const next = { ...await fetchWeather(location, controller.current.signal), sourceMode: mode };
      setWeather(next); window.localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(next));
    } catch (caught) {
      if ((caught as Error).name === "AbortError") return;
      setError("暂时无法更新天气。可以重试，或手动选择城市。");
    } finally { setLoading(false); }
  }, [preference]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 0);
    return () => { window.clearTimeout(id); controller.current?.abort(); };
  }, [load]);

  const searchCities = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(search.trim())}&count=5&language=zh&format=json`);
      const data = await response.json() as { results?: GeoResult[] };
      setResults(data.results ?? []);
    } catch { setResults([]); } finally { setSearching(false); }
  };
  const selectCity = (result: GeoResult) => {
    const location = { city: result.name, country: result.country, latitude: result.latitude, longitude: result.longitude, timezone: result.timezone };
    onPreferenceChange({ mode: "manual", ...location }); setResults([]); setSearch(""); void load(true, location, "manual");
  };
  const useAuto = () => { onPreferenceChange({ mode: "auto" }); setResults([]); setSearch(""); void load(true, undefined, "auto"); };
  const meta = weather ? weatherMeta(weather.current.code, weather.current.isDay) : null;
  const CurrentIcon = meta?.Icon ?? CloudSun;

  return <SystemWindow>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}><div><div style={{ color: "#2B7FD8", fontFamily: mono, fontSize: 9, letterSpacing: ".12em" }}>WEATHER / {preference.mode === "auto" ? "AUTO IP" : "MANUAL"}</div><h2 style={{ margin: "5px 0 0", fontSize: 23 }}>{weather?.location.city ?? "定位中…"}</h2><small style={{ color: "var(--ollie-muted)" }}>{weather?.location.country ?? "根据 IP 粗略定位"}</small></div><button onClick={() => void load(true)} disabled={loading} aria-label="刷新天气" style={buttonStyle}><RefreshCw size={14} className={loading ? "weather-spin" : undefined} /></button></div>
    {weather ? <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 12px", padding: 17, borderRadius: 15, background: weather.current.isDay ? "linear-gradient(145deg,#62b8ef,#2B7FD8)" : "linear-gradient(145deg,#263a63,#111827)", color: "#fff" }}><div><CurrentIcon size={38} strokeWidth={1.5} /><div style={{ marginTop: 9, fontSize: 12 }}>{meta?.label}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 42, fontWeight: 250, fontVariantNumeric: "tabular-nums" }}>{Math.round(weather.current.temperature)}°</div><div style={{ fontSize: 10, opacity: .74 }}>体感 {Math.round(weather.current.apparent)}°</div></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>{[["湿度", `${weather.current.humidity}%`], ["风速", `${weather.current.wind} km/h`], ["状态", weather.current.isDay ? "白天" : "夜晚"]].map(([label, value]) => <div key={label} style={{ padding: 9, borderRadius: 9, background: "var(--ollie-surface-soft)" }}><small style={{ color: "var(--ollie-muted)" }}>{label}</small><strong style={{ display: "block", marginTop: 5, fontSize: 11 }}>{value}</strong></div>)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 5, marginTop: 12 }}>{weather.hourly.map(hour => { const HourIcon = weatherMeta(hour.code).Icon; return <div key={hour.time} style={{ padding: "8px 2px", textAlign: "center", borderRadius: 9, background: "var(--ollie-surface-soft)" }}><small style={{ display: "block", color: "var(--ollie-muted)", fontSize: 8 }}>{new Date(hour.time).toLocaleTimeString("zh-CN", { hour: "2-digit" })}</small><HourIcon size={14} style={{ margin: "7px auto" }} /><strong style={{ fontSize: 9 }}>{Math.round(hour.temperature)}°</strong></div>; })}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 5, marginTop: 12 }}>{weather.daily.map(day => { const DayIcon = weatherMeta(day.code).Icon; return <div key={day.date} style={{ padding: "8px 3px", textAlign: "center", border: "1px solid var(--ollie-border)", borderRadius: 9 }}><small style={{ display: "block", color: "var(--ollie-muted)", fontSize: 8 }}>{new Date(`${day.date}T12:00:00`).toLocaleDateString("zh-CN", { weekday: "short" })}</small><DayIcon size={15} style={{ margin: "8px auto" }} /><span style={{ fontSize: 9 }}>{Math.round(day.high)}° <span style={{ color: "var(--ollie-muted)" }}>{Math.round(day.low)}°</span></span></div>; })}</div>
      <div style={{ marginTop: 10, color: "var(--ollie-muted)", fontSize: 9 }}>Open-Meteo · {new Date(weather.fetchedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</div>
    </> : <div style={{ height: 210, display: "grid", placeItems: "center", marginTop: 16, borderRadius: 14, background: "var(--ollie-surface-soft)", color: "var(--ollie-muted)", fontSize: 12 }}>{loading ? "正在读取城市与天气…" : "暂无天气数据"}</div>}
    {error && <div role="alert" style={{ marginTop: 10, padding: 10, border: "1px solid rgba(232,74,95,.4)", borderRadius: 9, color: "#E84A5F", fontSize: 11 }}>{error}</div>}
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--ollie-border)" }}><div style={{ display: "flex", gap: 6 }}><label style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, height: 38, padding: "0 9px", border: "1px solid var(--ollie-border)", borderRadius: 9, background: "var(--ollie-input)" }}><Search size={14} color="var(--ollie-muted)" /><input value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => event.key === "Enter" && void searchCities()} aria-label="搜索城市" placeholder="输入城市，如杭州" style={{ width: "100%", minWidth: 0, border: 0, outline: 0, background: "transparent", color: "var(--ollie-text)", fontSize: 11 }} /></label><button onClick={() => void searchCities()} disabled={searching} style={buttonStyle}>{searching ? "…" : "搜索"}</button><button onClick={useAuto} aria-label="恢复 IP 自动定位" title="自动定位" style={buttonStyle}><LocateFixed size={14} /></button></div>{results.length > 0 && <div style={{ display: "grid", gap: 4, marginTop: 7 }}>{results.map(result => <button key={result.id} onClick={() => selectCity(result)} style={{ ...buttonStyle, justifyContent: "flex-start", width: "100%" }}>{result.name}{result.admin1 ? ` · ${result.admin1}` : ""}{result.country ? ` · ${result.country}` : ""}</button>)}</div>}</div>
  </SystemWindow>;
}

const LAB_ICONS: Record<string, LucideIcon> = { prompt: Sparkles, content: Network, signal: Radio, audio: AudioWaveform };

export function AILabWindow() {
  const [activeId, setActiveId] = useState(AI_LAB_PROJECTS[0].id);
  const [tone, setTone] = useState("克制");
  const [stage, setStage] = useState(1);
  const [signal, setSignal] = useState("AI");
  const [audioMood, setAudioMood] = useState("夜行");
  const active = AI_LAB_PROJECTS.find(project => project.id === activeId)!;

  const demo = useMemo(() => {
    if (active.id === "prompt") return <div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["克制", "锐利", "口语", "深度"].map(item => <button key={item} onClick={() => setTone(item)} style={{ ...buttonStyle, minHeight: 31, background: tone === item ? "#2B7FD8" : "var(--ollie-surface-soft)", color: tone === item ? "#fff" : "var(--ollie-text)" }}>{item}</button>)}</div><div style={{ marginTop: 12, padding: 13, borderRadius: 10, background: "var(--ollie-surface-soft)", color: "var(--ollie-text-soft)", fontSize: 12, lineHeight: 1.6 }}>{tone === "锐利" ? "工具越强，越要问清楚：哪些判断绝不能外包。" : tone === "口语" ? "AI 能帮我做很多事，但最后像不像我，还是得我自己看。" : tone === "深度" ? "技术降低了执行门槛，也把判断力推到了创作系统的中心。" : "让 AI 承担重复，把判断留给自己。"}</div></div>;
    if (active.id === "content") return <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>{["信号", "选题", "大纲", "成稿", "发布"].map((item, index) => <button key={item} onClick={() => setStage(index)} style={{ minHeight: 72, border: index === stage ? "1px solid #2B7FD8" : "1px solid var(--ollie-border)", borderRadius: 9, background: index <= stage ? "color-mix(in srgb,#2B7FD8 14%,var(--ollie-surface))" : "var(--ollie-surface-soft)", color: "var(--ollie-text)", cursor: "pointer", fontSize: 10 }}>{String(index + 1).padStart(2, "0")}<strong style={{ display: "block", marginTop: 8 }}>{item}</strong></button>)}</div>;
    if (active.id === "signal") return <div><div style={{ display: "flex", gap: 6 }}>{["AI", "Crypto", "Music"].map(item => <button key={item} onClick={() => setSignal(item)} style={{ ...buttonStyle, background: signal === item ? "#2B7FD8" : "var(--ollie-surface-soft)", color: signal === item ? "#fff" : "var(--ollie-text)" }}>{item}</button>)}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 12 }}>{[68, 42, 84].map((height, index) => <div key={index} style={{ height: 100, display: "flex", alignItems: "flex-end", padding: 7, borderRadius: 9, background: "var(--ollie-surface-soft)" }}><div style={{ width: "100%", height: `${height}%`, borderRadius: 6, background: index === 2 ? "#F4D758" : "#2B7FD8", opacity: .82 }} /></div>)}</div><small style={{ display: "block", marginTop: 8, color: "var(--ollie-muted)" }}>{signal} 只是视觉分类，不代表实时趋势或预测。</small></div>;
    return <div><div style={{ display: "flex", gap: 6 }}>{["夜行", "灰色", "开阔"].map(item => <button key={item} onClick={() => setAudioMood(item)} style={{ ...buttonStyle, background: audioMood === item ? "#E84A5F" : "var(--ollie-surface-soft)", color: audioMood === item ? "#fff" : "var(--ollie-text)" }}>{item}</button>)}</div><div style={{ height: 118, display: "flex", alignItems: "center", gap: 4, marginTop: 12, padding: 12, borderRadius: 10, background: "#111827" }}>{Array.from({ length: 28 }, (_, index) => <span key={index} style={{ flex: 1, height: `${18 + ((index * 17 + audioMood.length * 11) % 76)}%`, borderRadius: 999, background: index % 4 === 0 ? "#F4D758" : "#2B7FD8", opacity: .86 }} />)}</div></div>;
  }, [active.id, audioMood, signal, stage, tone]);

  return <SystemWindow>
    <header style={{ marginBottom: 16 }}><div style={{ color: "#2B7FD8", fontFamily: mono, fontSize: 10, letterSpacing: ".12em" }}>AI LAB / OLLIE</div><h2 style={{ margin: "5px 0 6px", fontSize: 26 }}>不是产品陈列，是正在发生的实验。</h2><p style={{ margin: 0, color: "var(--ollie-text-soft)", fontSize: 11, lineHeight: 1.6 }}>所有数据均为交互演示，不伪装成真实模型结果。</p></header>
    <div className="ollie-lab-tabs" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 7 }}>{AI_LAB_PROJECTS.map(project => { const Icon = LAB_ICONS[project.id]; const selected = project.id === active.id; return <button key={project.id} onClick={() => setActiveId(project.id)} style={{ minHeight: 112, padding: 10, border: selected ? "1px solid #2B7FD8" : "1px solid var(--ollie-border)", borderRadius: 11, background: selected ? "color-mix(in srgb,#2B7FD8 13%,var(--ollie-surface))" : "var(--ollie-surface)", color: "var(--ollie-text)", textAlign: "left", cursor: "pointer" }}><Icon size={19} color={selected ? "#2B7FD8" : "var(--ollie-muted)"} /><strong style={{ display: "block", marginTop: 15, fontSize: 11 }}>{project.title}</strong><small style={{ display: "block", marginTop: 4, color: "var(--ollie-muted)", fontSize: 8 }}>{project.status}</small></button>; })}</div>
    <div style={{ marginTop: 11, padding: 14, border: "1px solid var(--ollie-border)", borderRadius: 12, background: "var(--ollie-surface)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}><div><strong>{active.title}</strong><p style={{ margin: "5px 0 0", color: "var(--ollie-text-soft)", fontSize: 11, lineHeight: 1.58 }}>{active.detail}</p></div><span style={{ flexShrink: 0, height: 23, padding: "4px 7px", borderRadius: 999, background: "var(--ollie-surface-soft)", color: "#2B7FD8", fontFamily: mono, fontSize: 8 }}>{active.status}</span></div>{demo}</div>
  </SystemWindow>;
}

export function SettingsWindow({ motionOn, setMotionOn }: { motionOn: boolean; setMotionOn: (value: boolean) => void }) {
  const { mode, setMode } = useTheme();
  const modes: { id: ThemeMode; label: string; Icon: LucideIcon }[] = [{ id: "system", label: "系统", Icon: Monitor }, { id: "light", label: "浅色", Icon: Sun }, { id: "dark", label: "深色", Icon: Moon }];
  return <SystemWindow>
    <div style={{ color: "var(--ollie-muted)", fontFamily: mono, fontSize: 10, letterSpacing: ".12em" }}>SYSTEM SETTINGS</div><h2 style={{ margin: "5px 0 20px", fontSize: 24 }}>外观与动态</h2>
    <fieldset style={{ margin: 0, padding: 0, border: 0 }}><legend style={{ marginBottom: 9, color: "var(--ollie-text-soft)", fontSize: 12 }}>主题</legend><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>{modes.map(item => <button key={item.id} onClick={() => setMode(item.id)} aria-pressed={mode === item.id} style={{ minHeight: 72, display: "grid", placeItems: "center", gap: 5, border: mode === item.id ? "1px solid #2B7FD8" : "1px solid var(--ollie-border)", borderRadius: 11, background: mode === item.id ? "color-mix(in srgb,#2B7FD8 13%,var(--ollie-surface))" : "var(--ollie-surface)", color: mode === item.id ? "#2B7FD8" : "var(--ollie-text)", cursor: "pointer", fontSize: 11 }}><item.Icon size={18} /><span>{item.label}</span></button>)}</div></fieldset>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 18, padding: "14px 0", borderTop: "1px solid var(--ollie-border)", borderBottom: "1px solid var(--ollie-border)" }}><div><strong style={{ fontSize: 13 }}>减少动态效果</strong><small style={{ display: "block", marginTop: 4, color: "var(--ollie-muted)", fontSize: 10 }}>暂停星光、宠物和非必要装饰动画</small></div><button aria-label="减少动态效果" aria-pressed={!motionOn} onClick={() => setMotionOn(!motionOn)} style={{ width: 46, height: 26, padding: 3, border: 0, borderRadius: 999, background: !motionOn ? "#2B7FD8" : "var(--ollie-border-strong)", cursor: "pointer", textAlign: !motionOn ? "right" : "left" }}><span style={{ display: "inline-block", width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,.2)" }} /></button></div>
    <p style={{ marginTop: 16, color: "var(--ollie-muted)", fontSize: 10, lineHeight: 1.6 }}>主题选择保存在当前浏览器；首次访问默认跟随设备系统。</p>
  </SystemWindow>;
}
