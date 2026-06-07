import React from "react";
import { Server, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DRUPAL_BASE } from "@/lib/drupal";

export function DrupalNotConfigured() {
  return (
    <Card className="p-10 max-w-xl bg-card/60 border-yellow-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
          <Server className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="font-bold">Drupal Backend Not Connected</h2>
          <p className="text-xs text-muted-foreground">Set VITE_DRUPAL_URL to connect your CMS</p>
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-2 mb-6">
        <p>Add the following to your <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">artifacts/safepasswordmaker/.env</code> file:</p>
        <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto">
{`VITE_DRUPAL_URL=https://cms.yourdomain.com
VITE_DRUPAL_CLIENT_ID=safepassmaker
VITE_DRUPAL_CLIENT_SECRET=your_secret`}
        </pre>
        <p>Then restart the dev server. For local development, install Drupal using XAMPP and follow the <strong>drupal-setup/README.md</strong> guide.</p>
      </div>

      {DRUPAL_BASE && (
        <a
          href={`${DRUPAL_BASE}/user/login`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Drupal Admin
        </a>
      )}
    </Card>
  );
}
