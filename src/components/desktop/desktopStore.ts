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
  pinned?: boolean;
};

export type IdeaItem = {
  id: string;
  title: string;
  summary: string;
  status: "seed" | "growing" | "shipped";
  tags: string[];
  updatedAt: string;
};

export type WeatherPreference = {
  mode: "auto" | "manual";
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
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
  ideas: IdeaItem[];
  tracks: MusicTrack[];
  weather: WeatherPreference;
};

export const DESKTOP_STORAGE_KEY = "ollieos-desktop-v3";
export const LEGACY_DESKTOP_STORAGE_KEY = "ollieos-desktop-v2";

const defaultItems: DesktopItem[] = [
  { id: "about", label: "About_Ollie", kind: "app", appId: "about", x: 18, y: 48 },
  { id: "music", label: "Music", kind: "app", appId: "music", x: 18, y: 150 },
  { id: "ai", label: "AI 实验室", kind: "app", appId: "ai", x: 18, y: 252 },
  { id: "now", label: "此刻.md", kind: "app", appId: "now", x: 18, y: 354 },
  { id: "signal", label: "观察板", kind: "app", appId: "signal", x: 18, y: 456 },
  { id: "links", label: "联系方式", kind: "app", appId: "links", x: 116, y: 48 },
  { id: "idea", label: "灵感盒", kind: "app", appId: "idea", x: 116, y: 150 },
  { id: "terminal", label: "终端", kind: "app", appId: "terminal", x: 116, y: 252 },
  { id: "note", label: "备忘录", kind: "app", appId: "memo", x: 116, y: 354 },
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
        id: "welcome-note",
        title: "OllieOS 使用备忘",
        body: "# OllieOS 使用备忘\n\n- 双击桌面图标打开窗口\n- 右键桌面可以新建文件夹和便签\n- 在终端输入 help 查看 Ollie Assistant 的能力",
        updatedAt: new Date().toISOString(),
        pinned: true,
      },
      {
        id: "content-note",
        title: "下一步内容",
        body: "# 下一步内容\n\n- 完成一篇真正想留下来的文章\n- 整理音乐播放器里的两首声音\n- 记录新的 AI 工作流实验",
        updatedAt: new Date().toISOString(),
      },
    ],
    ideas: [
      { id: "idea-x-article", title: "把一条推文扩展成长文章", summary: "保留原观点，再补上背景、论证与可以反复阅读的结构。", status: "growing", tags: ["X", "Writing"], updatedAt: new Date().toISOString() },
      { id: "idea-pet", title: "让 OllieOS 宠物更像伙伴", summary: "不只是装饰，而是能回应桌面状态和用户动作的小角色。", status: "seed", tags: ["OllieOS", "Interaction"], updatedAt: new Date().toISOString() },
      { id: "idea-audio", title: "把声音做成可浏览的作品", summary: "让音乐、波形、文字和当时的状态出现在同一个空间里。", status: "seed", tags: ["Music", "Archive"], updatedAt: new Date().toISOString() },
      { id: "idea-workflow", title: "AI 内容工作流实验", summary: "把选题、素材、草稿和发布拆成可以复用但仍保留判断的流程。", status: "growing", tags: ["AI", "Workflow"], updatedAt: new Date().toISOString() },
    ],
    tracks: [
      { id: "track-01", title: "2026.331", subtitle: "Ollie / Track 01", color: "#E84A5F", audioUrl: "/audio/track-01.mp3" },
      { id: "track-02", title: "3.27灰色头像 miX3", subtitle: "Ollie / Track 02", color: "#F4D758", audioUrl: "/audio/track-02.mp3" },
    ],
    weather: { mode: "auto" },
  };
}

export function gridPosition(index: number) {
  return { x: 18 + (index % 4) * 98, y: 48 + Math.floor(index / 4) * 104 };
}
