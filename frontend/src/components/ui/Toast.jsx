import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const STYLES = {
    success: 'bg-emerald-900/90 text-white border-emerald-700',
    error: 'bg-rose-900/90 text-white border-rose-700',
    info: 'bg-slate-900/95 text-white border-slate-700',
  };

  const Icon = ICONS[type] || Info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${
        STYLES[type] || STYLES.info
      }`}
    >
      <Icon className="w-4 h-4 shrink-0 text-current" />
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss toast"
          className="ml-2 text-white/70 hover:text-white transition cursor-pointer p-0.5 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

