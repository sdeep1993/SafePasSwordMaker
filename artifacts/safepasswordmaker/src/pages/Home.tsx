import React from 'react';
import { Link } from 'wouter';
import { Shield, Lock, Fingerprint, Zap, FileText, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Hash, Binary, BookOpen, ChevronRight } from 'lucide-react';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion as _motion } from 'framer-motion';
const motion = _motion;

const TOOLS = [
  { title: 'Password Generator', desc: 'Create cryptographically random passwords with full entropy control. Choose length, character sets, and mode.', link: '/tools/password-generator', icon: KeyRound, badge: 'Most Popular' },
  { title: 'Hash Generator', desc: 'Instantly compute MD5, SHA-1, SHA-256, and SHA-512 hashes for any text — all in your browser.', link: '/tools/hash-generator', icon: Hash, badge: null },
  { title: 'PIN Generator', desc: 'Generate secure numeric PIN codes from 4 to 20 digits for devices, accounts, and authentication.', link: '/tools/pin-generator', icon: Binary, badge: null },
  { title: 'Password Checker', desc: 'Analyze any password for strength, entropy, and crack time. Get actionable improvement tips.', link: '/tools/password-checker', icon: ShieldCheck, badge: null },
];

const BLOG_PREVIEW = [
  { slug: 'what-makes-a-strong-password', title: "What Makes a Strong Password in 2024?", date: "Oct 12, 2024", category: "Security", excerpt: "An in-depth look at entropy, passphrases, and why length beats complexity every time." },
  { slug: 'understanding-sha-256', title: "Understanding SHA-256 Encryption", date: "Nov 05, 2024", category: "Tech", excerpt: "How hashing algorithms secure the modern internet and cryptocurrency." },
  { slug: 'why-password-managers-matter', title: "Why Password Managers Matter", date: "Dec 01, 2024", category: "Tools", excerpt: "Stop memorizing 50 different weak passwords. Do this instead." },
];

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/cyber-hero.png`}
            alt="Cyber background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
              <Shield className="w-3.5 h-3.5" /> Client-side · Zero Knowledge · 100% Free
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-5 leading-tight">
              The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Password</span> Toolkit
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate unbreakable passwords, calculate hashes, and verify strength — directly in your browser. No data ever leaves your device.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <PasswordGenerator embed={true} />
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-card/40 py-5">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          {[
            { icon: Lock, title: 'Zero Knowledge', desc: 'Your passwords never leave your device.' },
            { icon: Shield, title: 'No Storage', desc: 'No databases, no logs, no tracking on outputs.' },
            { icon: Zap, title: 'Instant & Offline', desc: 'Powered by Web Crypto APIs in your browser.' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl font-display font-bold mb-2">Security Tools</h2>
            <p className="text-muted-foreground">Everything you need to secure your digital life, all in one place.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOOLS.map((tool, i) => (
              <Link href={tool.link} key={i}>
                <Card className="group h-full p-5 hover:border-primary/50 hover:shadow-[0_0_24px_rgba(0,255,148,0.07)] transition-all cursor-pointer bg-card/60 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      <tool.icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">{tool.badge}</span>
                    )}
                  </div>
                  <h3 className="font-bold mb-1.5 text-base">{tool.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow leading-relaxed">{tool.desc}</p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Open Tool <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-2">How It Works</h2>
            <p className="text-muted-foreground">No sign-up. No installation. Just open and use.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: KeyRound, title: 'Choose Your Tool', desc: 'Pick from password generator, hash tools, PIN generator, or strength checker. All available instantly.' },
              { step: '02', icon: Zap, title: 'Generate in Your Browser', desc: 'All cryptographic operations run locally using the Web Crypto API. Your inputs never touch a server.' },
              { step: '03', icon: CheckCircle2, title: 'Copy & Use Securely', desc: 'Copy your output with one click. Check history, export results, and repeat — all without signing up.' },
            ].map((step, i) => (
              <div key={i} className="flex gap-5">
                <div className="shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-bold font-mono">
                    {step.step}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold mb-1">Security Insights</h2>
              <p className="text-muted-foreground text-sm">Learn how to protect yourself online.</p>
            </div>
            <Link href="/blog" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium shrink-0">
              All Articles <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_PREVIEW.map((post, i) => (
              <Link href={`/blog/${post.slug}`} key={i}>
                <Card className="overflow-hidden hover:border-primary/40 transition-all bg-card/60 group h-full flex flex-col">
                  <div className="h-40 w-full bg-muted relative overflow-hidden shrink-0">
                    <img
                      src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop&q=80`}
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                      alt="Tech abstract"
                    />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur px-2.5 py-0.5 rounded-full text-xs font-semibold text-primary">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-xs text-muted-foreground mb-2 block">{post.date}</span>
                    <h3 className="text-base font-bold mb-2 group-hover:text-primary transition-colors leading-snug flex-grow">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Article <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card/40 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Never Use a Weak Password Again</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Strong, unique passwords for every account. Generated instantly in your browser, never stored anywhere. Start securing your digital life today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tools/password-generator">
              <Button variant="neon" size="lg" className="px-8">
                Generate a Password
              </Button>
            </Link>
            <Link href="/tools/hash-generator">
              <Button variant="outline" size="lg" className="px-8">
                Try Hash Generator
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
