import React from 'react';
import { Link } from 'wouter';
import { Shield, Lock, Fingerprint, Zap, FileText, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PasswordGenerator } from '@/components/PasswordGenerator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/cyber-hero.png`}
            alt="Cyber background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4" /> Client-side. Zero Knowledge. 100% Free.
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
              The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Password</span> Toolkit
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
              Generate unbreakable passwords, calculate hashes, and verify strength directly in your browser. No data ever leaves your device.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PasswordGenerator embed={true} />
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold">Why Trust SafePasSwordmaker?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: 'Zero Knowledge System', desc: 'We literally cannot see your passwords. Everything happens locally in your browser memory.' },
              { icon: Shield, title: 'No Storage, No Tracking', desc: 'No databases, no logs, no analytics on generated outputs. Your secrets remain yours.' },
              { icon: Zap, title: 'Instant Client-Side', desc: 'Lightning fast generation powered by modern Web Crypto APIs directly on your device.' }
            ].map((feature, i) => (
              <Card key={i} className="p-8 text-center hover:border-primary/50 transition-colors bg-background">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold mb-4">Complete Security Arsenal</h2>
              <p className="text-muted-foreground max-w-2xl">Everything you need to secure your digital life in one place.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Hash Generator', desc: 'Create MD5, SHA-1, SHA-256, and SHA-512 hashes instantly.', link: '/tools/hash-generator', icon: FileText },
              { title: 'PIN Generator', desc: 'Generate secure numeric PIN codes of any length.', link: '/tools/pin-generator', icon: Fingerprint },
              { title: 'Strength Checker', desc: 'Test how long it would take to crack your current password.', link: '/tools/password-checker', icon: ShieldCheck },
            ].map((tool, i) => (
              <Link href={tool.link} key={i}>
                <Card className="group h-full p-6 hover:shadow-[0_0_30px_rgba(0,255,148,0.1)] hover:border-primary/50 transition-all cursor-pointer bg-card/50">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                  <p className="text-muted-foreground mb-6">{tool.desc}</p>
                  <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
                    Open Tool <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="py-24 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-bold mb-4">Security Insights</h2>
            <p className="text-muted-foreground">Learn how to protect yourself online.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "What Makes a Strong Password in 2024?", date: "Oct 12, 2023" },
              { title: "Understanding SHA-256 Encryption", date: "Nov 05, 2023" },
              { title: "Why Password Managers Matter", date: "Dec 01, 2023" }
            ].map((post, i) => (
              <Link href="/blog" key={i}>
                <Card className="overflow-hidden hover:border-primary/30 transition-colors bg-background h-full group">
                  {/* landing page tech abstract pattern image */}
                  <div className="h-48 w-full bg-muted relative overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop&q=80`} 
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity"
                      alt="Tech abstract"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-xs text-primary font-medium mb-2 block">{post.date}</span>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-muted-foreground text-sm">Discover the core principles of modern digital security and how to apply them.</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-display font-bold mb-6">Never Use a Weak Password Again</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of users who secure their digital identity with our tools.
          </p>
          <Link href="/tools/password-generator">
            <Button variant="neon" size="lg" className="text-lg px-12 h-16 rounded-full">
              Generate Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// Simple Framer Motion wrapper setup since we're writing everything in one go
import { motion as _motion } from 'framer-motion';
const motion = _motion;
