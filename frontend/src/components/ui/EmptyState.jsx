import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-inner">
          <Icon className="w-6 h-6" />
        </div>
      )}
      {title && (
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          {title}
        </h4>
      )}
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
      {children}
    </div>
  );
}

