import React from 'react';
import { formatInrShort, formatInr } from '../../lib/format';
import Tooltip from '../ui/Tooltip';

export default function RangeBar({ low, high, estimate, asking }) {
  // Ensure valid numerical inputs
  const safeLow = Number(low) || 0;
  const safeHigh = Number(high) || Math.max(safeLow + 1, 1);
  const safeEst = Number(estimate) || safeLow;
  const hasAsking = asking != null && !isNaN(asking) && Number(asking) > 0;
  const safeAsk = hasAsking ? Number(asking) : null;

  // Dynamic scale: expand track bounds if asking price lies beyond fair range
  let trackMin = safeLow;
  let trackMax = safeHigh;
  if (hasAsking) {
    if (safeAsk < safeLow) trackMin = Math.min(trackMin, safeAsk * 0.96);
    if (safeAsk > safeHigh) trackMax = Math.max(trackMax, safeAsk * 1.04);
  }
  const trackSpan = Math.max(1, trackMax - trackMin);

  // Position percentages relative to the track width
  const lowPct = Math.max(0, Math.min(100, ((safeLow - trackMin) / trackSpan) * 100));
  const highPct = Math.max(0, Math.min(100, ((safeHigh - trackMin) / trackSpan) * 100));
  const estPct = Math.max(0, Math.min(100, ((safeEst - trackMin) / trackSpan) * 100));
  const askPct = hasAsking
    ? Math.max(0, Math.min(100, ((safeAsk - trackMin) / trackSpan) * 100))
    : null;

  // Determine asking price status and marker color
  let askBg = 'bg-blue-600 dark:bg-blue-500';
  let askStatus = 'Within fair band';
  let askStatusColor = 'text-blue-600 dark:text-blue-400';

  if (hasAsking) {
    if (safeAsk > safeHigh) {
      askBg = 'bg-rose-600 dark:bg-rose-500';
      askStatus = 'Above high band (Overpriced)';
      askStatusColor = 'text-rose-600 dark:text-rose-400';
    } else if (safeAsk < safeLow) {
      askBg = 'bg-emerald-600 dark:bg-emerald-500';
      askStatus = 'Below low band (Good Deal)';
      askStatusColor = 'text-emerald-600 dark:text-emerald-400';
    }
  }

  return (
    <div className="space-y-3 py-1">
      {/* ── Section Title ── */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span>Fair Market Range</span>
        </span>
        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
          P10 to P90 model tree spread
        </span>
      </div>

      {/* ── Visual Track Container ── */}
      <div className="relative w-full h-3.5 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-visible my-3 select-none">
        {/* Fair Range Active Colored Band */}
        <div
          className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 dark:from-blue-800 dark:via-blue-600 dark:to-indigo-700 opacity-90 shadow-inner"
          style={{
            left: `${lowPct}%`,
            width: `${Math.max(2, highPct - lowPct)}%`,
          }}
        />

        {/* Model Estimate Marker (Circular Pin) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 pointer-events-auto"
          style={{ left: `${estPct}%` }}
        >
          <Tooltip text={`Model Estimate: ${formatInr(safeEst)}`} position="top">
            <div
              className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-400 border-2 border-white dark:border-slate-900 shadow-md cursor-pointer hover:scale-125 transition-transform flex items-center justify-center ring-2 ring-blue-500/20"
              aria-label={`Model Estimate: ${formatInr(safeEst)}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />
            </div>
          </Tooltip>
        </div>

        {/* Seller Asking Price Marker (Vertical Pill with Indicator) */}
        {askPct != null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 pointer-events-auto"
            style={{ left: `${askPct}%` }}
          >
            <Tooltip text={`Seller's Asking: ${formatInr(safeAsk)}`} position="bottom">
              <div
                className={`w-3.5 h-7 rounded-md ${askBg} border-2 border-white dark:border-slate-900 shadow-lg cursor-pointer hover:scale-125 transition-transform flex items-center justify-center ring-2 ring-black/10 dark:ring-white/10`}
                aria-label={`Seller's Asking: ${formatInr(safeAsk)}`}
              >
                <div className="w-0.5 h-3 bg-white/90 rounded-full" />
              </div>
            </Tooltip>
          </div>
        )}
      </div>

      {/* ── Range Labels Row (LOW / ESTIMATE / HIGH) ── */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mb-0.5">
            Low (P10)
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatInrShort(safeLow)}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 block -mb-0.5 uppercase tracking-wider font-sans font-bold">
            Estimate
          </span>
          <span className="font-bold text-blue-700 dark:text-blue-300 font-mono text-sm">
            {formatInrShort(safeEst)}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mb-0.5">
            High (P90)
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatInrShort(safeHigh)}
          </span>
        </div>
      </div>

      {/* ── Asking Price Legend Row ── */}
      {hasAsking && (
        <div className="pt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-3.5 rounded-xs ${askBg} shrink-0 shadow-2xs`} />
            <span className="text-slate-500 dark:text-slate-400">
              Seller's Asking: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatInr(safeAsk)}</strong>
            </span>
          </div>
          <span className={`font-semibold text-[11px] ${askStatusColor}`}>
            {askStatus}
          </span>
        </div>
      )}
    </div>
  );
}
