import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import PasswordStrength, { isPasswordValid } from "@/components/PasswordStrength";

export default function Register() {
  const { register, user } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) { navigate("/admin"); return null; }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(password)) { setError("Please meet all password requirements"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      await register(username, email, password);
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Create Contributor Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join SafePassMaker as a blog contributor</p>
        </div>

        <Card className="p-6 bg-card border-border">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required
                placeholder="johndoe"
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && (
                <div className={`flex items-center gap-1.5 text-xs mt-1.5 font-medium ${password === confirm ? "text-green-400" : "text-red-400"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {password === confirm ? "Passwords match" : "Passwords do not match"}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>
        </Card>

        <div className="mt-5 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <p className="text-xs text-yellow-400 font-medium mb-1">Account Approval Required</p>
          <p className="text-xs text-muted-foreground">After registration, your account will be reviewed by an admin before you can publish posts. You'll be notified once approved.</p>
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground space-y-2">
          <p>Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link></p>
          <p><Link href="/" className="hover:text-foreground transition-colors">← Back to site</Link></p>
        </div>
      </div>
    </div>
  );
}
