import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { generateHash } from '@/lib/crypto';
import { Copy, Trash2 } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type HashType = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

export default function HashGeneratorPage() {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<HashType>('SHA-256');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }
    generateHash(input, activeTab).then(setOutput);
  }, [input, activeTab]);

  const handleCopy = async () => {
    if (!output) return;
    await copyToClipboard(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: HashType[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Hash Generator</h1>
        <p className="text-xl text-muted-foreground">Calculate cryptographic hashes entirely in your browser.</p>
      </div>

      <Card className="p-6 md:p-8 border-primary/20 shadow-[0_0_50px_rgba(0,255,148,0.05)]">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-black/20 p-2 rounded-lg border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Input String</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-32 rounded-lg border border-input bg-input/50 p-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{activeTab} Hash Result</h3>
            <Button variant="ghost" size="sm" onClick={() => setInput('')} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Clear
            </Button>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl blur"></div>
            <div className="relative bg-background rounded-xl border border-white/10 p-4 min-h-[5rem] flex items-center justify-between break-all">
              <span className="font-mono text-lg text-secondary selection:bg-secondary/30 w-full pr-4">
                {output || <span className="text-muted-foreground/50 italic">Hash will appear here...</span>}
              </span>
              <Button 
                onClick={handleCopy} 
                disabled={!output}
                variant={copied ? 'default' : 'outline'}
                className={copied ? 'bg-green-500 hover:bg-green-600 border-transparent' : ''}
              >
                {copied ? 'Copied' : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
