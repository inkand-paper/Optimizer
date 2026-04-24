import React from "react";

export default function DocDetailLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-[900px] mx-auto px-4 py-12 md:py-20">
        {/* Back Link Shimmer */}
        <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse mb-12" />

        {/* Intro Section Shimmer */}
        <div className="mb-20">
          <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse mb-8" />
          <div className="h-16 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse mb-6" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse" />
            <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content Card Shimmer */}
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 md:p-12 border border-zinc-100 dark:border-zinc-800 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer opacity-50" />
              <div className="h-10 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl mb-8" />
              <div className="space-y-4">
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full" />
                <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
              </div>
              <div className="mt-10 h-48 w-full bg-zinc-950 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
