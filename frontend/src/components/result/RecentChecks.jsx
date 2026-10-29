import React from 'react';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { History, Trash2, ArrowUpRight } from 'lucide-react';
import { formatInrShort } from '../../lib/format';

export default function RecentChecks({ history = [], onSelect, onClear }) {
  if (!history || history.length === 0) return null;

  const VERDICT_BADGES = {
    good_deal: { label: 'Good Deal', variant: 'success' },
    fair: { label: 'Fair Price', variant: 'brand' },
    overpriced: { label: 'Overpriced', variant: 'danger' },
  };

  return (
    <Card className="mt-4 border-slate-200 dark:border-slate-800">
      <CardHeader
        title="Recent Valuations"
        subtitle="Last 5 vehicle checks saved locally"
        action={
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition cursor-pointer p-1 rounded"
            title="Clear saved history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        }
      />
      <CardContent className="p-3 divide-y divide-slate-100 dark:divide-slate-800/80">
        {history.map((item, idx) => {
          const v = item.result?.verdict ? VERDICT_BADGES[item.result.verdict] : null;
          return (
            <div
              key={item.id || idx}
              onClick={() => onSelect && onSelect(item)}
              className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition group"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                  <span>{item.car?.brand || 'Car'}</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    ({item.car?.vehicle_age}y • {(item.car?.km_driven / 1000).toFixed(0)}k km)
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {item.car?.fuel_type} • {item.car?.transmission_type}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                    {formatInrShort(item.result?.estimated_price)}
                  </p>
                  {v && (
                    <Badge variant={v.variant} className="text-[10px] py-0 px-1.5">
                      {v.label}
                    </Badge>
                  )}
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

