import React, { useState, useEffect } from 'react';
import Card, { CardContent } from '../ui/Card';
import RangeBar from './RangeBar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Tooltip from '../ui/Tooltip';
import Toast from '../ui/Toast';
import { formatInr, formatInrShort, formatPercentDiff } from '../../lib/format';
import {
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Printer,
  RotateCcw,
  HelpCircle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target);
      return;
    }

    const startTime = performance.now();
    let frameId;

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      // Smooth easeOutCubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * ease));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return val;
}

export default function SuccessResult({ result, carData, onReset }) {
  const [toastMessage, setToastMessage] = useState(null);

  const {
    estimated_price,
    fair_range,
    verdict,
    difference_percent,
    typical_error_inr,
  } = result;

  const animatedPrice = useCountUp(estimated_price);

  // Range width indicator calculation
  const spread = fair_range.high - fair_range.low;
  const spreadRatio = spread / (estimated_price || 1);

  let widthCategory = 'Moderate';
  let widthColor = 'brand';
  let widthExplanation = 'The model\'s decision trees have typical consensus for this car profile.';

  if (spreadRatio < 0.20) {
    widthCategory = 'Narrow (High Consensus)';
    widthColor = 'success';
    widthExplanation = 'The model trees agree closely. Many similar cars exist in the dataset.';
  } else if (spreadRatio > 0.38) {
    widthCategory = 'Wide (Varied Consensus)';
    widthColor = 'warning';
    widthExplanation = 'The model trees show higher dispersion due to rare specs, higher age, or fewer comparable listings.';
  }

  // Verdict configs
  const VERDICT_CONFIG = {
    good_deal: {
      label: 'Good Deal',
      badgeVariant: 'success',
      icon: CheckCircle2,
      cardClass:
        'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
      note: 'The asking price is significantly below the fair market range. Verify vehicle mechanical condition and clean paperwork before proceeding.',
    },
    fair: {
      label: 'Fair Price',
      badgeVariant: 'brand',
      icon: ShieldCheck,
      cardClass:
        'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
      note: 'The seller\'s price sits within the expected market value band for this age, specification, and usage.',
    },
    overpriced: {
      label: 'Overpriced',
      badgeVariant: 'danger',
      icon: AlertCircle,
      cardClass:
        'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
      note: 'The asking price is above the fair range band. Consider negotiating down towards the fair range.',
    },
  };

  const currentVerdict = verdict ? VERDICT_CONFIG[verdict] : null;

  // Copy plain-text summary to clipboard
  const handleCopySummary = async () => {
    try {
      const summary = [
        `🚗 Used Car Valuation Summary`,
        `Vehicle: ${carData?.brand || 'Car'} (${carData?.vehicle_age} yrs old, ${carData?.km_driven?.toLocaleString('en-IN')} km, ${carData?.fuel_type}, ${carData?.transmission_type})`,
        `Estimated Fair Price: ${formatInr(estimated_price)}`,
        `Likely Market Range: ${formatInr(fair_range.low)} to ${formatInr(fair_range.high)}`,
        carData?.asking_price ? `Seller Asking Price: ${formatInr(carData.asking_price)}` : '',
        verdict ? `Verdict: ${currentVerdict?.label} (${formatPercentDiff(difference_percent)} vs estimate)` : '',
        `Typical Model Margin: ±${formatInr(typical_error_inr)}`,
        `Generated via FairPrice Checker ML`,
      ]
        .filter(Boolean)
        .join('\n');

      await navigator.clipboard.writeText(summary);
      setToastMessage('Valuation summary copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage('Could not copy to clipboard.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-blue-200/80 dark:border-blue-900/60 shadow-md">
        {/* ── Top Highlight Header: Estimated Price ── */}
        <div className="p-6 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Estimated Fair Market Price
            </span>

            {/* Range Width Confidence Badge */}
            <Tooltip text={widthExplanation} position="left">
              <span className="cursor-help">
                <Badge variant={widthColor} className="text-[11px] font-semibold py-0.5">
                  Band: {widthCategory}
                </Badge>
              </span>
            </Tooltip>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatInr(animatedPrice)}
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Expected bracket: <strong>{formatInr(fair_range.low)}</strong> to <strong>{formatInr(fair_range.high)}</strong>
          </p>
        </div>

        <CardContent className="p-6 space-y-5">
          {/* ── Visual RangeBar ── */}
          <RangeBar
            low={fair_range.low}
            high={fair_range.high}
            estimate={estimated_price}
            asking={carData?.asking_price || null}
          />

          {/* ── Deal Verdict Banner ── */}
          {currentVerdict && (
            <div className={`p-4 rounded-xl border ${currentVerdict.cardClass} space-y-2`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <currentVerdict.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-bold tracking-tight">
                    {currentVerdict.label}
                  </span>
                </div>

                {difference_percent !== null && (
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-2xs">
                    {formatPercentDiff(difference_percent)} vs Estimate
                  </span>
                )}
              </div>

              <p className="text-xs opacity-90 leading-relaxed">
                {currentVerdict.note}
              </p>

              {/* Negotiation hint derived from fair_range if overpriced */}
              {verdict === 'overpriced' && (
                <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-800/60 flex items-start gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-200">
                  <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Negotiation Target: Offer between <strong>{formatInrShort(fair_range.low)}</strong> and <strong>{formatInrShort(fair_range.high)}</strong>.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── Typical Error Margin Note ── */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <div>
              <p>
                <strong>Typical model error:</strong> About ±{formatInr(typical_error_inr)} (MAE on 3,003 test cars).
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Estimates benchmarked against CarDekho listings. Physical inspections may justify adjustments.
              </p>
            </div>
          </div>

          {/* ── Actions Row ── */}
          <div className="pt-2 flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              icon={Copy}
              className="flex-1 min-w-[130px]"
            >
              Copy Summary
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              icon={Printer}
              className="hidden sm:inline-flex"
            >
              Print / PDF
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              icon={RotateCcw}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

