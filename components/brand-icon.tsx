import * as React from "react";

export function BrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path d="M3 12h4.5l2-4.5 3 9 2.5-6.5 2 4H21" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}
