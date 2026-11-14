"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertTriangle, X } from "lucide-react";

/* ─────────────────────────────────────────────
   Card  — 8px radius, crisp 1px border, flat
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
   Button variants — Monochromatic Inverted Ink
   primary   → solid high-contrast ink
   outline   → 1px border + subtle hover
   ghost     → borderless + subtle hover
   secondary → muted surface + text
   danger    → crimson outline + subtle crimson hover
───────────────────────────────────────────── */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "secondary" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "np-btn-primary",
  outline:   "np-btn-outline",
  ghost:     "bg-transparent text-foreground hover:bg-muted border border-transparent rounded-ui text-[13px] font-medium transition-all duration-120",
  secondary: "bg-muted text-foreground hover:bg-muted/80 border border-border rounded-ui text-[13px] font-medium transition-all duration-120",
  danger:    "np-btn-danger",
};

const sizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm:   "h-8  px-3  text-xs",
  md:   "h-[38px] px-4 text-[13px]",
  lg:   "h-11 px-6  text-sm",
  icon: "h-[38px] w-[38px] p-0 flex items-center justify-center",
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
        "disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none",
        className
      )}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────
   Input  — 6px radius, crisp 1px border
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
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Badge — Crisp, micro-bordered, high contrast
───────────────────────────────────────────── */
export function Badge({
  variant = "warning",
  className,
  children,
}: {
  variant?: "success" | "warning" | "danger" | "neutral";
  className?: string;
  children: React.ReactNode;
}) {
  const v = {
    success: "bg-status-up/10 text-status-up border border-status-up/20",
    warning: "bg-status-warn/10 text-status-warn border border-status-warn/20",
    danger:  "bg-status-down/10 text-status-down border border-status-down/20",
    neutral: "bg-muted text-foreground border border-border rounded text-[11px] font-mono px-1.5 py-0.5",
  }[variant];
  return (
    <span className={cn(v, "font-mono uppercase tracking-wide inline-flex items-center gap-1.5", className)}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────
   StatusPip — Precision 6px telemetry indicator
   (Strictly functional status: up, down, warn)
───────────────────────────────────────────── */
export function StatusPip({
  status,
  label,
  className,
}: {
  status: "UP" | "DOWN" | "DEGRADED" | "PENDING";
  label?: string;
  className?: string;
}) {
  const pipColors = {
    UP: "bg-status-up",
    DOWN: "bg-status-down",
    DEGRADED: "bg-status-warn",
    PENDING: "bg-muted-foreground",
  };

  const textColors = {
    UP: "text-status-up",
    DOWN: "text-status-down",
    DEGRADED: "text-status-warn",
    PENDING: "text-muted-foreground",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-tight", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", pipColors[status])} />
      {label && <span className={textColors[status]}>{label}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   IconWrapper — Standardized 1.5 stroke Lucide icon
───────────────────────────────────────────── */
export function IconWrapper({
  icon: IconComponent,
  size = 16,
  strokeWidth = 1.5,
  className,
  ...props
}: {
  icon: React.ElementType;
  size?: number;
  strokeWidth?: number;
  className?: string;
  [key: string]: any;
}) {
  return <IconComponent size={size} strokeWidth={strokeWidth} className={className} {...props} />;
}

/* ─────────────────────────────────────────────
   StatusDot (Legacy compat)
───────────────────────────────────────────── */
export function StatusDot({
  status,
}: {
  status: "healthy" | "warning" | "error" | "offline";
}) {
  const colors = {
    healthy: "bg-status-up",
    warning: "bg-status-warn",
    error:   "bg-status-down",
    offline: "bg-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        colors[status]
      )}
    />
  );
}

/* ─────────────────────────────────────────────
   Toggle Switch
───────────────────────────────────────────── */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  variant?: "teal" | "gold";
  size?: "sm" | "md";
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  size = "md",
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width:  size === "sm" ? 34 : 40,
        height: size === "sm" ? 18 : 22,
        padding: 2,
      }}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-150 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40",
        checked
          ? "bg-foreground"
          : "bg-muted border border-border",
        className
      )}
    >
      <span
        style={{
          width:     size === "sm" ? 14 : 18,
          height:    size === "sm" ? 14 : 18,
          transform: checked
            ? `translateX(${size === "sm" ? 16 : 18}px)`
            : "translateX(0px)",
        }}
        className={cn(
          "pointer-events-none block rounded-full transition-transform duration-150 ease-in-out",
          checked ? "bg-background" : "bg-muted-foreground"
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}

/* ─────────────────────────────────────────────
   ConfirmDialog — Accessible replacement for window.confirm
───────────────────────────────────────────── */
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-[420px] rounded-lg border border-border bg-card p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {variant === "danger" && (
              <div className="h-8 w-8 rounded-md bg-status-down/10 border border-status-down/20 text-status-down flex items-center justify-center shrink-0">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              </div>
            )}
            <h3 id="confirm-dialog-title" className="text-[15px] font-semibold tracking-tight text-foreground">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EmptyState — Clean, honest empty container
───────────────────────────────────────────── */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-12 text-center border border-dashed border-border rounded-card bg-card/50 space-y-3", className)}>
      {Icon && (
        <div className="h-10 w-10 rounded-ui bg-muted border border-border flex items-center justify-center text-muted-foreground mx-auto">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      )}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Skeleton — Monochromatic subtle loader
───────────────────────────────────────────── */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded bg-muted/60", className)}
      {...props}
    />
  );
}

/* ─────────────────────────────────────────────
   SegmentedControl — Monochromatic tab control
───────────────────────────────────────────── */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex bg-muted p-1 rounded-ui border border-border", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1 rounded-ui text-xs font-medium transition-colors cursor-pointer",
            value === opt.value
              ? "bg-background text-foreground shadow-sm font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
