import React from 'react';
import { formatInrShort, formatInr } from '../../lib/format';
import Tooltip from '../ui/Tooltip';

export default function RangeBar({ low, high, estimate, asking }) {
  const span = Math.max(1, high - low);
  const getPct = (val) => Math.max(0, Math.min(100, ((val - low) / span) * 100));

  const estPct = getPct(estimate);
  const askPct = asking != null ? getPct(asking) : null;

  // Determine marker color if asking price is given
  let askBg = 'bg-slate-700 dark:bg-slate-300';
  if (asking != null) {
    if (asking > high) askBg = 'bg-rose-500';
    else if (asking < low) askBg = 'bg-emerald-500';
    else askBg = 'bg-blue-500';
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>Fair Market Range</span>
        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
          P10 to P90 model tree spread
        </span>
      </div>

      {/* ── Range track ── */}
      <div className="relative h-3 rounded-full bg-slate-200/90 dark:bg-slate-800 overflow-visible my-3">
        {/* Active band fill */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 dark:from-blue-900 dark:via-blue-700 dark:to-indigo-800 opacity-80" />

        {/* Point Estimate Marker */}
        <Tooltip text={`Estimated Price: ${formatInr(estimate)}`} position="top">
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 border-2 border-white dark:border-slate-900 shadow-md z-20 cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `${estPct}%` }}
          />
        </Tooltip>

        {/* Asking Price Marker */}
        {askPct != null && (
          <Tooltip text={`Asking Price: ${formatInr(asking)}`} position="bottom">
            <div
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-6 rounded ${askBg} border border-white dark:border-slate-900 shadow-lg z-30 cursor-pointer hover:scale-110 transition-transform`}
              style={{ left: `${askPct}%` }}
            />
          </Tooltip>
        )}
      </div>

      {/* ── Labels ── */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
        <div>
          <span className="text-[10px] text-slate-400 block -mb-0.5">LOW</span>
          <span>{formatInrShort(low)}</span>
        </div>

        <div className="text-center font-bold text-blue-700 dark:text-blue-400">
          <span className="text-[10px] text-blue-500/80 block -mb-0.5 uppercase tracking-wide">Estimate</span>
          <span>{formatInrShort(estimate)}</span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block -mb-0.5">HIGH</span>
          <span>{formatInrShort(high)}</span>
        </div>
      </div>

      {/* Asking price legend */}
      {asking != null && (
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-3 rounded-xs ${askBg}`} />
            <span>Seller's Asking: <strong>{formatInr(asking)}</strong></span>
          </div>
          <span>
            {asking > high ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">Above high band</span>
            ) : asking < low ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Below low band</span>
            ) : (
              <span className="text-blue-600 dark:text-blue-400 font-medium">Within fair band</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

