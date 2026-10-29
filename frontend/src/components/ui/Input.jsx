import React from 'react';

export default function Input({
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  error,
  prefix,
  suffix,
  className = '',
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <div
      className={`relative flex items-center w-full rounded-xl border bg-white dark:bg-slate-900 transition-colors shadow-xs ${
        hasError
          ? 'border-rose-400 dark:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20'
          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
      } ${disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed' : ''} ${className}`}
    >
      {prefix && (
        <span className="pl-3.5 pr-1 text-sm font-medium text-slate-400 dark:text-slate-500 shrink-0 select-none">
          {prefix}
        </span>
      )}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError && id ? `${id}-error` : undefined}
        className="w-full py-2.5 px-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none disabled:cursor-not-allowed"
        {...props}
      />

      {suffix && (
        <span className="pr-3.5 pl-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 select-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

