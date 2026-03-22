import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, Menu, X, Sun, Moon, ChevronDown, KeyRound, Hash, Binary, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TOOLS = [
  { name: 'Password Generator', path: '/tools/password-generator', icon: KeyRound, desc: 'Create strong random passwords' },
  { name: 'Hash Generator', path: '/tools/hash-generator', icon: Hash, desc: 'MD5, SHA-1, SHA-256, SHA-512' },
  { name: 'PIN Generator', path: '/tools/pin-generator', icon: Binary, desc: 'Generate secure numeric PINs' },
  { name: 'Password Checker', path: '/tools/password-checker', icon: ShieldCheck, desc: 'Analyze password strength' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [location] = useLocation();
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('spm_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setToolsOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('spm_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('spm_theme', 'light');
    }
  };

  const isToolsActive = location.startsWith('/tools');

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-colors">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                Safe<span className="text-primary">PasSword</span>maker
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location === '/' ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                Home
              </Link>

              {/* Tools dropdown */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsOpen(o => !o)}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isToolsActive ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  Tools
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", toolsOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {toolsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-1.5">
                        {TOOLS.map(tool => (
                          <Link
                            key={tool.path}
                            href={tool.path}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                              location === tool.path
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-foreground"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              location === tool.path ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
                            )}>
                              <tool.icon className={cn("w-4 h-4", location === tool.path ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                            </div>
                            <div>
                              <div className="text-sm font-medium leading-tight">{tool.name}</div>
                              <div className="text-xs text-muted-foreground">{tool.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/blog"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location.startsWith('/blog') ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                Blog
              </Link>
              <Link
                href="/faq"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location === '/faq' ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                FAQ
              </Link>
              <Link
                href="/about"
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  location === '/about' ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                About
              </Link>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link href="/tools/password-generator">
                <Button variant="neon" size="sm">Generate Password</Button>
              </Link>
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-3">
              <button onClick={toggleTheme} className="text-muted-foreground p-1.5">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground p-1.5"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-background/98 backdrop-blur-xl border-b border-border shadow-xl"
          >
            <div className="px-4 py-4 space-y-1">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Home</Link>

              <div>
                <button
                  onClick={() => setMobileToolsOpen(o => !o)}
                  className="w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  <span>Tools</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", mobileToolsOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {mobileToolsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 py-1 space-y-0.5">
                        {TOOLS.map(tool => (
                          <Link
                            key={tool.path}
                            href={tool.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <tool.icon className="w-4 h-4 text-primary shrink-0" />
                            {tool.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">Blog</Link>
              <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">FAQ</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">About</Link>

              <div className="pt-3 pb-1">
                <Link href="/tools/password-generator" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="neon" className="w-full">Generate Password</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-display font-bold text-base">SafePasSwordmaker</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                A complete client-side security toolkit. Generate, hash, and verify — all in your browser.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm text-foreground">Tools</h4>
              <ul className="space-y-2.5 text-sm">
                {TOOLS.map(t => (
                  <li key={t.path}><Link href={t.path} className="text-muted-foreground hover:text-primary transition-colors">{t.name}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm text-foreground">Resources</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm text-foreground">Legal</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground gap-2">
            <p>© {new Date().getFullYear()} SafePasSwordmaker. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-primary" /> 100% client-side · Zero knowledge · No tracking
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
