import React from 'react';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from 'lucide-react';
import { POSTS } from './Blog';
import { Card } from '@/components/ui/Card';

function renderMarkdown(text: string) {
  const lines = text.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold mt-10 mb-4 text-foreground">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-foreground">{line.slice(2)}</h1>);
    } else if (line.startsWith('| ')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines.filter(l => !l.match(/^\|[-| ]+\|$/));
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse border border-border rounded-lg overflow-hidden">
            {rows.map((row, ri) => {
              const cells = row.split('|').filter((_, ci) => ci > 0 && ci < row.split('|').length - 1);
              const Tag = ri === 0 ? 'th' : 'td';
              return (
                <tr key={ri} className={ri === 0 ? 'bg-primary/10' : ri % 2 === 0 ? 'bg-card/30' : ''}>
                  {cells.map((cell, ci) => (
                    <Tag key={ci} className="border border-border px-4 py-2 text-left">{cell.trim()}</Tag>
                  ))}
                </tr>
              );
            })}
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1.5 my-4 text-foreground/90 pl-2">
          {items.map((item, ii) => (
            <li key={ii} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      elements.push(
        <p key={i} className="text-foreground/85 leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
    i++;
  }
  return elements;
}

function formatInline(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const post = POSTS.find(p => p.slug === params.slug);

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
      {/* Hero image */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-${post.image}?w=1400&h=600&fit=crop&q=80`}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 pb-24">
        {/* Back link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium text-xs">
            <Tag className="w-3 h-3" /> {post.category}
          </span>
          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-12 text-foreground">
          {post.title}
        </h1>

        {/* Divider */}
        <div className="h-px bg-border mb-12" />

        {/* Content */}
        <div className="prose-lg">
          {renderMarkdown(post.content)}
        </div>

        {/* Divider */}
        <div className="h-px bg-border mt-16 mb-12" />

        {/* Next / Prev navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href={`/blog/${prevPost.slug}`}>
            <Card className="p-5 hover:border-primary/50 transition-all group cursor-pointer h-full">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><ArrowLeft className="w-3 h-3" /> Previous Article</p>
              <h4 className="font-semibold group-hover:text-primary transition-colors text-sm leading-snug">{prevPost.title}</h4>
            </Card>
          </Link>
          <Link href={`/blog/${nextPost.slug}`}>
            <Card className="p-5 hover:border-primary/50 transition-all group cursor-pointer text-right h-full">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 justify-end">Next Article <ArrowRight className="w-3 h-3" /></p>
              <h4 className="font-semibold group-hover:text-primary transition-colors text-sm leading-snug">{nextPost.title}</h4>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
