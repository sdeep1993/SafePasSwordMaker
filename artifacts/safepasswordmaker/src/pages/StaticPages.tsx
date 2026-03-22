import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChevronDown, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 prose prose-invert prose-primary">
      <h1 className="text-center font-display mb-12">About SafePasSwordmaker</h1>
      <p className="text-xl text-center text-muted-foreground mb-16 leading-relaxed">
        We believe that digital security should be accessible, transparent, and completely private.
      </p>
      
      <div className="grid md:grid-cols-2 gap-12 not-prose mb-16">
        <Card className="p-8 bg-card/50 border-primary/20">
          <h3 className="text-2xl font-bold mb-4 text-primary">Our Mission</h3>
          <p className="text-muted-foreground">To equip every internet user with the tools needed to defend against modern cyber threats, without compromising their privacy in the process.</p>
        </Card>
        <Card className="p-8 bg-card/50 border-secondary/20">
          <h3 className="text-2xl font-bold mb-4 text-secondary">Zero-Knowledge Architecture</h3>
          <p className="text-muted-foreground">Our entire suite of tools is built to run entirely within your browser. We have no backend databases, no tracking pixels on generated data, and no way to see what you create.</p>
        </Card>
      </div>

      <h2>Why Client-Side Matters</h2>
      <p>Many online password generators actually send the generated password back to their servers. This creates a massive security vulnerability. If their server is compromised, or if they log traffic, your newly created "secure" password is already leaked.</p>
      <p>SafePasSwordmaker downloads the necessary cryptographic libraries to your browser once, and executes all logic locally. When you close the tab, everything is wiped.</p>
    </div>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground">Have a question or suggestion? Drop us a line.</p>
      </div>

      <Card className="p-8 border-white/10 shadow-2xl">
        {sent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground">Thanks for reaching out. We'll get back to you soon.</p>
            <Button className="mt-8" onClick={() => setSent(false)}>Send Another</Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" required placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea 
                required 
                className="w-full h-32 rounded-lg border border-input bg-input/50 p-4 focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder="How can we help?"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg">Send Message</Button>
          </form>
        )}
      </Card>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    { q: "Do you store my passwords?", a: "Absolutely not. This entire website operates client-side. The password generation happens directly in your device's browser memory. We have no backend databases that store your generated passwords." },
    { q: "What makes a password strong?", a: "A strong password is long (16+ characters), uses a mix of character types (uppercase, lowercase, numbers, symbols), and most importantly, is completely random and unpredictable." },
    { q: "How is crack time estimated?", a: "We calculate the mathematical entropy of your password based on its length and character set. We then assume an offline attacker capable of attempting 100 billion guesses per second to provide a worst-case scenario crack time." },
    { q: "What is a passphrase?", a: "A passphrase is a sequence of words (e.g., 'correct-horse-battery-staple'). They are often longer than traditional passwords, making them mathematically harder to crack, while remaining much easier for humans to remember." },
    { q: "Is the MD5 hash secure?", a: "No. MD5 is cryptographically broken and vulnerable to collision attacks. We provide an MD5 generator for legacy system compatibility only. For security purposes, always use SHA-256 or higher." }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-display font-bold text-center mb-12">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.q} answer={faq.a} />
        ))}
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="overflow-hidden border-white/5 bg-card/30">
      <button 
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-lg">{question}</span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-white/5">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 prose prose-invert">
      <h1 className="font-display">Privacy Policy</h1>
      <p className="lead">Last updated: Today</p>
      
      <h3>1. Zero Data Collection</h3>
      <p>SafePasSwordmaker does not collect, store, or transmit any data you input into our tools. All generation and hashing algorithms run entirely within your web browser using JavaScript and Web APIs.</p>
      
      <h3>2. Local Storage</h3>
      <p>We may use your browser's `localStorage` to save your theme preference (dark/light mode) and to temporarily store a history of your generated passwords if you choose to enable that feature. This data never leaves your device and can be cleared at any time via your browser settings or the "Clear History" button.</p>

      <h3>3. Analytics</h3>
      <p>We use basic, privacy-respecting analytics (like Plausible or basic server logs) to count page views. These do not track individual users, do not use cookies, and cannot see what you do with the tools.</p>
    </div>
  );
}

export function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 prose prose-invert">
      <h1 className="font-display">Terms of Service</h1>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing and using SafePasSwordmaker, you accept and agree to be bound by the terms and provision of this agreement.</p>
      
      <h3>2. Use of Service</h3>
      <p>Our tools are provided "as is" and "as available". While we utilize standard cryptographic libraries, we make no warranties regarding the absolute unbreakability of generated passwords. Security is a process, not a product.</p>

      <h3>3. Limitation of Liability</h3>
      <p>In no event shall SafePasSwordmaker or its creators be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses resulting from the use or the inability to use the service.</p>
    </div>
  );
}
