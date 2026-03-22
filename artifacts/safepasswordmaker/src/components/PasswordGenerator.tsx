import React, { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Settings2, ShieldCheck, History } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Checkbox } from './ui/Checkbox';
import { Card } from './ui/Card';
import { generatePassword, analyzePassword, GeneratorOptions, PasswordAnalysis } from '@/lib/password';
import { copyToClipboard } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function PasswordGenerator({ embed = false }: { embed?: boolean }) {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  
  const [options, setOptions] = useState<GeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
    mode: 'random'
  });

  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('spm_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = useCallback(() => {
    const newPwd = generatePassword(options);
    setPassword(newPwd);
    setAnalysis(analyzePassword(newPwd));
  }, [options]);

  // Regenerate when options change
  useEffect(() => {
    handleGenerate();
  }, [options, handleGenerate]);

  const handleCopy = async (text: string = password) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Add to history
    if (text === password && !history.includes(password)) {
      const newHistory = [password, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('spm_history', JSON.stringify(newHistory));
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('spm_history');
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${embed ? '' : 'p-4'}`}>
      <Card className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        {/* Glow effect behind */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          
          {/* Output Display */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-xl blur opacity-25"></div>
            <div className="relative flex items-center bg-background rounded-xl border border-white/10 p-2 sm:p-4 shadow-inner">
              <input
                type="text"
                value={password}
                readOnly
                className="w-full bg-transparent text-2xl sm:text-4xl font-mono text-center text-foreground outline-none selection:bg-primary/30"
              />
              <div className="flex gap-2 ml-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleGenerate}
                  className="hover:bg-primary/20 text-muted-foreground hover:text-primary"
                  title="Regenerate"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => handleCopy()} 
                  className={`w-24 transition-all ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary hover:bg-primary/80 text-primary-foreground'}`}
                >
                  {copied ? 'Copied!' : <><Copy className="w-4 h-4 mr-2" /> Copy</>}
                </Button>
              </div>
            </div>
          </div>

          {/* Analysis Bar */}
          {analysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-card/50 rounded-lg p-4 border border-border flex flex-col justify-center">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Strength</span>
                  <span className={`text-sm font-bold ${
                    analysis.score > 80 ? 'text-primary' : 
                    analysis.score > 60 ? 'text-green-400' : 
                    analysis.score > 40 ? 'text-yellow-400' : 'text-red-500'
                  }`}>
                    {analysis.label}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.score}%` }}
                    className={`h-full ${analysis.color} transition-colors duration-500`}
                  />
                </div>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-border flex flex-col justify-center items-center text-center">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Crack Time</span>
                <span className="text-lg font-bold font-mono text-secondary">{analysis.crackTimeDisplay}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Col: Length & Mode */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" /> Password Length
                  </label>
                  <span className="text-2xl font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-md">
                    {options.length}
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="64"
                  value={options.length}
                  onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold block">Generation Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['random', 'memorable', 'passphrase'] as const).map(m => (
                    <Button
                      key={m}
                      variant={options.mode === m ? 'default' : 'outline'}
                      onClick={() => setOptions({ ...options, mode: m })}
                      className="capitalize text-xs sm:text-sm"
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Toggles */}
            <div className="bg-black/20 rounded-xl p-6 border border-white/5">
              <h4 className="text-sm font-semibold mb-4 text-muted-foreground">Character Types</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 cursor-pointer ${options.mode !== 'random' && options.mode !== 'memorable' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Checkbox 
                    checked={options.uppercase} 
                    onCheckedChange={(c) => setOptions({...options, uppercase: c})}
                    disabled={options.mode === 'passphrase'}
                  />
                  <span>Uppercase <span className="text-muted-foreground text-xs">(A-Z)</span></span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer ${options.mode !== 'random' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Checkbox 
                    checked={options.lowercase} 
                    onCheckedChange={(c) => setOptions({...options, lowercase: c})}
                    disabled={options.mode !== 'random'}
                  />
                  <span>Lowercase <span className="text-muted-foreground text-xs">(a-z)</span></span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox 
                    checked={options.numbers} 
                    onCheckedChange={(c) => setOptions({...options, numbers: c})}
                  />
                  <span>Numbers <span className="text-muted-foreground text-xs">(0-9)</span></span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox 
                    checked={options.symbols} 
                    onCheckedChange={(c) => setOptions({...options, symbols: c})}
                  />
                  <span>Symbols <span className="text-muted-foreground text-xs">(!@#$)</span></span>
                </label>
                <label className={`flex items-center gap-3 cursor-pointer sm:col-span-2 mt-2 pt-2 border-t border-border ${options.mode !== 'random' ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Checkbox 
                    checked={options.excludeSimilar} 
                    onCheckedChange={(c) => setOptions({...options, excludeSimilar: c})}
                    disabled={options.mode !== 'random'}
                  />
                  <span>Exclude Similar Characters <span className="text-muted-foreground text-xs">(i, l, 1, L, o, 0, O)</span></span>
                </label>
              </div>
            </div>

          </div>

          {/* History Toggle */}
          {!embed && history.length > 0 && (
            <div className="pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex justify-between items-center"
              >
                <span className="flex items-center gap-2"><History className="w-4 h-4" /> History (Stored locally)</span>
                <span className="text-xs text-muted-foreground">{showHistory ? 'Hide' : 'Show'}</span>
              </Button>
              
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-2 bg-black/30 p-4 rounded-lg">
                      {history.map((h, i) => (
                        <div key={i} className="flex justify-between items-center p-2 rounded bg-card/50 border border-border/50 hover:border-primary/50 transition-colors">
                          <span className="font-mono text-sm truncate mr-4">{h}</span>
                          <Button size="sm" variant="outline" onClick={() => handleCopy(h)}>Copy</Button>
                        </div>
                      ))}
                      <Button variant="destructive" size="sm" onClick={clearHistory} className="w-full mt-4">
                        Clear History
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
}
