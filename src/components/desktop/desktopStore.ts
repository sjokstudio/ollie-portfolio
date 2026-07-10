export type WallpaperKey = "blue" | "dark" | "space" | "forest" | "dusk";

export type DesktopItemKind = "app" | "folder" | "note";

export type DesktopItem = {
  id: string;
  label: string;
  kind: DesktopItemKind;
  x: number;
  y: number;
  appId?: string;
  noteId?: string;
};

export type LocalNote = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
};

export type MusicTrack = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  audioUrl?: string;
  coverUrl?: string;
};

export type DesktopState = {
  wallpaper: WallpaperKey;
  motionOn: boolean;
  pet: { x: number; y: number };
  items: DesktopItem[];
  notes: LocalNote[];
  tracks: MusicTrack[];
};

export const DESKTOP_STORAGE_KEY = "ollieos-desktop-v2";

const defaultItems: DesktopItem[] = [
  { id: "about", label: "About_Ollie", kind: "app", appId: "about", x: 18, y: 48 },
  { id: "music", label: "Music", kind: "app", appId: "music", x: 18, y: 150 },
  { id: "ai", label: "AI 实验室", kind: "app", appId: "ai", x: 18, y: 252 },
  { id: "now", label: "此刻.md", kind: "app", appId: "now", x: 18, y: 354 },
  { id: "signal", label: "观察板", kind: "app", appId: "signal", x: 18, y: 456 },
  { id: "links", label: "联系方式", kind: "app", appId: "links", x: 116, y: 48 },
  { id: "idea", label: "灵感盒", kind: "app", appId: "idea", x: 116, y: 150 },
  { id: "terminal", label: "终端", kind: "app", appId: "terminal", x: 116, y: 252 },
  { id: "note", label: "备忘录.md", kind: "app", appId: "note", x: 116, y: 354 },
  { id: "canvas", label: "无限画布", kind: "app", appId: "canvas", x: 116, y: 456 },
  { id: "btc", label: "BTC 行情", kind: "app", appId: "btc", x: 214, y: 48 },
];

export function createDefaultDesktopState(): DesktopState {
  return {
    wallpaper: "blue",
    motionOn: true,
    pet: { x: 0, y: 0 },
    items: defaultItems,
    notes: [
      {
        id: "idea-box",
        title: "IDEA_BOX",
        body: "把想法留下来，之后再慢慢完成。\n\n- AI workflow\n- 新的音乐片段\n- 下一篇 X 文章",
        updatedAt: new Date().toISOString(),
      },
    ],
    tracks: [
      { id: "track-01", title: "2026.331", subtitle: "Ollie / Track 01", color: "#E84A5F", audioUrl: "/audio/track-01.mp3" },
      { id: "track-02", title: "3.27灰色头像 miX3", subtitle: "Ollie / Track 02", color: "#F4D758", audioUrl: "/audio/track-02.mp3" },
    ],
  };
}

export function gridPosition(index: number) {
  return { x: 18 + (index % 4) * 98, y: 48 + Math.floor(index / 4) * 104 };
}
