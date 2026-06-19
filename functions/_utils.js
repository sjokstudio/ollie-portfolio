const SESSION_COOKIE = 'ollie_admin_session'
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const seedPosts = [
  {
    slug: 'ai-tools-are-new-operating-systems',
    title: 'AI 工具正在变成新的个人操作系统',
    category: 'AI',
    excerpt: '真正重要的不是用了多少 AI 工具，而是你有没有把它们接进自己的信息流、创作流和决策流。',
    cover: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=85',
    body:
      '很多人把 AI 当成一个更聪明的搜索框，但我更愿意把它看成个人操作系统的外接层。它不是替你思考，而是把重复、整理、拆解和组合这些环节变得更轻。\n\n当一个创作者开始稳定地用 AI 处理资料、生成初稿、复盘内容、整理工具链，真正变化的不是产量，而是思考的回路。你会更快看到信息之间的关系，也更快发现自己的判断盲区。\n\n所以我关心的不是某个工具今天是否最强，而是它能不能进入系统。能进入系统的工具，会留下复利；只停留在新鲜感里的工具，很快就会被下一波热点冲走。',
    sourceUrl: 'https://x.com/ool69loo',
    tags: ['AI', 'Workflow', 'Creator'],
  },
  {
    slug: 'crypto-is-a-narrative-market',
    title: 'Crypto 不只是市场，更是叙事机器',
    category: 'Crypto',
    excerpt: '价格是结果，叙事是燃料。理解 Crypto，要同时看资金、技术、社区和故事如何互相放大。',
    cover: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1600&q=85',
    body:
      'Crypto 的有趣之处在于，它不像传统市场那样只由财务数据驱动。它更像一个由技术、流动性、社群情绪和共同想象组成的高波动叙事机器。\n\n一个叙事能不能跑出来，取决于它是否足够简单、足够有传播性，并且能不能被一群人反复转述。市场会奖励早期理解叙事结构的人，也会惩罚只追逐口号的人。\n\n我的观察方式是把市场当成信息系统：谁在说，为什么现在说，说给谁听，资金是否跟上，社区是否愿意继续扩散。答案通常藏在这些交叉点里。',
    sourceUrl: 'https://x.com/ool69loo',
    tags: ['Crypto', 'Market', 'Narrative'],
  },
  {
    slug: 'digital-nomad-needs-a-system',
    title: '数字游民不是逃离，而是重建系统',
    category: 'Digital Nomad',
    excerpt: '自由不是没有结构。真正可持续的数字游民生活，需要一套能移动、能复盘、能持续创造的系统。',
    cover: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=1600&q=85',
    body:
      '很多人把数字游民想象成一种永远在路上的浪漫生活。但真实情况是，如果没有稳定的信息系统、工作节奏和能量管理，自由很快会变成混乱。\n\n我更喜欢把数字游民理解成一种系统迁移能力：换城市、换语言、换时区，但你的创作、学习、交易和连接能力不能断。\n\n所谓自由，不是摆脱所有秩序，而是亲手设计自己的秩序。',
    sourceUrl: 'https://x.com/ool69loo',
    tags: ['Nomad', 'Life', 'System'],
  },
]

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  })
}

export function error(message, status = 400) {
  return json({ error: message }, status)
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return {}
  }
}

function textEncoder() {
  return new TextEncoder()
}

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : textEncoder().encode(value)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder().encode(value))
  return base64UrlEncode(new Uint8Array(signature))
}

export async function createSession(username, secret) {
  const payload = base64UrlEncode(JSON.stringify({
    username,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  }))
  return `${payload}.${await sign(payload, secret)}`
}

export async function verifySession(request, secret) {
  const cookieHeader = request.headers.get('Cookie') || ''
  const cookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${SESSION_COOKIE}=`))

  if (!cookie) return null
  const token = cookie.slice(SESSION_COOKIE.length + 1)
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  if ((await sign(payload, secret)) !== signature) return null

  try {
    const decoded = new TextDecoder().decode(base64UrlDecode(payload))
    const session = JSON.parse(decoded)
    if (!session.exp || session.exp < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

export async function requireAdmin(context) {
  const secret = context.env.SESSION_SECRET
  if (!secret) return null
  return verifySession(context.request, secret)
}

export async function ensureSchema(db) {
  if (!db) throw new Error('Missing D1 binding: DB')

  await db.prepare(
    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run()

  await db.prepare(
    `CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      cover TEXT,
      body TEXT NOT NULL,
      source_url TEXT,
      tags TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      published_at TEXT
    )`,
  ).run()

  const count = await db.prepare('SELECT COUNT(*) AS count FROM posts').first()
  if (count?.count === 0) {
    const now = new Date().toISOString()
    await db.batch(seedPosts.map((post) => db.prepare(`
      INSERT INTO posts (
        id, slug, title, category, excerpt, cover, body, source_url, tags,
        status, created_at, updated_at, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      post.slug,
      post.title,
      post.category,
      post.excerpt,
      post.cover,
      post.body,
      post.sourceUrl,
      JSON.stringify(post.tags),
      now,
      now,
      now,
    )))
  }
}

export function postFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    kicker: row.category,
    excerpt: row.excerpt,
    cover: row.cover || '',
    body: row.body,
    sourceUrl: row.source_url || '',
    source: row.source_url ? 'Source' : 'Ollie Journal',
    tags: JSON.parse(row.tags || '[]'),
    status: row.status,
    date: (row.published_at || row.created_at || '').slice(0, 10),
    readTime: `${Math.max(1, Math.ceil((row.body || '').length / 600))} min read`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }
}

export function normalizePostInput(input) {
  const title = String(input.title || '').trim()
  const slug = String(input.slug || '').trim().toLowerCase()
  const category = String(input.category || 'AI').trim()
  const excerpt = String(input.excerpt || '').trim()
  const body = String(input.body || '').trim()
  const status = input.status === 'published' ? 'published' : 'draft'
  const tags = Array.isArray(input.tags)
    ? input.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : String(input.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean)

  if (!title) throw new Error('Title is required')
  if (!slug || !/^[a-z0-9\u4e00-\u9fa5-]+$/.test(slug)) throw new Error('Slug is invalid')
  if (!excerpt) throw new Error('Excerpt is required')
  if (!body) throw new Error('Body is required')

  return {
    title,
    slug,
    category,
    excerpt,
    body,
    status,
    cover: String(input.cover || '').trim(),
    sourceUrl: String(input.sourceUrl || input.source_url || '').trim(),
    tags,
  }
}

export function validateImage(file) {
  if (!file) throw new Error('Image file is required')
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Only jpg, png, and webp images are supported')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image must be smaller than 5MB')
  }
}
