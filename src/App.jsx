import { useLayoutEffect } from 'react'
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

function App() {
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
      gsap.set('.nav-inner, .contact-pill, .hero-kicker, .hero-copy, .hero-meta, .hero-note', {
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
      gsap.set('.hero-mark', { scale: 0.5, autoAlpha: 0, rotate: -10 })

      const opening = gsap.timeline({ defaults: { ease: 'power4.out' } })
      opening
        .to('.opening-panel', {
          yPercent: -100,
          duration: 1.35,
          ease: 'expo.inOut',
          delay: 0.2,
        })
        .to('.nav-inner, .contact-pill', { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08 }, '-=0.45')
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
        .to('.hero-mark', { scale: 1, autoAlpha: 1, rotate: 0, duration: 1.1 }, '-=0.95')
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
        <video
          className="hero-video"
          src="https://samplelib.com/preview/mp4/sample-5s.mp4"
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="hero-scrim" />

        <header className="site-nav">
          <a className="nav-inner" href="#top" aria-label="Ollie home">
            <span>Ollie</span>
            <BadgeCheck size={23} />
          </a>
          <nav className="nav-links" aria-label="Primary navigation">
            <a href="#about">About</a>
            <a href="#numbers">Numbers</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="contact-pill" href="https://x.com/ool69loo" target="_blank" rel="noreferrer">
            DM on X
            <ArrowUpRight size={18} />
          </a>
        </header>

        <div className="hero-content page-shell">
          <div className="hero-copy-block">
            <p className="hero-kicker">AI / CRYPTO / MUSIC / 数字难民</p>
            <h1 className="hero-title">
              <MaskedLine>OLLIE</MaskedLine>
              <MaskedLine>INFORMATION</MaskedLine>
              <MaskedLine>ALCHEMIST</MaskedLine>
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
              <div className="hero-mark" />
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
              <MaskedLine>INFORMATION</MaskedLine>
              <MaskedLine>FREEDOM.</MaskedLine>
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

export default App
