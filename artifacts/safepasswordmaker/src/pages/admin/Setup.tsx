import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Server, CheckCircle2, XCircle, Loader2, Copy, Check,
  ArrowRight, ExternalLink, Terminal, Database, Globe,
  Shield, Key, ChevronDown, ChevronUp, AlertCircle,
  Zap, Home,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { isDrupalConfigured, DRUPAL_BASE } from "@/lib/drupal";
import { cn } from "@/lib/utils";

// ─── Credentials (match drush-setup.sh) ──────────────────────────────────────
const CREDS = {
  adminUser: "admin",
  adminPass: "SafePass@2024!",
  oauthId:   "safepassmaker",
  oauthSecret: "Spm@Secret2024!",
};

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} title="Copy" className="p-1 text-muted-foreground hover:text-primary transition-colors rounded">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── Code block ──────────────────────────────────────────────────────────────
function Code({ children, copy = true }: { children: string; copy?: boolean }) {
  return (
    <div className="relative group">
      <pre className="bg-[#0a0f1a] border border-border/60 rounded-lg px-4 py-3 text-xs font-mono text-green-300 overflow-x-auto leading-relaxed whitespace-pre">
        {children}
      </pre>
      {copy && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyBtn text={children} />
        </div>
      )}
    </div>
  );
}

// ─── Credential row ──────────────────────────────────────────────────────────
function CredRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-sm font-semibold", mono && "font-mono text-primary text-xs")}>{value}</span>
        <CopyBtn text={value} />
      </div>
    </div>
  );
}

// ─── Step badge ──────────────────────────────────────────────────────────────
function Step({ n, label, done }: { n: number; label: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        done ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-primary/10 text-primary border border-primary/30"
      )}>
        {done ? <Check className="w-3.5 h-3.5" /> : n}
      </div>
      <span className="font-semibold text-sm">{label}</span>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function Collapse({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold bg-card/60 hover:bg-muted/60 transition-colors">
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 py-4 space-y-3 bg-card/30">{children}</div>}
    </div>
  );
}

// ─── Connection tester ────────────────────────────────────────────────────────
function ConnectionTester() {
  const [url, setUrl] = useState(DRUPAL_BASE || "");
  const [clientId, setClientId] = useState(import.meta.env.VITE_DRUPAL_CLIENT_ID || CREDS.oauthId);
  const [secret, setSecret] = useState(import.meta.env.VITE_DRUPAL_CLIENT_SECRET || CREDS.oauthSecret);
  const [status, setStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [message, setMessage] = useState("");

  const test = async () => {
    if (!url) { setMessage("Enter a Drupal URL first"); return; }
    setStatus("testing"); setMessage("");
    try {
      const base = url.replace(/\/$/, "");
      // Test 1: JSON:API reachable
      const apiRes = await fetch(`${base}/jsonapi`, { headers: { Accept: "application/vnd.api+json" } });
      if (!apiRes.ok) throw new Error(`JSON:API returned ${apiRes.status}`);

      // Test 2: OAuth token endpoint
      const tokenRes = await fetch(`${base}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: clientId,
          client_secret: secret,
          username: CREDS.adminUser,
          password: CREDS.adminPass,
        }),
      });
      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(err.error_description || `OAuth returned ${tokenRes.status}`);
      }

      setStatus("ok");
      setMessage("Connected! JSON:API and OAuth are working correctly.");
    } catch (e: any) {
      setStatus("fail");
      setMessage(e.message || "Connection failed");
    }
  };

  const INPUT = "w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono";

  return (
    <Card className="p-5 bg-card/60 border-border space-y-3">
      <p className="text-sm font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Test Connection</p>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Drupal URL</label>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="http://localhost/safepassmaker-cms/web" className={INPUT} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">OAuth Client ID</label>
          <input value={clientId} onChange={e => setClientId(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">OAuth Secret</label>
          <input value={secret} onChange={e => setSecret(e.target.value)} className={INPUT} />
        </div>
      </div>
      <button onClick={test} disabled={status === "testing"}
        className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {status === "testing" && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === "testing" ? "Testing…" : "Test Drupal Connection"}
      </button>
      {message && (
        <div className={cn(
          "flex items-start gap-2 text-sm rounded-lg px-4 py-3 border",
          status === "ok" ? "text-green-400 bg-green-500/10 border-green-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"
        )}>
          {status === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
          {message}
        </div>
      )}
      {status === "ok" && (
        <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs font-mono text-muted-foreground space-y-1">
          <p className="font-bold text-foreground mb-2">Add to your .env file:</p>
          <p>{`VITE_DRUPAL_URL=${url}`}</p>
          <p>{`VITE_DRUPAL_CLIENT_ID=${clientId}`}</p>
          <p>{`VITE_DRUPAL_CLIENT_SECRET=${secret}`}</p>
        </div>
      )}
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminSetup() {
  const configured = isDrupalConfigured();
  const [tab, setTab] = useState<"local" | "cpanel">("local");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Server className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-sm">Drupal Setup</span>
          </div>
          <div className="flex items-center gap-3">
            {configured && (
              <Link href="/admin">
                <button className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Go to Admin →
                </button>
              </Link>
            )}
            <Link href="/">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Home className="w-3.5 h-3.5" /> Home
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Status banner */}
        <div className={cn(
          "flex items-center gap-4 p-4 rounded-xl border",
          configured ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20"
        )}>
          {configured
            ? <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
            : <AlertCircle className="w-8 h-8 text-yellow-400 shrink-0" />}
          <div className="flex-1">
            <p className="font-bold">{configured ? "Drupal is Connected" : "Drupal Not Configured Yet"}</p>
            {configured
              ? <p className="text-sm text-muted-foreground font-mono mt-0.5">{DRUPAL_BASE}</p>
              : <p className="text-sm text-muted-foreground mt-0.5">Follow the guide below to install and connect Drupal. The frontend works with static posts until then.</p>}
          </div>
          {configured && (
            <a href={`${DRUPAL_BASE}/user/login`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/10 transition-colors shrink-0">
              Drupal Admin <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Credentials box — always visible */}
        <Card className="p-5 bg-card/60 border-border">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm">Pre-configured Credentials</h2>
            <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Use exactly these during Drupal install</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Drupal Admin Account</p>
              <CredRow label="Username" value={CREDS.adminUser} />
              <CredRow label="Password" value={CREDS.adminPass} mono />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">OAuth 2.0 Client (React App)</p>
              <CredRow label="Client ID" value={CREDS.oauthId} mono />
              <CredRow label="Client Secret" value={CREDS.oauthSecret} mono />
            </div>
          </div>
        </Card>

        {/* .env snippet */}
        <Card className="p-5 bg-card/60 border-border">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm">React .env Configuration</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Create <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">artifacts/safepasswordmaker/.env</code> with:
          </p>
          <Code>{`# Local development:
VITE_DRUPAL_URL=http://localhost/safepassmaker-cms/web
VITE_DRUPAL_CLIENT_ID=${CREDS.oauthId}
VITE_DRUPAL_CLIENT_SECRET=${CREDS.oauthSecret}

# cPanel / shared hosting (replace with your subdomain):
# VITE_DRUPAL_URL=https://cms.yourdomain.com
# VITE_DRUPAL_CLIENT_ID=${CREDS.oauthId}
# VITE_DRUPAL_CLIENT_SECRET=${CREDS.oauthSecret}`}</Code>
        </Card>

        {/* Tab switcher */}
        <div>
          <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mb-6">
            <button onClick={() => setTab("local")}
              className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === "local" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Database className="w-4 h-4" /> Local (XAMPP)
            </button>
            <button onClick={() => setTab("cpanel")}
              className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === "cpanel" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              <Globe className="w-4 h-4" /> cPanel Hosting
            </button>
          </div>

          {/* LOCAL TAB */}
          {tab === "local" && (
            <div className="space-y-4">
              <Card className="p-5 bg-card/60 border-border">
                <Step n={1} label="Install XAMPP and start Apache + MySQL" />
                <p className="text-sm text-muted-foreground mb-3">Download XAMPP from apachefriends.org. Start both Apache and MySQL from the Control Panel.</p>
                <Collapse title="Download links">
                  <a href="https://www.apachefriends.org/download.html" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> XAMPP download page
                  </a>
                  <p className="text-xs text-muted-foreground">Alternatively: Laragon (Windows) or MAMP (macOS) work just as well.</p>
                </Collapse>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={2} label="Create the database in phpMyAdmin" />
                <p className="text-sm text-muted-foreground mb-3">Open <code className="bg-muted px-1 rounded text-xs">http://localhost/phpmyadmin</code> → New → create database:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted rounded-lg p-3"><span className="text-xs text-muted-foreground block mb-0.5">Database name</span><code className="font-mono text-primary text-xs">safepassmaker_db</code></div>
                  <div className="bg-muted rounded-lg p-3"><span className="text-xs text-muted-foreground block mb-0.5">Collation</span><code className="font-mono text-xs">utf8mb4_unicode_ci</code></div>
                </div>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={3} label="Download and install Drupal 10" />
                <p className="text-sm text-muted-foreground mb-3">Run in your XAMPP htdocs folder (requires Composer):</p>
                <Code>{`cd C:\\xampp\\htdocs
composer create-project drupal/recommended-project safepassmaker-cms
cd safepassmaker-cms`}</Code>
                <p className="text-xs text-muted-foreground mt-3">No Composer? Download the ZIP from drupal.org/download and extract to <code className="font-mono">htdocs/safepassmaker-cms/</code></p>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={4} label="Install Drupal via browser wizard" />
                <p className="text-sm text-muted-foreground mb-3">
                  Open <a href="http://localhost/safepassmaker-cms/web" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">http://localhost/safepassmaker-cms/web <ExternalLink className="w-3 h-3" /></a> and follow the installer using:
                </p>
                <div className="space-y-1.5 text-sm">
                  {[
                    ["Install profile", "Standard"],
                    ["Database", "MySQL — safepassmaker_db / root / (empty)"],
                    ["Site name", "SafePassWordmaker CMS"],
                    ["Admin username", CREDS.adminUser],
                    ["Admin password", CREDS.adminPass],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-muted-foreground w-36 shrink-0 text-xs mt-0.5">{k}</span>
                      <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-primary">{v}</code>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={5} label="Run the automated setup script" />
                <p className="text-sm text-muted-foreground mb-3">From the Drupal root, run the Drush setup script. This installs all required modules, creates fields, sets up OAuth, and creates the contributor role:</p>
                <Code>{`cd C:\\xampp\\htdocs\\safepassmaker-cms
bash /path/to/safepasswordmaker/drupal-setup/drush-setup.sh`}</Code>
                <p className="text-xs text-muted-foreground mt-3">On Windows, use Git Bash or WSL to run the .sh script.</p>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={6} label="Copy local settings file (CORS + cache)" />
                <p className="text-sm text-muted-foreground mb-3">Copy <code className="font-mono text-xs bg-muted px-1 rounded">drupal-setup/settings.local.php</code> to your Drupal site:</p>
                <Code>{`cp drupal-setup/settings.local.php web/sites/default/settings.local.php`}</Code>
                <p className="text-xs text-muted-foreground mt-2 mb-2">Then add at the bottom of <code className="font-mono text-xs">web/sites/default/settings.php</code>:</p>
                <Code>{`if (file_exists($app_root . '/' . $site_path . '/settings.local.php')) {
  include $app_root . '/' . $site_path . '/settings.local.php';
}`}</Code>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={7} label="Create .env and start the React app" done={configured} />
                <p className="text-sm text-muted-foreground mb-3">Create <code className="font-mono text-xs bg-muted px-1 rounded">artifacts/safepasswordmaker/.env</code>:</p>
                <Code>{`VITE_DRUPAL_URL=http://localhost/safepassmaker-cms/web
VITE_DRUPAL_CLIENT_ID=${CREDS.oauthId}
VITE_DRUPAL_CLIENT_SECRET=${CREDS.oauthSecret}`}</Code>
                <p className="text-xs text-muted-foreground mt-2">Restart the React dev server after saving. The admin panel will now connect to Drupal.</p>
              </Card>
            </div>
          )}

          {/* CPANEL TAB */}
          {tab === "cpanel" && (
            <div className="space-y-4">
              <Card className="p-5 bg-card/60 border-border">
                <Step n={1} label="Create a subdomain in cPanel" />
                <p className="text-sm text-muted-foreground">In cPanel → <strong>Subdomains</strong>, create <code className="font-mono text-xs bg-muted px-1 rounded">cms.yourdomain.com</code>. Note the Document Root path (e.g. <code className="font-mono text-xs">/home/username/public_html/cms</code>).</p>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={2} label="Create a MySQL database" />
                <p className="text-sm text-muted-foreground mb-3">In cPanel → <strong>MySQL Databases</strong>:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal ml-4">
                  <li>Create database: <code className="font-mono text-xs bg-muted px-1 rounded">username_safepassmaker</code></li>
                  <li>Create user: <code className="font-mono text-xs bg-muted px-1 rounded">username_spmuser</code> with a strong password</li>
                  <li>Add user to database with <strong>All Privileges</strong></li>
                </ol>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={3} label="Upload and extract Drupal 10" />
                <p className="text-sm text-muted-foreground mb-3">Download Drupal 10 ZIP from drupal.org/download, then:</p>
                <p className="text-sm text-muted-foreground">cPanel → <strong>File Manager</strong> → navigate to your subdomain root → Upload → Extract</p>
                <p className="text-xs text-muted-foreground mt-2">Or via SSH: <code className="font-mono text-xs bg-muted px-1 rounded">composer create-project drupal/recommended-project cms</code></p>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={4} label="Run the Drupal installer" />
                <p className="text-sm text-muted-foreground mb-3">Open <code className="font-mono text-xs bg-muted px-1 rounded">https://cms.yourdomain.com</code> and use:</p>
                <div className="space-y-1.5 text-sm">
                  {[
                    ["Profile", "Standard"],
                    ["DB name", "username_safepassmaker"],
                    ["DB user", "username_spmuser"],
                    ["DB pass", "(your chosen password)"],
                    ["Admin user", CREDS.adminUser],
                    ["Admin pass", CREDS.adminPass],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-muted-foreground w-28 shrink-0 text-xs mt-0.5">{k}</span>
                      <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-primary">{v}</code>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={5} label="Run setup script via SSH (or manually)" />
                <p className="text-sm text-muted-foreground mb-3">If SSH is available:</p>
                <Code>{`cd ~/public_html/cms
bash ~/path-to/drupal-setup/drush-setup.sh`}</Code>
                <Collapse title="No SSH? Manual module install steps">
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal ml-4">
                    <li>Drupal Admin → Extend → install: <code className="font-mono text-xs">simple_oauth, jsonapi_extras, consumers, pathauto, token</code></li>
                    <li>Config → Web services → JSON:API → set "Accept all operations"</li>
                    <li>Config → Web services → Consumers → Add consumer with Client ID <code className="font-mono text-xs">{CREDS.oauthId}</code> and Secret <code className="font-mono text-xs">{CREDS.oauthSecret}</code></li>
                    <li>Create custom fields on Article content type (see README.md)</li>
                    <li>People → Roles → Add role: <code className="font-mono text-xs">contributor</code></li>
                  </ol>
                </Collapse>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={6} label="Upload settings.cpanel.php" />
                <p className="text-sm text-muted-foreground mb-3">Edit <code className="font-mono text-xs bg-muted px-1 rounded">drupal-setup/settings.cpanel.php</code> with your DB credentials and domain, then upload to:</p>
                <Code copy={false}>{`public_html/cms/web/sites/default/settings.local.php`}</Code>
                <p className="text-xs text-muted-foreground mt-2">Include it at the bottom of <code className="font-mono text-xs">settings.php</code> (same snippet as Option A, Step 6).</p>
              </Card>

              <Card className="p-5 bg-card/60 border-border">
                <Step n={7} label="Set environment variables for React" done={configured} />
                <p className="text-sm text-muted-foreground mb-3">In your React hosting (Replit Secrets, Vercel env, etc.):</p>
                <Code>{`VITE_DRUPAL_URL=https://cms.yourdomain.com
VITE_DRUPAL_CLIENT_ID=${CREDS.oauthId}
VITE_DRUPAL_CLIENT_SECRET=${CREDS.oauthSecret}`}</Code>
              </Card>
            </div>
          )}
        </div>

        {/* Test connection widget */}
        <ConnectionTester />

        {/* Module reference */}
        <Collapse title="Required Drupal Modules (installed by drush-setup.sh)" defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              ["simple_oauth", "OAuth 2.0 login for the React frontend"],
              ["jsonapi_extras", "JSON:API fine-tuning and field aliasing"],
              ["consumers", "Register the React app as an API consumer"],
              ["decoupled_router", "Resolve Drupal paths from the frontend"],
              ["pathauto", "Auto-generate URL slugs from post titles"],
              ["token", "Token support required by Pathauto"],
            ].map(([mod, desc]) => (
              <div key={mod} className="bg-muted/60 rounded-lg p-3">
                <code className="text-xs font-mono text-primary">{mod}</code>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </Collapse>

        {/* Troubleshooting */}
        <Collapse title="Troubleshooting" defaultOpen={false}>
          <div className="space-y-3 text-sm">
            {[
              ["CORS errors in browser console", "Check settings.local.php CORS config. Add your frontend origin (http://localhost:5173 for local, https://yourdomain.com for production)."],
              ["OAuth returns 401 or invalid_client", "Go to Drupal admin → Config → Consumers and verify the `safepassmaker` consumer exists with the correct Client ID and Secret."],
              ["JSON:API returns 403 Forbidden", "Drupal admin → Config → Web services → JSON:API → set to Accept all JSON:API operations."],
              ["Posts not showing on the blog", "Ensure the node has status = Published and field_approved = checked (true)."],
              ["Local: Permission denied on Drupal install", "Rename sites/default/default.settings.php → settings.php and run: chmod 666 sites/default/settings.php"],
              ["cPanel: 500 Internal Server Error", "Check Drupal error logs in Reports → Recent log messages. Often a PHP version issue — Drupal 10 requires PHP 8.1+."],
            ].map(([q, a]) => (
              <div key={q as string} className="border-l-2 border-primary/30 pl-3">
                <p className="font-semibold text-xs mb-0.5">{q}</p>
                <p className="text-xs text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </Collapse>

        {/* Footer actions */}
        <div className="flex flex-wrap gap-3 pb-4">
          {configured && (
            <Link href="/admin">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                Go to Admin Panel <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
          {configured && (
            <a href={`${DRUPAL_BASE}/user/login`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Open Drupal Admin <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <Link href="/">
            <button className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              ← Back to Site
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
