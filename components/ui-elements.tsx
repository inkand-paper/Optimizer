import * as React from "react";
import { cn } from "@/lib/utils";

import { Eye, EyeOff } from "lucide-react";

/** 
 * [ENTRY-LEVEL] - Card
 * Standardized with rounded-xl for a modern SaaS look.
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * [ENTRY-LEVEL] - Button
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
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
    outline: "border border-zinc-200 bg-transparent hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800",
    ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-4 py-2 text-sm rounded-xl",
    lg: "h-12 px-8 text-base rounded-xl",
    icon: "h-10 w-10 flex items-center justify-center p-0 rounded-xl",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all focus-visibility:outline-none focus-visibility:ring-2 disabled:opacity-50 disabled:pointer-events-none",
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
        "flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400",
        className
      )}
      {...props}
    />
  );
}

/**
 * [ENTRY-LEVEL] - PasswordInput
 * An extension of Input that includes a toggle button to show or hide the password.
 */
export function PasswordInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative group">
      <Input
        type={show ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        title={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

