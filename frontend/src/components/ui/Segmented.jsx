import React from 'react';

export default function Segmented({
  id,
  options = [],
  value,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
}) {
  const SIZES = {
    sm: 'text-xs py-1 px-2.5 rounded-lg',
    md: 'text-sm py-1.5 px-3 rounded-lg',
    lg: 'text-sm py-2 px-4 rounded-xl',
  };

  return (
    <div
      role="radiogroup"
      id={id}
      className={`inline-flex flex-wrap p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 w-full ${className}`}
    >
      {options.map(option => {
        const optValue = typeof option === 'object' ? option.value : option;
        const optLabel = typeof option === 'object' ? option.label : option;
        const isSelected = value === optValue;

        return (
          <button
            key={String(optValue)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(optValue)}
            className={`flex-1 text-center font-medium transition-all duration-150 cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-50 ${
              SIZES[size] || SIZES.md
            } ${
              isSelected
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-semibold shadow-xs dark:shadow-none border border-slate-200/60 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 border border-transparent'
            }`}
          >
            {optLabel}
          </button>
        );
      })}
    </div>
  );
}

