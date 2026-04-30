"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

/* ─────────────────────────────────────────────
   Card  — 12px radius, thin border, flat matte
───────────────────────────────────────────── */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("np-card", className)}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────
   Button variants
   primary  → gold fill
   outline  → transparent + border
   ghost    → no border, subtle hover
   danger   → crimson outline
   secondary→ muted fill
───────────────────────────────────────────── */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "secondary" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "np-btn-primary",
  outline:   "np-btn-outline",
  ghost:     "np-btn-outline border-transparent hover:border-transparent",
  secondary: "np-btn-outline",
  danger:    "np-btn-danger",
};

const sizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm:   "h-8  px-3  text-xs",
  md:   "h-10 px-5  text-sm",
  lg:   "h-12 px-7  text-sm",
  icon: "h-10 w-10  p-0 flex items-center justify-center",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variantMap[variant],
        sizeMap[size],
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────
   Input  — 8px radius, subtle fill
───────────────────────────────────────────── */
export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("np-input", className)}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────
   PasswordInput
───────────────────────────────────────────── */
export function PasswordInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-np-slate hover:text-np-gold transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Badge
───────────────────────────────────────────── */
export function Badge({
  variant = "warning",
  className,
  children,
}: {
  variant?: "success" | "warning" | "danger";
  className?: string;
  children: React.ReactNode;
}) {
  const v = {
    success: "np-badge-success",
    warning: "np-badge-warning",
    danger:  "np-badge-danger",
  }[variant];
  return (
    <span className={cn(v, "font-mono uppercase tracking-wide", className)}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   StatusDot
───────────────────────────────────────────── */
export function StatusDot({
  status,
}: {
  status: "healthy" | "warning" | "error" | "offline";
}) {
  const colors = {
    healthy: "bg-np-teal shadow-[0_0_8px_rgba(29,158,117,0.5)]",
    warning: "bg-np-gold shadow-[0_0_8px_rgba(180,140,60,0.5)]",
    error:   "bg-np-crimson shadow-[0_0_8px_rgba(163,45,45,0.5)]",
    offline: "bg-np-slate",
  };
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full flex-shrink-0",
        colors[status]
      )}
    />
  );
}
