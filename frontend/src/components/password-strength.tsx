"use client";

import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains number or special character", met: /[0-9!@#$%^&*(),.?":{}|<>]/.test(password) }
  ];

  const strength = checks.filter((c) => c.met).length;
  const barColor = strength === 0 ? "bg-slate-200" : strength === 1 ? "bg-red-400" : strength === 2 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? barColor : "bg-slate-200"}`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2 text-xs">
            {check.met ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <X className="size-3.5 text-slate-400" />
            )}
            <span className={check.met ? "text-slate-700" : "text-slate-400"}>
              {check.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}