import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generatePin } from '@/lib/password';
import { Copy, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

export default function PinGeneratorPage() {
  const [length, setLength] = useState(6);
  const [pin, setPin] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setPin(generatePin(length));
  };

  useEffect(() => {
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  const handleCopy = async () => {
    await copyToClipboard(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Secure PIN Generator</h1>
        <p className="text-xl text-muted-foreground">Generate cryptographically secure numeric codes.</p>
      </div>

      <Card className="p-8 text-center bg-card/80 backdrop-blur border-white/10 shadow-2xl">
        <div className="mb-12">
          <label className="block text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">PIN Length: {length}</label>
          <input
            type="range"
            min="4"
            max="20"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full max-w-md mx-auto"
          />
          <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-muted-foreground">
            <span>4</span>
            <span>20</span>
          </div>
        </div>

        <div className="text-6xl md:text-8xl font-mono font-bold text-primary tracking-widest mb-12 bg-black/30 py-8 rounded-2xl border border-primary/20">
          {pin}
        </div>

        <div className="flex justify-center gap-4">
          <Button size="lg" variant="outline" onClick={handleGenerate} className="w-32 h-14">
            <RefreshCw className="w-5 h-5 mr-2" /> New
          </Button>
          <Button size="lg" variant="neon" onClick={handleCopy} className={`w-40 h-14 ${copied ? 'bg-primary text-background' : ''}`}>
            {copied ? 'Copied!' : <><Copy className="w-5 h-5 mr-2" /> Copy PIN</>}
          </Button>
        </div>
      </Card>
    </div>
  );
}
