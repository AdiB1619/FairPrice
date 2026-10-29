import React from 'react';
import { ShieldAlert, Database, Cpu } from 'lucide-react';

export default function Footer({ onNav }) {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Source */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-sm">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Data Source</span>
            </div>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              Trained on ~15,000 sanitized Indian used-car listings from CarDekho. Numerical specifications (engine, power, mileage) and categorical attributes (fuel, transmission, brand) are standard features.
            </p>
          </div>

          {/* Column 2: Disclaimer */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Market Disclaimer</span>
            </div>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              Estimates reflect seller listing prices at a snapshot in time, not final executed deal amounts. Real-world vehicle condition, title clearance, tyre wear, accident history, and local demand should always be inspected physically.
            </p>
          </div>

          {/* Column 3: Architecture & Credits */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 text-sm">
              <Cpu className="w-4 h-4 text-indigo-500" />
              <span>System Stack</span>
            </div>
            <p className="leading-relaxed text-slate-500 dark:text-slate-400">
              Random Forest Regressor (R² = 0.9332) with tree-spread uncertainty bands. Served via FastAPI and React (Vite) as an academic supervised regression project.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FairPrice Logo" className="h-6 w-auto object-contain" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">FairPrice India</span>
            <span>•</span>
            <p>© {new Date().getFullYear()} FairPrice Checker. Built for academic & research evaluation.</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNav('checker')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Price Checker
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNav('insights')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Insights
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onNav('howit')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              How It Works
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

