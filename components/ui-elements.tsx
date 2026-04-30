import * as React from "react";
import { cn } from "@/lib/utils";

import { Eye, EyeOff } from "lucide-react";

/** 
 * [ENTRY-LEVEL] - Card
 * Architectural Vellum / Deep Obsidian styling
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200/60 dark:border-white/5 bg-card text-card-foreground soft-diffusion transition-all duration-300",
        "dark:glass-edge",
        className
      )}
      {...props}
    />
  );
}

/**
 * [ENTRY-LEVEL] - Button
 * Tactile Engineering Grade
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 tactile-button",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-white/5 tactile-button",
    outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-all",
    ghost: "bg-transparent hover:bg-blue-50/50 dark:hover:bg-blue-900/10 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 tactile-button",
  };

  const sizes = {
    sm: "h-8 px-4 text-[9px] font-black uppercase tracking-[0.2em] rounded-md",
    md: "h-11 px-6 text-[10px] font-black uppercase tracking-[0.3em] rounded-md",
    lg: "h-14 px-10 text-[11px] font-black uppercase tracking-[0.3em] rounded-md",
    icon: "h-11 w-11 flex items-center justify-center p-0 rounded-md",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all focus-visibility:outline-none focus-visibility:ring-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

/**
 * [ENTRY-LEVEL] - Input
 */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-md border border-zinc-200 bg-white/50 px-4 py-2 text-xs font-bold tracking-tight transition-all",
        "placeholder:text-zinc-400 placeholder:uppercase placeholder:tracking-widest placeholder:text-[9px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:border-blue-600",
        "hover:bg-blue-50/30 dark:hover:bg-blue-950/20",
        "dark:border-white/5 dark:bg-zinc-900/50 dark:text-zinc-100",
        className
      )}
      {...props}
    />
  );
}

/**
 * [ENTRY-LEVEL] - PasswordInput
 */
export function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative group">
      <Input
        type={show ? "text" : "password"}
        className={cn("pr-12", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-600 transition-colors"
        title={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

