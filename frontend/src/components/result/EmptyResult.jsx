import React from 'react';
import Card, { CardContent } from '../ui/Card';
import { Sparkles, CheckCircle2, Sliders, DollarSign } from 'lucide-react';

export default function EmptyResult() {
  const STEPS = [
    {
      num: '1',
      title: 'Enter Car Specs',
      desc: 'Brand, age, kilometres, transmission, and engine power.',
      icon: Sliders,
    },
    {
      num: '2',
      title: 'Add Asking Price',
      desc: 'Optional: add seller\'s quote to get an instant deal verdict.',
      icon: DollarSign,
    },
    {
      num: '3',
      title: 'Receive ML Verdict',
      desc: 'Point estimate, fair range band, and negotiation advice.',
      icon: CheckCircle2,
    },
  ];

  return (
    <Card className="overflow-hidden border-dashed border-2">
      <CardContent className="p-6 text-center">
        {/* Clean geometric car valuation illustration */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
            <path d="M12 18V6" />
          </svg>
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
          Fair Market Value Calculator
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
          Fill in the car's parameters on the left to calculate an unbiased valuation based on 15,000+ real transactions.
        </p>

        {/* 3 Numbered Steps */}
        <div className="space-y-3 text-left">
          {STEPS.map(({ num, title, desc, icon: Icon }) => (
            <div
              key={num}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 transition hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {num}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Real-time Random Forest inference in &lt; 50ms</span>
        </div>
      </CardContent>
    </Card>
  );
}

