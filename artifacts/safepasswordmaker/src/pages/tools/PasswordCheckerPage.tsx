import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { analyzePassword, PasswordAnalysis } from '@/lib/password';
import { motion } from 'framer-motion';

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);

  useEffect(() => {
    if (password) {
      setAnalysis(analyzePassword(password));
    } else {
      setAnalysis(null);
    }
  }, [password]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold mb-4">Password Strength Checker</h1>
        <p className="text-xl text-muted-foreground">Find out how quickly a computer could crack your password.</p>
        <p className="text-sm text-primary mt-2 flex items-center justify-center gap-1">
          <ShieldAlert className="w-4 h-4" /> Analyzed securely in your browser. Not sent anywhere.
        </p>
      </div>

      <Card className="p-8 bg-black/40 border-white/10 shadow-2xl">
        <div className="relative mb-8">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to test..."
            className="w-full h-16 bg-background rounded-xl border-2 border-border focus:border-primary px-6 text-xl outline-none transition-colors pr-16"
          />
          <button 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
          >
            {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
          </button>
        </div>

        {analysis ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Estimated Crack Time</div>
              <div className={`text-5xl font-bold font-mono ${analysis.score > 60 ? 'text-primary' : 'text-destructive'}`}>
                {analysis.crackTimeDisplay}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-semibold text-lg">Score: {Math.round(analysis.score)}/100</span>
                <span className={`font-bold ${analysis.color.replace('bg-', 'text-')}`}>{analysis.label}</span>
              </div>
              <div className="h-4 w-full bg-muted rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  className={`h-full ${analysis.color} transition-all duration-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
              <CheckItem label="Length (8+)" passed={password.length >= 8} />
              <CheckItem label="Uppercase" passed={analysis.hasUpper} />
              <CheckItem label="Lowercase" passed={analysis.hasLower} />
              <CheckItem label="Numbers" passed={analysis.hasNumber} />
              <CheckItem label="Symbols" passed={analysis.hasSymbol} />
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
            Start typing to see strength analysis...
          </div>
        )}
      </Card>
    </div>
  );
}

function CheckItem({ label, passed }: { label: string, passed: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${passed ? 'text-foreground' : 'text-muted-foreground'}`}>
      {passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-destructive/50" />}
      {label}
    </div>
  );
}
