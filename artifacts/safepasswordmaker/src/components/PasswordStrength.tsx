import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PwCheck { label: string; met: boolean }

export function getPwChecks(password: string, confirm?: string): PwCheck[] {
  const checks: PwCheck[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter (A–Z)", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)", met: /[a-z]/.test(password) },
    { label: "Number (0–9)", met: /[0-9]/.test(password) },
    { label: "Symbol (!@#$%^&*…)", met: /[^A-Za-z0-9]/.test(password) },
  ];
  if (confirm !== undefined) {
    checks.push({ label: "Passwords match", met: confirm.length > 0 && password === confirm });
  }
  return checks;
}

export function isPasswordValid(password: string): boolean {
  return getPwChecks(password).every(c => c.met);
}

export default function PasswordStrength({ password, confirm, show = true }: {
  password: string;
  confirm?: string;
  show?: boolean;
}) {
  if (!show || !password) return null;
  const checks = getPwChecks(password, confirm);

  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
      {checks.map(c => (
        <div key={c.label} className={cn("flex items-center gap-1.5 text-[11px] font-medium", c.met ? "text-green-400" : "text-muted-foreground")}>
          {c.met
            ? <CheckCircle2 className="w-3 h-3 shrink-0" />
            : <XCircle className="w-3 h-3 shrink-0 opacity-50" />}
          {c.label}
        </div>
      ))}
    </div>
  );
}
