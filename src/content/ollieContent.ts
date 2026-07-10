export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  quote?: string;
};

export type Article = {
  slug: "ai-creator-system" | "music-as-memory";
  title: string;
  category: "AI" | "Music";
  eyebrow: string;
  excerpt: string;
  readingTime: string;
  date: string;
  tags: string[];
  accent: string;
  sections: ArticleSection[];
};

export type NowItem = {
  id: string;
  label: string;
  title: string;
  body: string;
  actionLabel: string;
  action: "signal" | "ai" | "music" | "links";
};

export type LabProject = {
  id: "prompt" | "content" | "signal" | "audio";
  title: string;
  status: "Prototype" | "Concept" | "Exploring";
  summary: string;
  detail: string;
  tags: string[];
};

export const CONTACTS = {
  x: { label: "@ool69loo", url: "https://x.com/ool69loo" },
  telegram: { label: "@ollie_ai", url: "https://t.me/ollie_ai" },
} as const;

export const ARTICLES: Article[] = [
  {
    slug: "ai-creator-system",
    title: "AI 不是外挂，而是一套新的创作系统",
    category: "AI",
    eyebrow: "SIGNAL 01 / AI",
    excerpt: "真正改变创作的，不是某一个模型突然变强，而是人开始重新安排判断、表达和执行之间的关系。",
    readingTime: "6 分钟",
    date: "2026-07-11",
    tags: ["AI", "创作系统", "工作流"],
    accent: "#2B7FD8",
    sections: [
      {
        heading: "从一个工具，变成一层工作环境",
        paragraphs: [
          "最开始使用 AI 时，我也把它看成一个更快的搜索框：问问题、拿答案、关掉页面。后来真正有用的部分，反而不是某一次回答有多惊艳，而是它开始进入选题、整理、写作、配图、代码和发布的每一步。它不再是一件临时拿出来的工具，而像是覆盖在工作之上的一层环境。",
          "当这层环境稳定下来，变化的不只是速度。过去很多想法会死在开始之前：资料太散、第一版太难写、技术门槛太高，或者只是懒得把脑子里的碎片整理成能被别人看懂的东西。现在阻力变小了，但这也意味着，真正稀缺的部分从执行转向了判断。",
        ],
      },
      {
        heading: "判断力不会被自动补齐",
        paragraphs: [
          "模型可以同时给出十个标题、五种结构和一整页语气漂亮的文字，可它不知道哪一句真正属于你。没有清晰的取舍，产量只会把模糊放大。看起来完成得更快，实际上只是更快地制造了可以被替代的内容。",
          "所以我越来越在意输入之前的那一步：这件事为什么值得说，我到底看见了什么，哪些部分宁愿写得慢一点也不能交给默认答案。AI 能替我展开路径，却不能替我决定要走向哪里。那条边界不是技术限制，而是创作者需要主动保留的位置。",
        ],
        quote: "AI 最有价值的地方，不是替你表达，而是把你的判断逼到台前。",
      },
      {
        heading: "工作流比提示词更重要",
        paragraphs: [
          "一条神奇提示词很容易被复制，一套理解自己工作方式的流程却很难。我的理想状态不是不停寻找新的咒语，而是让资料、观点、草稿和反馈形成循环：先收集信号，再提出问题；先生成粗糙版本，再用自己的标准删改；最后把成品沉淀成下一次可以复用的上下文。",
          "这个过程中，AI 可以承担重复劳动，也可以扮演反方、编辑和技术助手。但每个环节都要留下人工停顿：核实事实、辨认套话、判断情绪是否真实。系统不是为了把人拿掉，而是把人的精力留给最需要人的地方。",
        ],
      },
      {
        heading: "保留一个不会被优化掉的自己",
        paragraphs: [
          "效率很诱人，因为它能被数字直接证明。但创作里总有一些东西不该被压缩：偶然走神时出现的联系、没有明确用途的音乐片段、写完又删掉的句子，以及对某个问题长时间没有答案的状态。它们看起来低效，却往往决定一个人的作品为什么和别人不同。",
          "我想做的不是把自己训练成 AI 的操作员，而是建立一套能够持续表达、持续修正、也允许保留迟疑的个人系统。工具会换，平台会换，模型会换。最后留下来的，仍然应该是我如何观察，以及我愿意为什么停下来。",
        ],
      },
    ],
  },
  {
    slug: "music-as-memory",
    title: "为什么有些话，我只想写进旋律里",
    category: "Music",
    eyebrow: "SIGNAL 02 / MUSIC",
    excerpt: "语言要求人把事情解释清楚，音乐却允许记忆保持它原来的形状：模糊、重复、突然变亮，又慢慢沉下去。",
    readingTime: "6 分钟",
    date: "2026-07-11",
    tags: ["Music", "记忆", "表达"],
    accent: "#E84A5F",
    sections: [
      {
        heading: "语言总想把事情说清楚",
        paragraphs: [
          "写文字时，我们会本能地寻找因果：发生了什么、为什么难过、后来又怎样。可很多真实感受没有这么规整。它可能只是一段夜路、一种空气里的温度，或者一个已经记不清面孔的人。越努力解释，越像在替当时的自己编一个合理答案。",
          "音乐给了这些东西另一种容器。一个和弦可以悬着不解决，一段低频可以反复回来，旋律也可以说到一半就停下。它不要求证据，不要求结论，只要求那一刻的感觉在声音里成立。",
        ],
      },
      {
        heading: "记忆不是文件，而是一种频率",
        paragraphs: [
          "我很少把一首歌理解成完整故事。更多时候，它像一个可以重新进入的房间：鼓点决定脚步，空间感决定墙有多远，某个音色则像窗外一直没有关掉的灯。再次播放时，过去不会原样回来，但身体会先认出那个频率。",
          "这也是为什么一些不完整的 demo 对我仍然重要。它们不一定需要被包装成正式作品，甚至不一定需要别人听懂。声音保存的是当时做选择的方式：哪里突然加重，哪里故意留下空白，哪里明知道可以更整齐却没有修掉。",
        ],
        quote: "有些记忆不是用来讲述的，它只需要一个可以再次响起的入口。",
      },
      {
        heading: "不完美让声音拥有体温",
        paragraphs: [
          "软件可以让每个拍点都准确，让每个音量都平稳，也可以把人声修到几乎没有边缘。但我喜欢的部分经常来自偏差：稍微拖后的节奏、没有完全收住的尾音、混音里一块不够光滑的灰色。它们提醒我，声音不是从模板里自然长出来的，而是有人在某个时刻做过决定。",
          "这并不意味着拒绝技术。相反，技术越多，越需要知道什么时候停止。工具负责打开可能性，耳朵负责判断哪一种可能性还有呼吸。比起完美，我更愿意保留那些让我在几个月后重新听见时，仍然能认出自己的细节。",
        ],
      },
      {
        heading: "把没有说完的部分留下来",
        paragraphs: [
          "文字是我和外界交换观点的方式，音乐更像我和时间交换证据的方式。前者希望被理解，后者允许被误解。它们不是互相替代，而是在不同的时候替我保存不同的东西。",
          "所以我仍然会继续做声音，即使它暂时没有发布计划，也没有明确用途。不是因为每一段旋律都值得变成作品，而是因为有些话一旦被解释得太清楚，就不再像它最初发生时的样子。让它留在旋律里，反而更接近真实。",
        ],
      },
    ],
  },
];

export const NOW_ITEMS: NowItem[] = [
  { id: "watching", label: "正在看", title: "AI 如何重新分配创作注意力", body: "模型、工具和平台变化很快，真正值得观察的是人如何重新安排判断与表达。", actionLabel: "打开观察板", action: "signal" },
  { id: "making", label: "正在做", title: "把 OllieOS 变成可长期停留的空间", body: "让音乐、文章、工具实验和日常记录不再散落在不同平台。", actionLabel: "进入 AI 实验室", action: "ai" },
  { id: "listening", label: "正在听", title: "2026.331 / 3.27 灰色头像", body: "两段已经放进桌面播放器的声音，继续保留它们还没被解释完的部分。", actionLabel: "播放音乐", action: "music" },
  { id: "next", label: "下一步", title: "写下一篇文章，也做下一段声音", body: "不追求把日程塞满，只让值得留下来的东西多完成一点。", actionLabel: "联系 Ollie", action: "links" },
];

export const SHORT_SIGNALS = [
  { category: "Crypto", body: "观察叙事与情绪，但不把每一次波动都误认成答案。", accent: "#F4D758" },
  { category: "Digital Nomad", body: "平台和城市都可能变化，自己的坐标要能随身带走。", accent: "#6E7480" },
];

export const AI_LAB_PROJECTS: LabProject[] = [
  { id: "prompt", title: "Prompt Composer", status: "Prototype", summary: "用不同语气重组同一个想法。", detail: "不是生成更多文字，而是快速比较表达的力度、距离感和口语程度，再由人决定哪一种更像自己。", tags: ["Tone", "Writing", "Human edit"] },
  { id: "content", title: "Content Engine", status: "Concept", summary: "把信号变成可以发布的内容路径。", detail: "从观察、选题、大纲到成稿和发布，把重复动作交给流程，把事实核对和观点判断留给人。", tags: ["Workflow", "Outline", "Publish"] },
  { id: "signal", title: "Signal Synth", status: "Exploring", summary: "把不同领域的噪音压缩成少量信号。", detail: "它不假装预测趋势，只练习标记来源、时间和主观判断，让 AI、Crypto 与 Music 的观察更容易回看。", tags: ["AI", "Crypto", "Notes"] },
  { id: "audio", title: "Audio Lab", status: "Prototype", summary: "用视觉参数描述声音的空间与情绪。", detail: "通过密度、亮度、速度和空间四个维度改变波形，让没有音乐制作经验的人也能看见音色之间的差异。", tags: ["Audio", "Waveform", "Visual"] },
];

export function getArticle(slug: string) {
  return ARTICLES.find(article => article.slug === slug);
}

