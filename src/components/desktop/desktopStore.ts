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
  { id: "ai", label: "AI_Lab", kind: "app", appId: "ai", x: 18, y: 252 },
  { id: "now", label: "NOW.md", kind: "app", appId: "now", x: 18, y: 354 },
  { id: "signal", label: "SIGNAL_BOARD", kind: "app", appId: "signal", x: 18, y: 456 },
  { id: "links", label: "LINK_LOCKER", kind: "app", appId: "links", x: 116, y: 48 },
  { id: "idea", label: "IDEA_BOX", kind: "app", appId: "idea", x: 116, y: 150 },
  { id: "terminal", label: "Terminal", kind: "app", appId: "terminal", x: 116, y: 252 },
  { id: "note", label: "_notes.md", kind: "app", appId: "note", x: 116, y: 354 },
  { id: "canvas", label: "Ollie_Canvas", kind: "app", appId: "canvas", x: 116, y: 456 },
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
      { id: "track-01", title: "Track 01", subtitle: "A sketch waiting for its first night drive", color: "#E84A5F" },
      { id: "track-02", title: "Track 02", subtitle: "Fragments, field notes and unfinished drums", color: "#F4D758" },
      { id: "track-03", title: "Track 03", subtitle: "Coming soon", color: "#2B7FD8" },
    ],
  };
}

export function gridPosition(index: number) {
  return { x: 18 + (index % 4) * 98, y: 48 + Math.floor(index / 4) * 104 };
}
