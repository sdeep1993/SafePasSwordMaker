import React from "react";
import { Link } from "wouter";
import { Server, ExternalLink, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { isDrupalConfigured, DRUPAL_BASE } from "@/lib/drupal";

export default function AdminSetup() {
  const configured = isDrupalConfigured();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Server className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">Drupal Backend Setup</h1>
          <p className="text-muted-foreground text-sm mt-1">
            SafePassWordmaker uses Drupal as its headless CMS backend
          </p>
        </div>

        <Card className="p-6 bg-card border-border mb-4">
          <div className="flex items-center gap-3 mb-4">
            {configured ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div>
              <p className="font-semibold text-sm">
                {configured ? "Drupal URL configured" : "Drupal URL not set"}
              </p>
              {configured && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{DRUPAL_BASE}</p>
              )}
            </div>
          </div>

          {!configured && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add these variables to <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">artifacts/safepasswordmaker/.env</code>:
              </p>
              <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre">
{`VITE_DRUPAL_URL=https://cms.yourdomain.com
VITE_DRUPAL_CLIENT_ID=safepassmaker
VITE_DRUPAL_CLIENT_SECRET=your_secret`}
              </pre>
              <p className="text-xs text-muted-foreground">
                Restart the dev server after saving. Follow <strong>drupal-setup/README.md</strong> to install Drupal on your cPanel or XAMPP.
              </p>
            </div>
          )}

          {configured && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Create your administrator account in the Drupal admin panel, then log in here.
              </p>
              <a
                href={`${DRUPAL_BASE}/user/login`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full justify-center px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Drupal Admin Panel
              </a>
            </div>
          )}
        </Card>

        <div className="space-y-2">
          {configured && (
            <Link href="/admin/login">
              <button className="w-full py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors">
                Go to Admin Login
              </button>
            </Link>
          )}
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Site
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
