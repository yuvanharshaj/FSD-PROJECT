import React from 'react';

// Reusable animated skeleton loader for cards and content
export default function Skeleton({ className = 'h-6 w-full', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
        />
      ))}
    </>
  );
}

// Pre-built skeleton loader for Parking Lot cards
export function LotCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
    </div>
  );
}
