import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Bitcoin,
  Bot,
  Brain,
  Feather,
  Gamepad2,
  Globe2,
  Mail,
  Music2,
  Radio,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import heroArt from './assets/hero.png'
import { blogPosts } from './content/blogPosts'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const keywords = ['AI', 'CRYPTO', 'MUSIC', '数字难民', '趋势洞察', '内容运营', '系统思维', '信息炼金', '独立创造']

const stats = [
  { icon: Users, value: '20K+', label: 'X Followers', note: '推特粉丝' },
  { icon: Feather, value: '每日更新', label: 'High Frequency Output', note: 'X 内容更新频率' },
  { icon: TrendingUp, value: '3+', label: 'Core Fields', note: 'AI / Crypto / Music' },
  { icon: Globe2, value: '全球视野', label: 'Global Signal', note: '连接信息，服务数字难民' },
  { icon: Radio, value: '多个社群', label: 'Community Network', note: '运营与共创，持续生长' },
  { icon: Zap, value: '持续实验', label: 'System Iteration', note: '永不停下' },
]

const strengths = [
  { icon: TrendingUp, title: '趋势洞察', desc: '快速捕捉市场与技术的变化，输出有价值的观点。' },
  { icon: Sparkles, title: '信息整合', desc: '从海量信息中提炼关键，建立自己的认知框架。' },
  { icon: Bitcoin, title: '交易思维', desc: '理解市场周期与人性，执行纪律与风控。' },
  { icon: Radio, title: '内容运营', desc: '高频输出优质内容，建立影响力与信任。' },
  { icon: Music2, title: '音乐表达', desc: '用音乐记录情绪、表达态度，连接同频的人。' },
  { icon: Globe2, title: '数字游民生活', desc: '在全球游牧，追求自由、成长与创造。' },
]

const projects = [
  {
    title: '趋势观察 & 信息炼金',
    type: 'AI / Crypto Signal',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85',
    desc: '在推特持续输出 AI、Crypto 与互联网趋势洞察。',
    tags: '趋势分析 / 信息整合 / 高频输出',
  },
  {
    title: 'Crypto 交易实验',
    type: 'Market System',
    image:
      'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=1200&q=85',
    desc: '专注市场结构与交易系统，执行纪律与风控。',
    tags: '市场分析 / 交易系统 / 风险管理',
  },
  {
    title: '音乐创作',
    type: 'Music & Emotion',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=85',
    desc: '用音乐表达情绪与态度，记录生活与思考。',
    tags: '音乐制作 / 歌曲创作 / 情绪表达',
  },
  {
    title: '数字游民生活',
    type: 'Nomad Notes',
    image:
      'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&w=1200&q=85',
    desc: '在全球游牧，探索世界，记录自由的生活方式。',
    tags: '旅行探索 / 生活方式 / 自由与成长',
  },
  {
    title: '工具与系统分享',
    type: 'AI Workflow',
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85',
    desc: '分享提升效率与认知的工具、方法与系统。',
    tags: '工具推荐 / 效率提升 / 系统思维',
  },
  {
    title: '社群 & 连接',
    type: 'Community',
    image:
      'https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=crop&w=1200&q=85',
    desc: '连接全球同频的人，共建价值与未来。',
    tags: '社群运营 / 价值连接 / 共创未来',
  },
]

const contactItems = [
  { icon: Radio, label: 'X / Twitter', value: '@ool69loo', href: 'https://x.com/ool69loo' },
  { icon: Send, label: 'Telegram', value: '私信获取', href: 'https://x.com/ool69loo' },
  { icon: Mail, label: 'Email', value: '私信请具体 X', href: 'https://x.com/ool69loo' },
  { icon: Gamepad2, label: 'Discord', value: '私信获取', href: 'https://x.com/ool69loo' },
]

const focusAreas = [
  { icon: Brain, label: 'AI', sub: '人工智能' },
  { icon: Bitcoin, label: 'Crypto', sub: '加密市场' },
  { icon: Music2, label: 'Music', sub: '音乐创作' },
  { icon: Globe2, label: 'Nomad', sub: '自由生活' },
]

const articleCategories = ['AI', 'Crypto', 'Music', 'Digital Nomad', 'Tools', 'Community']

const emptyPostForm = {
  id: '',
  slug: '',
  title: '',
  category: 'AI',
  excerpt: '',
  cover: '',
  body: '',
  sourceUrl: '',
  tags: '',
  status: 'draft',
}

function normalizePost(post) {
  if (!post) return null
  return {
    ...post,
    sourceUrl: post.sourceUrl || post.source_url || '',
    readTime: post.readTime || post.read_time || '3 min read',
    body: post.body || (post.paragraphs ? post.paragraphs.join('\n\n') : ''),
    tags: Array.isArray(post.tags) ? post.tags : String(post.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
  }
}

async function fetchJson(path, options) {
  const response = await fetch(path, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`)
  }
  return data
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function hasCover(post) {
  return Boolean(String(post?.cover || '').trim())
}

function linkifyText(text) {
  const parts = String(text || '').split(/(https?:\/\/[^\s]+)/g)

  return parts.map((part, index) => {
    if (!/^https?:\/\//.test(part)) return part
    return (
      <a href={part} target="_blank" rel="noreferrer" key={`${part}-${index}`}>
        {part}
      </a>
    )
  })
}

function MarkdownContent({ body }) {
  const blocks = String(body || '').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)

  return (
    <>
      {blocks.map((block) => {
        if (block.startsWith('### ')) return <h3 key={block}>{block.slice(4)}</h3>
        if (block.startsWith('## ')) return <h2 key={block}>{block.slice(3)}</h2>
        if (block.startsWith('# ')) return <h2 key={block}>{block.slice(2)}</h2>
        if (block.startsWith('- ')) {
          return (
            <ul key={block}>
              {block.split('\n').map((item, index) => (
                <li key={`${item}-${index}`}>{linkifyText(item.replace(/^- /, ''))}</li>
              ))}
            </ul>
          )
        }
        const numberedLines = block.split('\n')
        const isNumberedNote = numberedLines.length > 2 && numberedLines.some((line) => /^[0-9]+[️⃣.、)]\s*/.test(line.trim()))

        if (isNumberedNote) {
          return (
            <div className="article-note-block" key={block}>
              {numberedLines.map((line, index) => (
                <p key={`${line}-${index}`}>{linkifyText(line)}</p>
              ))}
            </div>
          )
        }

        return <p key={block}>{linkifyText(block)}</p>
      })}
    </>
  )
}

function MaskedLine({ children }) {
  return (
    <span className="mask-line">
      <span className="line-inner">{children}</span>
    </span>
  )
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="section-heading">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="section-title">
        <span className="title-line">{title}</span>
      </h2>
    </div>
  )
}

function SiteHeader({ variant = 'overlay' }) {
  return (
    <header className={`site-nav ${variant === 'static' ? 'site-nav-static' : ''}`}>
      <a className="nav-inner" href="/" aria-label="Ollie home">
        <span>Ollie</span>
        <BadgeCheck size={23} />
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        <a href="/#about">About</a>
        <a href="/#numbers">Numbers</a>
        <a href="/#projects">Projects</a>
        <a href="/blog">Blog</a>
        <a href="/#contact">Contact</a>
      </nav>
      <a className="contact-pill" href="https://x.com/ool69loo" target="_blank" rel="noreferrer">
        DM on X
        <ArrowUpRight size={18} />
      </a>
    </header>
  )
}

function BlogIndex() {
  const [posts, setPosts] = useState(blogPosts.map(normalizePost))

  useEffect(() => {
    fetchJson('/api/posts')
      .then((data) => {
        if (Array.isArray(data.posts)) setPosts(data.posts.map(normalizePost))
      })
      .catch(() => {
        setPosts(blogPosts.map(normalizePost))
      })
  }, [])

  return (
    <main className="blog-page">
      <SiteHeader variant="static" />
      <section className="blog-hero page-shell">
        <p className="section-eyebrow">Ollie Journal</p>
        <h1 className="blog-title">FIELD NOTES FROM X</h1>
        <p>
          把 X 上的短观点、长推和观察沉淀成可检索、可分享、可长期积累的文章。这里会持续整理 AI、Crypto、Music 与数字游民生活。
        </p>
      </section>

      <section className="blog-list page-shell" aria-label="Blog posts">
        {posts.map((post, index) => (
          <a className={`blog-card ${hasCover(post) ? 'blog-card-with-media' : 'blog-card-text'}`} href={`/blog/${post.slug}`} key={post.slug}>
            <span className="blog-index">0{index + 1}</span>
            {hasCover(post) ? (
              <div className="blog-card-media">
                <img src={post.cover} alt="" />
              </div>
            ) : null}
            <div className="blog-card-copy">
              <span>{post.kicker}</span>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <small>
                {post.date || post.publishedAt || post.published_at || 'Draft'} / {post.readTime}
              </small>
            </div>
          </a>
        ))}
      </section>
    </main>
  )
}

function BlogPost({ slug }) {
  const staticPost = normalizePost(blogPosts.find((item) => item.slug === slug))
  const [post, setPost] = useState(staticPost)
  const [loading, setLoading] = useState(!staticPost)

  useEffect(() => {
    setLoading(true)
    fetchJson(`/api/posts/${slug}`)
      .then((data) => {
        setPost(normalizePost(data.post))
      })
      .catch(() => {
        setPost(staticPost)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (!post) {
    return (
      <main className="blog-page">
        <SiteHeader variant="static" />
        <section className="blog-hero page-shell">
          <p className="section-eyebrow">404 / Not Found</p>
          <h1 className="blog-title">ARTICLE NOT FOUND</h1>
          <p>{loading ? '正在加载文章...' : '这篇文章还没有发布，或者链接已经变更。'}</p>
          <a className="inline-link" href="/blog">Back to Blog</a>
        </section>
      </main>
    )
  }

  return (
    <main className="blog-page">
      <SiteHeader variant="static" />
      <article className={`article-shell page-shell ${hasCover(post) ? 'article-with-cover' : 'article-no-cover'}`}>
        <div className="article-header">
          <a className="inline-link" href="/blog">Back to Blog</a>
          <p className="section-eyebrow">{post.kicker}</p>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="article-meta">
            <span>{post.date || post.publishedAt || post.published_at}</span>
            <span>{post.readTime}</span>
            <a href={post.sourceUrl || 'https://x.com/ool69loo'} target="_blank" rel="noreferrer">
              {post.source}
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        {hasCover(post) ? (
          <div className="article-cover">
            <img src={post.cover} alt="" />
          </div>
        ) : null}

        <div className="article-body">
          <MarkdownContent body={post.body} />
          <div className="article-tags">
            {post.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}

function HomePage() {
  const [siteSettings, setSiteSettings] = useState({})

  useEffect(() => {
    fetchJson('/api/site-settings')
      .then((data) => setSiteSettings(data.settings || {}))
      .catch(() => setSiteSettings({}))
  }, [])

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      gsap.set('.opening-panel', { autoAlpha: 0 })
      gsap.set('.line-inner, .motion-card, .section-eyebrow, .title-line, .media-reveal', {
        clearProps: 'all',
      })
      return undefined
    }

    const ctx = gsap.context(() => {
      gsap.set('body', { overflowX: 'hidden' })
      gsap.set('.hero-section .nav-inner, .hero-section .contact-pill, .hero-kicker, .hero-copy, .hero-meta, .hero-note', {
        autoAlpha: 0,
        y: 28,
      })
      gsap.set('.hero-title .line-inner', {
        yPercent: 112,
        scaleY: 0.64,
        rotateX: -28,
        transformOrigin: '50% 100%',
      })
      gsap.set('.hero-visual, .hero-stat', {
        autoAlpha: 0,
        clipPath: 'inset(26% 18% 20% 18%)',
        scale: 1.12,
      })

      const opening = gsap.timeline({ defaults: { ease: 'power4.out' } })
      opening
        .to('.opening-panel', {
          yPercent: -100,
          duration: 1.35,
          ease: 'expo.inOut',
          delay: 0.2,
        })
        .to('.hero-section .nav-inner, .hero-section .contact-pill', { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08 }, '-=0.45')
        .to('.hero-kicker', { autoAlpha: 1, y: 0, duration: 0.75 }, '-=0.5')
        .to(
          '.hero-title .line-inner',
          {
            yPercent: 0,
            scaleY: 1,
            rotateX: 0,
            duration: 1.45,
            stagger: 0.13,
            ease: 'expo.out',
          },
          '-=0.22',
        )
        .to('.hero-visual, .hero-stat', { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.2, stagger: 0.08 }, '-=1')
        .to('.hero-copy, .hero-meta, .hero-note', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, '-=0.72')

      gsap.to('.hero-video', {
        yPercent: 12,
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-section',
          start: 'top top',
          end: 'bottom top',
          scrub: 0.9,
        },
      })

      gsap.utils.toArray('.motion-section').forEach((section) => {
        const title = section.querySelector('.title-line')
        const eyebrow = section.querySelector('.section-eyebrow')
        const cards = section.querySelectorAll('.motion-card')
        const revealImages = section.querySelectorAll('.media-reveal')

        gsap.set([eyebrow, title], { autoAlpha: 0, x: -150, skewX: 7 })
        if (cards.length) {
          gsap.set(cards, { autoAlpha: 0, y: 82, scale: 0.96, clipPath: 'inset(18% 0% 0% 0%)' })
        }
        if (revealImages.length) {
          gsap.set(revealImages, { clipPath: 'inset(0% 100% 0% 0%)' })
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 74%',
            once: true,
          },
          defaults: { ease: 'power4.out' },
        })

        tl.to(eyebrow, { autoAlpha: 1, x: 0, skewX: 0, duration: 0.9 })
          .to(title, { autoAlpha: 1, x: 0, skewX: 0, duration: 1.1 }, '-=0.55')
        if (revealImages.length) {
          tl.to(revealImages, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.86, stagger: 0.04 }, '-=0.55')
        }
        if (cards.length) {
          tl.to(cards, { autoAlpha: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.82, stagger: 0.045 }, '-=0.7')
        }
      })

      gsap.utils.toArray('.parallax-img').forEach((img) => {
        gsap.to(img, {
          yPercent: -9,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.media-reveal') || img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        })
      })

      gsap.fromTo(
        '.final-title .line-inner',
        { yPercent: 110, scaleY: 0.72 },
        {
          yPercent: 0,
          scaleY: 1,
          duration: 1.35,
          stagger: 0.18,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.contact-section',
            start: 'top 62%',
            once: true,
          },
        },
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <main>
      <div className="opening-panel">
        <span>OLLIE</span>
        <span>AI / CRYPTO / MUSIC / NOMAD</span>
      </div>

      <section className="hero-section" id="top">
        {siteSettings.heroBackgroundUrl ? (
          <div
            className="hero-background-image"
            style={{ backgroundImage: `url(${siteSettings.heroBackgroundUrl})` }}
          />
        ) : null}
        <video
          className={`hero-video ${siteSettings.heroBackgroundUrl ? 'hero-video-muted' : ''}`}
          src="https://samplelib.com/preview/mp4/sample-5s.mp4"
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-scrim" />

        <SiteHeader />

        <div className="hero-content page-shell">
          <div className="hero-copy-block">
            <p className="hero-kicker">AI / CRYPTO / MUSIC / 数字难民</p>
            <h1 className="hero-title">
              <MaskedLine>OLLIE</MaskedLine>
            </h1>
            <p className="hero-copy">
              一名推特上的博主，在信息的洪流里搭建自己的系统，用 AI、Crypto 和音乐，寻找自由与秩序的边界。
            </p>
            <div className="hero-meta">
              {keywords.slice(0, 4).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="hero-dossier">
            <div className="hero-visual" aria-label="Ollie visual identity">
              <img src={heroArt} alt="Ollie visual identity" />
            </div>
            <div className="hero-note">
              <span>What people will remember</span>
              <p>独立思考、不随波逐流，在复杂信息中提炼有价值的信号。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="numbers-section motion-section page-shell" id="numbers">
        <SectionTitle eyebrow="By the Numbers" title="SIGNAL INDEX" />
        <div className="stats-grid">
          {stats.map(({ icon: Icon, value, label, note }) => (
            <article className="stat-item motion-card" key={label}>
              <Icon size={30} />
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
                <p>{note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section motion-section page-shell" id="about">
        <SectionTitle eyebrow="About Ollie" title="THE OPERATING SYSTEM" />
        <div className="about-grid">
          <div className="portrait-card motion-card">
            <div className="media-reveal portrait-media">
              <img
                className="parallax-img"
                src="https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85"
                alt="Dark city silhouette"
              />
            </div>
            <div className="portrait-badge">
              <BadgeCheck size={22} />
              X / @ool69loo
            </div>
          </div>

          <div className="about-copy motion-card">
            <p>
              Ollie，一名推特上的博主，长期观察并参与 AI、Crypto 与互联网文化的交汇。我相信：信息是这个时代最重要的资产。
            </p>
            <p>
              我在推特上分享趋势、观点、工具和思考，在市场和技术的剧烈波动中寻找模式与机会，同时用音乐表达情绪与态度，记录数字游民的生活方式。
            </p>
            <p>
              我不属于任何地方，也属于每一个地方。数字是我的语言，自由是我的追求，系统是我的武器。
            </p>
            <div className="memory-list">
              <span>What people will remember me for</span>
              <ul>
                <li>独立思考，不随波逐流</li>
                <li>在复杂的信息中，提炼出有价值的信号</li>
                <li>用系统思维做内容、做交易、做生活</li>
                <li>数字难民的生活方式实践者与分享者</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="strengths-section motion-section page-shell" id="strengths">
        <SectionTitle eyebrow="Core Strengths" title="CORE STRENGTHS" />
        <div className="strength-layout">
          <div className="strength-grid">
            {strengths.map(({ icon: Icon, title, desc }) => (
              <article className="strength-card motion-card" key={title}>
                <div className="strength-icon">
                  <Icon size={25} />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="strength-image motion-card">
            <div className="media-reveal">
              <img
                className="parallax-img"
                src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1400&q=85"
                alt="Dark skyline"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="projects-section motion-section page-shell" id="projects">
        <SectionTitle eyebrow="Featured Projects" title="FEATURED PROJECTS" />
        <div className="project-grid">
          {projects.map((project, index) => (
            <article className="project-card motion-card" key={project.title}>
              <div className="project-index">0{index + 1}</div>
              <div className="media-reveal project-media">
                <img className="parallax-img" src={project.image} alt={project.title} />
              </div>
              <div className="project-info">
                <span>{project.type}</span>
                <h3>{project.title}</h3>
                <p>{project.desc}</p>
                <small>{project.tags}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="page-shell contact-inner">
          <div className="contact-main">
            <p className="section-eyebrow">Contact / Philosophy</p>
            <h2 className="final-title">
              <MaskedLine>LET'S</MaskedLine>
              <MaskedLine>TALK.</MaskedLine>
            </h2>
            <p className="philosophy">信息自由，思想独立，数字游牧，创造价值。</p>
            <div className="contact-actions">
              <a href="https://x.com/ool69loo" target="_blank" rel="noreferrer">
                DM on X
                <ArrowUpRight size={20} />
              </a>
            </div>
          </div>

          <div className="contact-grid">
            <div className="contact-panel motion-card">
              <h3>Contact</h3>
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <a href={href} target="_blank" rel="noreferrer" key={label}>
                  <Icon size={23} />
                  <span>{value}</span>
                  <small>{label}</small>
                </a>
              ))}
            </div>

            <div className="contact-panel motion-card">
              <h3>Focus Areas</h3>
              <div className="focus-grid">
                {focusAreas.map(({ icon: Icon, label, sub }) => (
                  <div key={label}>
                    <Icon size={27} />
                    <strong>{label}</strong>
                    <span>{sub}</span>
                  </div>
                ))}
              </div>
              <h3>Content Style</h3>
              <p>趋势洞察 / 深度思考 / 工具分享 / 生活记录 / 音乐表达 / 真实 / 独立 / 自由 / 系统化 / 持续进化</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function AdminPage() {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loggedIn, setLoggedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [settings, setSettings] = useState({})
  const [posts, setPosts] = useState([])
  const [postForm, setPostForm] = useState(emptyPostForm)
  const [uploading, setUploading] = useState(false)
  const [xPostUrl, setXPostUrl] = useState('')
  const [xPostText, setXPostText] = useState('')
  const [importingXPost, setImportingXPost] = useState(false)

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => String(b.updatedAt || b.updated_at || '').localeCompare(String(a.updatedAt || a.updated_at || ''))),
    [posts],
  )

  const loadAdminData = async () => {
    const [settingsData, postsData] = await Promise.all([
      fetchJson('/api/site-settings'),
      fetchJson('/api/admin/posts'),
    ])
    setSettings(settingsData.settings || {})
    setPosts((postsData.posts || []).map(normalizePost))
  }

  useEffect(() => {
    loadAdminData()
      .then(() => setLoggedIn(true))
      .catch(() => setLoggedIn(false))
      .finally(() => setChecking(false))
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      })
      await loadAdminData()
      setLoggedIn(true)
    } catch (loginError) {
      setError(loginError.message)
    }
  }

  const handleLogout = async () => {
    await fetchJson('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setLoggedIn(false)
  }

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await fetchJson('/api/admin/uploads', {
        method: 'POST',
        body: formData,
      })
      setSettings((current) => ({ ...current, heroBackgroundUrl: data.url }))
      setMessage('图片上传成功，记得点击保存首页设置。')
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const saveSettings = async () => {
    setError('')
    try {
      const data = await fetchJson('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      setSettings(data.settings || settings)
      setMessage('首页设置已保存。')
    } catch (settingsError) {
      setError(settingsError.message)
    }
  }

  const importXPost = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setImportingXPost(true)

    try {
      const data = await fetchJson('/api/admin/import-x-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: xPostUrl, text: xPostText }),
      })
      const draft = data.postDraft || {}
      setPostForm({
        ...emptyPostForm,
        ...draft,
        tags: Array.isArray(draft.tags) ? draft.tags.join(', ') : draft.tags || '',
        status: 'draft',
      })
      setXPostUrl('')
      setXPostText('')
      setMessage('推文已填入文章表单，但还没有保存入库。检查正文后点击「创建文章」，需要前台显示就把状态改为「发布」。')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (importError) {
      setError(importError.message)
    } finally {
      setImportingXPost(false)
    }
  }

  const editPost = (post) => {
    setPostForm({
      id: post.id || '',
      slug: post.slug || '',
      title: post.title || '',
      category: post.category || 'AI',
      excerpt: post.excerpt || '',
      cover: post.cover || '',
      body: post.body || '',
      sourceUrl: post.sourceUrl || '',
      tags: (post.tags || []).join(', '),
      status: post.status || 'draft',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const savePost = async (event) => {
    event.preventDefault()
    setError('')
    const payload = {
      ...postForm,
      slug: postForm.slug || slugify(postForm.title),
      tags: postForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }

    try {
      const data = await fetchJson(postForm.id ? `/api/admin/posts/${postForm.id}` : '/api/admin/posts', {
        method: postForm.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setPostForm(emptyPostForm)
      setMessage(postForm.id ? '文章已更新。' : '文章已创建。')
      setPosts((current) => {
        const nextPost = normalizePost(data.post)
        const exists = current.some((post) => post.id === nextPost.id)
        return exists ? current.map((post) => (post.id === nextPost.id ? nextPost : post)) : [nextPost, ...current]
      })
    } catch (postError) {
      setError(postError.message)
    }
  }

  const deletePost = async (post) => {
    if (!window.confirm(`删除文章「${post.title}」？`)) return
    setError('')
    try {
      await fetchJson(`/api/admin/posts/${post.id}`, { method: 'DELETE' })
      setPosts((current) => current.filter((item) => item.id !== post.id))
      if (postForm.id === post.id) setPostForm(emptyPostForm)
      setMessage('文章已删除。')
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  if (checking) {
    return <main className="admin-page"><div className="admin-shell">正在检查登录状态...</div></main>
  }

  if (!loggedIn) {
    return (
      <main className="admin-page">
        <form className="admin-login" onSubmit={handleLogin}>
          <span>Ollie Admin</span>
          <h1>登录后台</h1>
          <label>
            账号
            <input value={loginForm.username} onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })} />
          </label>
          <label>
            密码
            <input type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} />
          </label>
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit">登录</button>
        </form>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <span>Ollie Admin</span>
            <h1>内容后台</h1>
          </div>
          <button type="button" onClick={handleLogout}>退出登录</button>
        </header>

        {message ? <p className="admin-message">{message}</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}

        <section className="admin-panel">
          <div>
            <h2>首页背景</h2>
            <p>上传 jpg、png 或 webp 图片，保存后首页会即时读取新背景。</p>
          </div>
          <div className="admin-upload-grid">
            <div className="admin-preview" style={{ backgroundImage: settings.heroBackgroundUrl ? `url(${settings.heroBackgroundUrl})` : undefined }}>
              {!settings.heroBackgroundUrl ? '暂无自定义背景' : null}
            </div>
            <div className="admin-fields">
              <label>
                背景图片 URL
                <input value={settings.heroBackgroundUrl || ''} onChange={(event) => setSettings({ ...settings, heroBackgroundUrl: event.target.value })} />
              </label>
              <label>
                上传图片
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} disabled={uploading} />
              </label>
              <button type="button" onClick={saveSettings}>保存首页设置</button>
            </div>
          </div>
        </section>

        <section className="admin-panel">
          <div>
            <h2>推文导入</h2>
            <p>粘贴一条 X 推文链接，系统会生成文章草稿，再由你编辑发布。</p>
          </div>
          <form className="admin-fields" onSubmit={importXPost}>
            <label>
              X / Twitter 链接
              <input
                placeholder="https://x.com/ool69loo/status/..."
                value={xPostUrl}
                onChange={(event) => setXPostUrl(event.target.value)}
              />
            </label>
            <label>
              展开全文，可选
              <textarea
                className="admin-import-text"
                placeholder="如果这条推文点开“更多”后还有内容，把完整正文复制到这里。留空则自动读取公开摘要。"
                value={xPostText}
                onChange={(event) => setXPostText(event.target.value)}
              />
            </label>
            <button type="submit" disabled={importingXPost || !xPostUrl.trim()}>
              {importingXPost ? '正在导入...' : '导入为草稿'}
            </button>
          </form>
        </section>

        <section className="admin-panel">
          <div>
            <h2>{postForm.id ? '编辑文章' : '新建文章'}</h2>
            <p>选择分类板块，状态设为「发布」后才会显示在博客前台。</p>
          </div>
          <form className="admin-post-form" onSubmit={savePost}>
            <label>
              标题
              <input value={postForm.title} onChange={(event) => setPostForm({ ...postForm, title: event.target.value, slug: postForm.slug || slugify(event.target.value) })} required />
            </label>
            <label>
              Slug
              <input value={postForm.slug} onChange={(event) => setPostForm({ ...postForm, slug: slugify(event.target.value) })} required />
            </label>
            <label>
              分类
              <select value={postForm.category} onChange={(event) => setPostForm({ ...postForm, category: event.target.value })}>
                {articleCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              状态
              <select value={postForm.status} onChange={(event) => setPostForm({ ...postForm, status: event.target.value })}>
                <option value="draft">草稿 - 仅后台可见</option>
                <option value="published">发布 - 前台可见</option>
              </select>
            </label>
            <label className="admin-wide">
              摘要
              <textarea value={postForm.excerpt} onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })} required />
            </label>
            <label>
              封面图 URL
              <input value={postForm.cover} onChange={(event) => setPostForm({ ...postForm, cover: event.target.value })} />
            </label>
            <label>
              来源链接
              <input value={postForm.sourceUrl} onChange={(event) => setPostForm({ ...postForm, sourceUrl: event.target.value })} />
            </label>
            <label className="admin-wide">
              标签，用英文逗号分隔
              <input value={postForm.tags} onChange={(event) => setPostForm({ ...postForm, tags: event.target.value })} />
            </label>
            <label className="admin-wide">
              正文 Markdown
              <textarea className="admin-body-editor" value={postForm.body} onChange={(event) => setPostForm({ ...postForm, body: event.target.value })} required />
            </label>
            <div className="admin-actions">
              <button type="submit">{postForm.id ? '保存文章' : '创建文章'}</button>
              <button type="button" onClick={() => setPostForm(emptyPostForm)}>清空表单</button>
            </div>
          </form>
        </section>

        <section className="admin-panel">
          <div>
            <h2>文章列表</h2>
            <p>当前共 {posts.length} 篇文章。</p>
          </div>
          <div className="admin-post-list">
            {sortedPosts.map((post) => (
              <article key={post.id || post.slug}>
                <div>
                  <span>{post.category} / {post.status === 'published' ? '已发布，前台可见' : '草稿，前台不可见'}</span>
                  <h3>{post.title}</h3>
                  <p>{post.slug}</p>
                </div>
                <div>
                  <button type="button" onClick={() => editPost(post)}>编辑</button>
                  <button type="button" onClick={() => deletePost(post)}>删除</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function App() {
  const path = window.location.pathname

  if (path === '/admin' || path === '/admin/') {
    return <AdminPage />
  }

  if (path === '/blog' || path === '/blog/') {
    return <BlogIndex />
  }

  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '').replace(/\/$/, '')
    return <BlogPost slug={slug} />
  }

  return <HomePage />
}

export default App
