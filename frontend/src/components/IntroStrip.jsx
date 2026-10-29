import React from 'react';
import { Database, Target, Layers } from 'lucide-react';
import { formatNumber, formatInrShort } from '../lib/format';
import Skeleton from './ui/Skeleton';

export default function IntroStrip({ metrics, loading }) {
  const rowCount = metrics?.n_rows ? `${formatNumber(metrics.n_rows)}+` : null;
  const typicalError = metrics?.models?.['Random Forest']?.mae
    ? `±${formatInrShort(metrics.models['Random Forest'].mae, 1)}`
    : null;
  const modelCount = metrics?.models ? `${Object.keys(metrics.models).length} Models` : null;

  return (
    <section className="w-full max-h-[160px] overflow-hidden mb-6 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white p-5 sm:p-6 shadow-sm border border-blue-950/40 relative">
      {/* Decorative background grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 h-full">
        {/* Headline block */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
            <span>● Live Market Intelligence</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
            Know the Fair Market Price Before You Negotiate
          </h2>
          <p className="text-xs text-blue-100/80 font-normal line-clamp-1 mt-0.5">
            Transparent price bands & deal verdicts powered by 150-tree Random Forest regression.
          </p>
        </div>

        {/* 3 Trust Stats */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 divide-x divide-blue-700/50">
          {/* Stat 1: Rows */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-700/50 flex items-center justify-center shrink-0 text-blue-200 border border-blue-600/40">
              <Database className="w-4 h-4" />
            </div>
            <div>
              {loading || !rowCount ? (
                <Skeleton className="w-16 h-5 bg-blue-700/60" />
              ) : (
                <p className="text-sm sm:text-base font-bold text-white font-mono leading-none">
                  {rowCount}
                </p>
              )}
              <p className="text-[10px] text-blue-200/70 font-medium uppercase tracking-wider mt-1">
                Listings Evaluated
              </p>
            </div>
          </div>

          {/* Stat 2: Typical Error */}
          <div className="pl-4 sm:pl-6 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/40 flex items-center justify-center shrink-0 text-emerald-300 border border-emerald-600/30">
              <Target className="w-4 h-4" />
            </div>
            <div>
              {loading || !typicalError ? (
                <Skeleton className="w-16 h-5 bg-blue-700/60" />
              ) : (
                <p className="text-sm sm:text-base font-bold text-emerald-300 font-mono leading-none">
                  {typicalError}
                </p>
              )}
              <p className="text-[10px] text-blue-200/70 font-medium uppercase tracking-wider mt-1">
                Typical Error (MAE)
              </p>
            </div>
          </div>

          {/* Stat 3: Models */}
          <div className="pl-4 sm:pl-6 hidden sm:flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-700/40 flex items-center justify-center shrink-0 text-indigo-200 border border-indigo-600/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              {loading || !modelCount ? (
                <Skeleton className="w-16 h-5 bg-blue-700/60" />
              ) : (
                <p className="text-sm sm:text-base font-bold text-white font-mono leading-none">
                  {modelCount}
                </p>
              )}
              <p className="text-[10px] text-blue-200/70 font-medium uppercase tracking-wider mt-1">
                Algorithms Compared
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

