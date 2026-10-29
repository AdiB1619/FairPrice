import React from 'react';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const variantClass = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded h-4' : 'rounded-xl';

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200/90 dark:bg-slate-800 ${variantClass} ${className}`}
    />
  );
}

