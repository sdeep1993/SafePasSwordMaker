import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight, Twitter, Linkedin, Github, List, Share2, Link2 } from 'lucide-react';
import { POSTS } from './Blog';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/* ---------- helpers ---------- */

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type Heading = { id: string; text: string; level: number };

function extractHeadings(content: string): Heading[] {
  return content
    .split('\n')
    .filter(l => l.startsWith('## ') || l.startsWith('# '))
    .map(l => ({
      level: l.startsWith('## ') ? 2 : 1,
      text: l.replace(/^#+\s/, ''),
      id: slugify(l.replace(/^#+\s/, '')),
    }));
}

function formatInline(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
}

function renderMarkdown(text: string) {
  const lines = text.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      const headingText = line.slice(3);
      const id = slugify(headingText);
      elements.push(
        <h2
          key={i}
          id={id}
          className="text-2xl font-bold mt-12 mb-4 text-foreground scroll-mt-24 pt-1"
        >
          {headingText}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      const headingText = line.slice(2);
      const id = slugify(headingText);
      elements.push(
        <h1 key={i} id={id} className="text-3xl font-bold mt-8 mb-4 text-foreground scroll-mt-24">
          {headingText}
        </h1>
      );
    } else if (line.startsWith('| ')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-6 rounded-lg border border-border">
          <table className="w-full text-sm border-collapse">
            {rows.map((row, ri) => {
              const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
              const CellTag = ri === 0 ? 'th' : 'td';
              return (
                <tr key={ri} className={ri === 0 ? 'bg-primary/10' : ri % 2 === 0 ? 'bg-card/30' : ''}>
                  {cells.map((cell, ci) => (
                    <CellTag key={ci} className="border-b border-border px-4 py-2.5 text-left font-normal">{cell.trim()}</CellTag>
                  ))}
                </tr>
              );
            })}
          </table>
        </div>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-outside space-y-2 my-4 text-foreground/85 pl-5">
          {items.map((item, ii) => (
            <li key={ii} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-outside space-y-2 my-4 text-foreground/85 pl-5">
          {items.map((item, ii) => (
            <li key={ii} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === '') {
      // skip
    } else {
      elements.push(
        <p
          key={i}
          className="text-foreground/80 leading-relaxed my-4 text-[1.05rem]"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
    i++;
  }
  return elements;
}

/* ---------- Table of Contents ---------- */

function TableOfContents({ headings, activeId }: { headings: Heading[]; activeId: string }) {
  return (
    <nav aria-label="Table of contents">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Table of Contents
      </p>
      <ul className="space-y-1">
        {headings.map(h => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block text-sm py-1 pl-3 border-l-2 transition-all leading-snug",
                activeId === h.id
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                h.level === 2 ? "pl-3" : "pl-6 text-xs"
              )}
              onClick={e => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------- Author Card ---------- */

function AuthorCard({ author }: { author: NonNullable<(typeof POSTS)[0]['author']> }) {
  return (
    <Card className="p-5 bg-card/60 border-border">
      <div className="flex flex-col items-center text-center">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-border mb-3"
        />
        <h4 className="font-bold text-sm text-foreground">{author.name}</h4>
        <p className="text-xs text-primary font-medium mb-2">{author.role}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{author.bio}</p>
        <div className="flex items-center gap-3">
          <a href={author.twitter} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#1DA1F2] transition-colors" title="Twitter">
            <Twitter className="w-4 h-4" />
          </a>
          <a href={author.linkedin} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-[#0A66C2] transition-colors" title="LinkedIn">
            <Linkedin className="w-4 h-4" />
          </a>
          <a href={author.github} target="_blank" rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="GitHub">
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Share Card ---------- */

function ShareCard({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : '';
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-5 bg-card/60 border-border">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Share This Story
      </p>
      <div className="space-y-2">
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] text-muted-foreground transition-colors text-sm font-medium"
        >
          <Twitter className="w-4 h-4 shrink-0" />
          Share on Twitter
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] text-muted-foreground transition-colors text-sm font-medium"
        >
          <Linkedin className="w-4 h-4 shrink-0" />
          Share on LinkedIn
        </a>
        <button
          onClick={copy}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors text-sm font-medium"
        >
          <Link2 className="w-4 h-4 shrink-0" />
          {copied ? 'Link Copied!' : 'Copy Link'}
        </button>
      </div>
    </Card>
  );
}

/* ---------- Main component ---------- */

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = POSTS.find(p => p.slug === params.slug);
  const [activeId, setActiveId] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const headings = useMemo(() => post ? extractHeadings(post.content) : [], [post]);

  // Scroll-spy: track which heading is in view
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -70% 0%', threshold: 0 }
    );

    headings.forEach(h => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">This article doesn't exist or has been moved.</p>
        <Link href="/blog" className="text-primary hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  const postIndex = POSTS.indexOf(post);
  const nextPost = POSTS[(postIndex + 1) % POSTS.length];
  const prevPost = POSTS[(postIndex - 1 + POSTS.length) % POSTS.length];

  return (
    <div className="w-full">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-${post.image}?w=1400&h=600&fit=crop&q=80`}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-24">

        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Meta + title */}
        <div className="max-w-3xl mb-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-5">
            <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium text-xs">
              <Tag className="w-3 h-3" /> {post.category}
            </span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight text-foreground">
            {post.title}
          </h1>
        </div>

        {/* 3-column layout */}
        <div className="flex gap-10 items-start">

          {/* LEFT: Table of Contents */}
          <aside className="hidden xl:block w-52 shrink-0 sticky top-24 self-start">
            {headings.length > 0 && <TableOfContents headings={headings} activeId={activeId} />}
          </aside>

          {/* CENTER: Article content */}
          <article ref={contentRef} className="flex-1 min-w-0">
            <div className="h-px bg-border mb-10" />

            {/* Mobile TOC */}
            {headings.length > 0 && (
              <details className="xl:hidden mb-8 border border-border rounded-xl overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-medium bg-card/50 hover:bg-muted transition-colors select-none">
                  <List className="w-4 h-4 text-primary" />
                  Table of Contents
                </summary>
                <div className="px-4 py-4 bg-card/30">
                  <ul className="space-y-2">
                    {headings.map(h => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className={cn(
                            "block text-sm py-0.5 text-muted-foreground hover:text-primary transition-colors",
                            h.level === 2 ? "pl-0" : "pl-4"
                          )}
                          onClick={e => {
                            e.preventDefault();
                            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            )}

            {/* Article body */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {renderMarkdown(post.content)}
            </div>

            <div className="h-px bg-border mt-14 mb-10" />

            {/* Prev / Next */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Link href={`/blog/${prevPost.slug}`}>
                <Card className="p-5 hover:border-primary/50 transition-all group cursor-pointer h-full">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ArrowLeft className="w-3 h-3" /> Previous Article
                  </p>
                  <h4 className="font-semibold group-hover:text-primary transition-colors text-sm leading-snug">{prevPost.title}</h4>
                </Card>
              </Link>
              <Link href={`/blog/${nextPost.slug}`}>
                <Card className="p-5 hover:border-primary/50 transition-all group cursor-pointer text-right h-full">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 justify-end">
                    Next Article <ArrowRight className="w-3 h-3" />
                  </p>
                  <h4 className="font-semibold group-hover:text-primary transition-colors text-sm leading-snug">{nextPost.title}</h4>
                </Card>
              </Link>
            </div>
          </article>

          {/* RIGHT: Author + Share */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start space-y-4">
            {post.author && <AuthorCard author={post.author} />}
            <ShareCard title={post.title} slug={post.slug} />
          </aside>

        </div>

        {/* Mobile author + share (below content) */}
        <div className="lg:hidden mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {post.author && <AuthorCard author={post.author} />}
          <ShareCard title={post.title} slug={post.slug} />
        </div>

      </div>
    </div>
  );
}
