import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const POSTS = [
  { title: "What Makes a Strong Password in 2024?", category: "Security", excerpt: "An in-depth look at entropy, passphrases, and why length beats complexity every time.", image: "1526374965328-7f61d4dc18c5" },
  { title: "Understanding SHA-256 Encryption", category: "Tech", excerpt: "How hashing algorithms secure the modern internet and cryptocurrency.", image: "1550751827438-b11fac37e290" },
  { title: "Why Password Managers Matter", category: "Tools", excerpt: "Stop memorizing 50 different weak passwords. Do this instead.", image: "1614064641983-42e128189c4e" },
  { title: "The Danger of Password Reuse", category: "Privacy", excerpt: "How one breached website can compromise your entire digital life.", image: "1510511459019-5efa7ae22baa" },
  { title: "How to Create a Secure Passphrase", category: "Guides", excerpt: "Correct horse battery staple: The math behind memorable security.", image: "1555949963-ff9fe0c870eb" },
  { title: "MD5 vs SHA: Which is More Secure?", category: "Tech", excerpt: "A historical look at hashing collisions and deprecations.", image: "1504639725590-34d0984388bd" }
];

export default function Blog() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Security Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Latest news, guides, and insights to keep you secure on the web.</p>
      </div>

      <div className="flex gap-2 justify-center mb-12 flex-wrap">
        {['All', 'Security', 'Privacy', 'Tools', 'Tech'].map(cat => (
          <Button key={cat} variant={cat === 'All' ? 'default' : 'outline'} size="sm" className="rounded-full">
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {POSTS.map((post, i) => (
          <Card key={i} className="overflow-hidden flex flex-col bg-card/50 hover:bg-card hover:border-primary/50 transition-all group cursor-pointer">
            {/* abstract tech unsplash images */}
            <div className="h-48 w-full bg-muted overflow-hidden relative">
               <img 
                 src={`https://images.unsplash.com/photo-${post.image}?w=600&h=400&fit=crop&q=80`} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 alt={post.title}
               />
               <div className="absolute top-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary">
                 {post.category}
               </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 flex-grow">{post.excerpt}</p>
              <div className="text-sm font-medium text-foreground group-hover:text-primary flex items-center">
                Read Article &rarr;
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
