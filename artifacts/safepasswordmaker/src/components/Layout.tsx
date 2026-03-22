import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    const savedTheme = localStorage.getItem('spm_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tools', path: '/tools/password-generator' },
    { name: 'Blog', path: '/blog' },
    { name: 'FAQ', path: '/faq' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-primary/30 selection:text-primary">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                Safe<span className="text-primary">PasSword</span>maker
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location === link.path || (link.path !== '/' && location.startsWith(link.path))
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link href="/tools/password-generator">
                <Button variant="neon">Generate Password</Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-4">
              <button onClick={toggleTheme} className="text-muted-foreground">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-24 pb-6 px-4 flex flex-col"
          >
            <div className="flex flex-col gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-display font-semibold"
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-full h-px bg-border my-4" />
              <Link href="/tools/password-generator" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="neon" size="lg" className="w-full">Generate Password</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-xl">SafePasSwordmaker</span>
              </Link>
              <p className="text-muted-foreground text-sm">
                Your ultimate client-side security toolkit. Generate, hash, and check with zero-knowledge architecture.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/tools/password-generator" className="hover:text-primary">Password Generator</Link></li>
                <li><Link href="/tools/hash-generator" className="hover:text-primary">Hash Generator</Link></li>
                <li><Link href="/tools/pin-generator" className="hover:text-primary">PIN Generator</Link></li>
                <li><Link href="/tools/password-checker" className="hover:text-primary">Strength Checker</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SafePasSwordmaker. All rights reserved. Client-side only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
