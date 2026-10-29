import React, { useState, useEffect, useCallback, useRef } from 'react';
import QuickExamples from '../components/form/QuickExamples';
import CarForm from '../components/form/CarForm';
import EmptyResult from '../components/result/EmptyResult';
import LoadingResult from '../components/result/LoadingResult';
import SuccessResult from '../components/result/SuccessResult';
import ErrorResult from '../components/result/ErrorResult';
import RecentChecks from '../components/result/RecentChecks';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { getOptions, predictPrice } from '../api';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

const DEFAULTS = {
  brand: '',
  vehicle_age: 5,
  km_driven: 45000,
  seller_type: 'Individual',
  fuel_type: 'Petrol',
  transmission_type: 'Manual',
  mileage: 21.0,
  engine: 1197,
  max_power: 83.0,
  seats: 5,
  asking_price: '',
};

const STORAGE_KEY = 'fair_price_recent_checks';

export default function PriceChecker() {
  const [options, setOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState(null);

  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // History in localStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const resultPanelRef = useRef(null);

  // ── Load Options on Mount ──
  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const data = await getOptions();
      setOptions(data);
    } catch (err) {
      setOptionsError(err.message || 'Failed to connect to backend API');
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      setForm({
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
      });
      setResult({
        estimated_price: 530000,
        fair_range: { low: 479000, high: 589000 },
        verdict: 'fair',
        difference_percent: -1.9,
        typical_error_inr: 89000,
      });
      setHistory([
        {
          id: 1,
          car: { brand: 'Honda', vehicle_age: 7, km_driven: 75000, fuel_type: 'Diesel', transmission_type: 'Manual' },
          result: { estimated_price: 435000, verdict: 'good_deal' }
        },
        {
          id: 2,
          car: { brand: 'Hyundai', vehicle_age: 3, km_driven: 22000, fuel_type: 'Petrol', transmission_type: 'Automatic' },
          result: { estimated_price: 1150000, verdict: 'overpriced' }
        }
      ]);
    }
  }, [fetchOptions]);

  // ── Save Check to History ──
  const saveToHistory = (newResult, carInput) => {
    try {
      const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        car: {
          brand: carInput.brand,
          vehicle_age: carInput.vehicle_age,
          km_driven: carInput.km_driven,
          fuel_type: carInput.fuel_type,
          transmission_type: carInput.transmission_type,
          asking_price: carInput.asking_price,
        },
        result: newResult,
      };

      const updated = [entry, ...history.filter(h => h.id !== entry.id)].slice(0, 5);
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Safe fallback if storage full or disabled
    }
  };

  const handleClearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch {
      setHistory([]);
    }
  };

  // ── Quick Autofill Chip Handler ──
  const handleQuickAutofill = (exampleData) => {
    setForm(prev => ({
      ...prev,
      ...exampleData,
    }));
    setError(null);
  };

  // ── Select from History ──
  const handleSelectHistory = (item) => {
    if (!item?.car || !item?.result) return;
    setForm(prev => ({
      ...prev,
      ...item.car,
    }));
    setResult(item.result);
    setError(null);

    // Scroll to result on mobile
    if (window.innerWidth < 1024 && resultPanelRef.current) {
      resultPanelRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ── Form Submission ──
  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        brand: form.brand,
        vehicle_age: Number(form.vehicle_age),
        km_driven: Number(form.km_driven),
        seller_type: form.seller_type,
        fuel_type: form.fuel_type,
        transmission_type: form.transmission_type,
        mileage: Number(form.mileage),
        engine: Number(form.engine),
        max_power: Number(form.max_power),
        seats: Number(form.seats),
        asking_price: form.asking_price ? Number(form.asking_price) : null,
      };

      const res = await predictPrice(payload);
      setResult(res);
      saveToHistory(res, payload);

      // On mobile, smoothly scroll down to result card
      if (window.innerWidth < 1024 && resultPanelRef.current) {
        setTimeout(() => {
          resultPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      setError(err.message || 'Price estimation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULTS);
    setResult(null);
    setError(null);
  };

  // ── Render: Options Loading / Error Fallbacks ──
  if (optionsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-pulse">
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="w-full h-14 rounded-xl" />
          <Skeleton className="w-full h-[520px] rounded-2xl" />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="w-full h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (optionsError) {
    return (
      <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-8 text-center max-w-lg mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
            Cannot Connect to Valuation API
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
            {optionsError}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Make sure the FastAPI server is running on <code>http://localhost:8000</code>.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={fetchOptions}
          icon={RefreshCw}
          className="mx-auto"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ── 7 / 5 Column Desktop Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Form (7 cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Example Autofill Chips */}
          <QuickExamples onSelect={handleQuickAutofill} />

          {/* 3-Section Unified Form Card */}
          <CarForm
            options={options}
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            loading={loading}
            onReset={handleReset}
          />
        </div>

        {/* ── Right Column: Sticky Result Panel (5 cols) ── */}
        <div
          ref={resultPanelRef}
          aria-live="polite"
          className="lg:col-span-5 lg:sticky lg:top-24 space-y-4"
        >
          {loading ? (
            <LoadingResult />
          ) : error ? (
            <ErrorResult error={error} onRetry={handleSubmit} />
          ) : result ? (
            <SuccessResult
              result={result}
              carData={form}
              onReset={handleReset}
            />
          ) : (
            <EmptyResult />
          )}

          {/* Recent History Card */}
          <RecentChecks
            history={history}
            onSelect={handleSelectHistory}
            onClear={handleClearHistory}
          />
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            loading={loading}
            onClick={handleSubmit}
            icon={Sparkles}
            className="flex-1 shadow-md"
          >
            {loading ? 'Estimating...' : 'Calculate Fair Price'}
          </Button>

          {result && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                resultPanelRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs shrink-0"
            >
              View Result
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
