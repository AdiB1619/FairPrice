import React from 'react';

export default function Field({
  label,
  id,
  hint,
  error,
  required = false,
  className = '',
  children,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
          </span>
          {hint && <span className="text-[11px] font-normal lowercase tracking-normal text-slate-400 dark:text-slate-500">{hint}</span>}
        </label>
      )}

      {children}

      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-in fade-in duration-150">
          <span>•</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

