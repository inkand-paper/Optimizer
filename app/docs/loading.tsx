import React from "react";

export default function DocsLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-20">
        {/* Header Shimmer */}
        <div className="mb-12">
          <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse mb-6" />
          <div className="h-12 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse mb-4" />
          <div className="h-6 w-96 bg-zinc-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
        </div>

        {/* Card Grid Shimmer */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="h-64 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer" />
              <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-6" />
              <div className="h-6 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-lg mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                <div className="h-3 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
