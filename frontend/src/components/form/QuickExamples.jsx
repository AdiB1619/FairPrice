import React from 'react';
import { Zap, Car, Shield, Gauge } from 'lucide-react';

export const EXAMPLES = [
  {
    id: 'hatchback',
    label: 'Typical Hatchback',
    tag: 'Maruti • 5y • 45k km',
    icon: Car,
    data: {
      brand: 'Maruti',
      vehicle_age: 5,
      km_driven: 45000,
      seller_type: 'Individual',
      fuel_type: 'Petrol',
      transmission_type: 'Manual',
      mileage: 21.0,
      engine: 1197,
      max_power: 83.0,
      seats: 5,
      asking_price: 520000,
    },
  },
  {
    id: 'sedan',
    label: 'Budget Diesel Sedan',
    tag: 'Honda • 7y • 75k km',
    icon: Shield,
    data: {
      brand: 'Honda',
      vehicle_age: 7,
      km_driven: 75000,
      seller_type: 'Individual',
      fuel_type: 'Diesel',
      transmission_type: 'Manual',
      mileage: 25.8,
      engine: 1498,
      max_power: 98.6,
      seats: 5,
      asking_price: 450000,
    },
  },
  {
    id: 'suv',
    label: 'Premium Automatic',
    tag: 'Hyundai • 3y • 22k km',
    icon: Gauge,
    data: {
      brand: 'Hyundai',
      vehicle_age: 3,
      km_driven: 22000,
      seller_type: 'Dealer',
      fuel_type: 'Petrol',
      transmission_type: 'Automatic',
      mileage: 16.8,
      engine: 1497,
      max_power: 113.4,
      seats: 5,
      asking_price: 1180000,
    },
  },
];

export default function QuickExamples({ onSelect }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        <span>Quick Autofill Examples:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {EXAMPLES.map(ex => {
          const Icon = ex.icon;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelect(ex.data)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-left transition-all duration-150 cursor-pointer shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                  {ex.label}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {ex.tag}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

