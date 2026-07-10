import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ThemeCycleButton } from "@/components/theme/ThemeCycleButton";
import { ARTICLES, CONTACTS, getArticle } from "@/content/ollieContent";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | Ollie.`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = ARTICLES.find(item => item.slug !== article.slug)!;

  return (
    <div className="ollie-article-shell">
      <nav className="ollie-article-nav" aria-label="文章导航">
        <Link href="/?desktop=1#home" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--ollie-text)", textDecoration: "none", fontWeight: 700 }}>
          <ArrowLeft size={18} /> OllieOS
        </Link>
        <ThemeCycleButton />
      </nav>

      <main className="ollie-article-main">
        <article className="ollie-article-paper">
          <header style={{ borderTop: `5px solid ${article.accent}`, paddingTop: 24 }}>
            <div style={{ fontFamily: "var(--font-fira-code)", fontSize: 12, color: article.accent, letterSpacing: "0.12em" }}>{article.eyebrow}</div>
            <h1 className="ollie-article-title">{article.title}</h1>
            <p className="ollie-article-lead">{article.excerpt}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", paddingBottom: 36, marginBottom: 48, borderBottom: "1px solid var(--ollie-border)", color: "var(--ollie-muted)", fontSize: 13 }}>
              <span>{article.date.replaceAll("-", ".")}</span><span>·</span><span>{article.readingTime}</span>
              {article.tags.map(tag => <span key={tag} style={{ padding: "4px 9px", borderRadius: 999, background: "var(--ollie-surface-soft)", color: "var(--ollie-text-soft)" }}>#{tag}</span>)}
            </div>
          </header>

          {article.sections.map(section => (
            <section className="ollie-article-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              {section.quote && <blockquote className="ollie-article-quote">{section.quote}</blockquote>}
            </section>
          ))}

          <footer style={{ maxWidth: 700, margin: "64px auto 0", paddingTop: 28, borderTop: "1px solid var(--ollie-border)" }}>
            <div style={{ fontFamily: "var(--font-fira-code)", color: "var(--ollie-muted)", fontSize: 11, letterSpacing: "0.08em" }}>CONTINUE THE SIGNAL</div>
            <Link href={`/articles/${related.slug}`} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 12, padding: "18px 20px", border: "1px solid var(--ollie-border)", borderRadius: 14, background: "var(--ollie-surface)", color: "var(--ollie-text)", textDecoration: "none" }}>
              <span><small style={{ display: "block", color: "var(--ollie-muted)", marginBottom: 5 }}>{related.category}</small><strong>{related.title}</strong></span>
              <ArrowUpRight size={20} />
            </Link>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
              <a href={CONTACTS.x.url} target="_blank" rel="noreferrer" style={{ color: "var(--ollie-text)", textDecoration: "none", padding: "9px 13px", borderRadius: 10, border: "1px solid var(--ollie-border)" }}>X {CONTACTS.x.label}</a>
              <a href={CONTACTS.telegram.url} target="_blank" rel="noreferrer" style={{ color: "#fff", textDecoration: "none", padding: "9px 13px", borderRadius: 10, background: "#2B7FD8" }}>Telegram {CONTACTS.telegram.label}</a>
            </div>
          </footer>
        </article>
      </main>
    </div>
  );
}

