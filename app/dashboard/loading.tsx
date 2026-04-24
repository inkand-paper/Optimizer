import React from "react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-16">
        {/* Header Shimmer */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-full animate-pulse mb-4" />
            <div className="h-10 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-12 w-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Shimmer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="h-32 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer opacity-30" />
              <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4" />
              <div className="h-8 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>

        {/* Main Content Area Shimmer */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="h-96 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] animate-pulse" />
             <div className="h-64 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] animate-pulse" />
          </div>
          <div className="space-y-8">
             <div className="h-80 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-[32px] animate-pulse" />
             <div className="h-[500px] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
