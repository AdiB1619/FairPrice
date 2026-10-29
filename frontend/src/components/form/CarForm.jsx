import React, { useState } from 'react';
import Card, { CardContent } from '../ui/Card';
import Field from '../ui/Field';
import Input from '../ui/Input';
import Segmented from '../ui/Segmented';
import Combobox from '../ui/Combobox';
import Button from '../ui/Button';
import { formatNumber, formatInr } from '../../lib/format';
import {
  Car,
  Activity,
  Zap,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  Info,
} from 'lucide-react';

export default function CarForm({
  options,
  form,
  setForm,
  onSubmit,
  loading = false,
  onReset,
}) {
  const [touched, setTouched] = useState({});

  const ranges = options?.ranges || {};

  // Form field updater
  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation rules using options.ranges
  const errors = {};

  if (!form.brand) {
    errors.brand = 'Please select a car brand';
  }

  if (form.vehicle_age === '' || form.vehicle_age < 0 || form.vehicle_age > 30) {
    errors.vehicle_age = 'Age must be between 0 and 30 years';
  }

  if (
    form.km_driven === '' ||
    Number(form.km_driven) < 100 ||
    Number(form.km_driven) > 1000000
  ) {
    errors.km_driven = 'Enter between 100 and 10,00,000 km';
  }

  if (!form.fuel_type) errors.fuel_type = 'Select fuel type';
  if (!form.transmission_type) errors.transmission_type = 'Select transmission';
  if (!form.seller_type) errors.seller_type = 'Select seller type';

  const minMileage = ranges.mileage?.[0] ?? 5;
  const maxMileage = ranges.mileage?.[1] ?? 50;
  if (
    form.mileage === '' ||
    Number(form.mileage) < minMileage ||
    Number(form.mileage) > maxMileage
  ) {
    errors.mileage = `Range: ${minMileage}–${maxMileage} km/l`;
  }

  const minEngine = ranges.engine?.[0] ?? 500;
  const maxEngine = ranges.engine?.[1] ?? 6000;
  if (
    form.engine === '' ||
    Number(form.engine) < minEngine ||
    Number(form.engine) > maxEngine
  ) {
    errors.engine = `Range: ${Math.round(minEngine)}–${Math.round(maxEngine)} cc`;
  }

  const minPower = ranges.max_power?.[0] ?? 20;
  const maxPower = ranges.max_power?.[1] ?? 650;
  if (
    form.max_power === '' ||
    Number(form.max_power) < minPower ||
    Number(form.max_power) > maxPower
  ) {
    errors.max_power = `Range: ${Math.round(minPower)}–${Math.round(maxPower)} bhp`;
  }

  if (!form.seats) errors.seats = 'Select seats';

  if (form.asking_price && Number(form.asking_price) <= 0) {
    errors.asking_price = 'Asking price must be positive';
  }

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    // mark all touched
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    if (isFormValid) {
      onSubmit();
    }
  };

  // Quick chips for km driven
  const KM_CHIPS = [
    { label: '20k', value: 20000 },
    { label: '50k', value: 50000 },
    { label: '1 Lakh', value: 100000 },
  ];

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="p-5 sm:p-6 space-y-5">
          {/* ══════════════════════════════════════════════════════
              SECTION 1: VEHICLE BASICS
          ══════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
              <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>1. Basics & Identity</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Brand Searchable Combobox */}
              <Field
                id="brand"
                label="Brand"
                required
                error={touched.brand ? errors.brand : undefined}
              >
                <Combobox
                  options={options?.brand || []}
                  value={form.brand}
                  onChange={(val) => {
                    updateField('brand', val);
                    setTouched(prev => ({ ...prev, brand: true }));
                  }}
                  placeholder="Search brand (e.g. Maruti, Hyundai)..."
                  error={touched.brand && Boolean(errors.brand)}
                />
              </Field>

              {/* Fuel Type Segmented */}
              <Field
                id="fuel_type"
                label="Fuel Type"
                required
                error={touched.fuel_type ? errors.fuel_type : undefined}
              >
                <Segmented
                  id="fuel_type"
                  size="sm"
                  options={options?.fuel_type || ['Petrol', 'Diesel', 'CNG']}
                  value={form.fuel_type}
                  onChange={(val) => updateField('fuel_type', val)}
                />
              </Field>

              {/* Transmission Segmented */}
              <Field
                id="transmission_type"
                label="Transmission"
                required
                error={touched.transmission_type ? errors.transmission_type : undefined}
              >
                <Segmented
                  id="transmission_type"
                  size="sm"
                  options={options?.transmission_type || ['Manual', 'Automatic']}
                  value={form.transmission_type}
                  onChange={(val) => updateField('transmission_type', val)}
                />
              </Field>

              {/* Seller Type Segmented */}
              <Field
                id="seller_type"
                label="Seller Type"
                required
                error={touched.seller_type ? errors.seller_type : undefined}
              >
                <Segmented
                  id="seller_type"
                  size="sm"
                  options={options?.seller_type || ['Individual', 'Dealer', 'Trustmark Dealer']}
                  value={form.seller_type}
                  onChange={(val) => updateField('seller_type', val)}
                />
              </Field>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              SECTION 2: USAGE & CONDITION
          ══════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>2. Usage & Age</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start">
              {/* Vehicle Age: Stepper + Slider */}
              <Field
                id="vehicle_age"
                label="Vehicle Age (Years)"
                hint={`${form.vehicle_age || 0} years old`}
                required
                error={touched.vehicle_age ? errors.vehicle_age : undefined}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease age"
                      onClick={() => updateField('vehicle_age', Math.max(0, Number(form.vehicle_age || 0) - 1))}
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition shrink-0 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <Input
                      id="vehicle_age"
                      type="number"
                      min="0"
                      max="30"
                      value={form.vehicle_age}
                      onChange={(e) => updateField('vehicle_age', e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={() => handleBlur('vehicle_age')}
                      suffix="YRS"
                      className="text-center font-bold"
                    />

                    <button
                      type="button"
                      aria-label="Increase age"
                      onClick={() => updateField('vehicle_age', Math.min(30, Number(form.vehicle_age || 0) + 1))}
                      className="w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    aria-label="Vehicle age slider"
                    value={form.vehicle_age || 0}
                    onChange={(e) => updateField('vehicle_age', Number(e.target.value))}
                    className="w-full accent-blue-600 dark:accent-blue-400 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                </div>
              </Field>

              {/* Km Driven with Quick Chips */}
              <Field
                id="km_driven"
                label="Kilometres Driven"
                hint={form.km_driven ? `${formatNumber(Number(form.km_driven))} km` : 'Odometer'}
                required
                error={touched.km_driven ? errors.km_driven : undefined}
              >
                <div className="space-y-1.5">
                  <Input
                    id="km_driven"
                    type="number"
                    min="100"
                    step="1000"
                    placeholder="e.g. 45000"
                    value={form.km_driven}
                    onChange={(e) => updateField('km_driven', e.target.value === '' ? '' : Number(e.target.value))}
                    onBlur={() => handleBlur('km_driven')}
                    suffix="KM"
                    error={touched.km_driven && errors.km_driven}
                  />

                  {/* Quick Chips */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400">Quick:</span>
                    {KM_CHIPS.map(chip => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => updateField('km_driven', chip.value)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border font-medium transition cursor-pointer ${
                          Number(form.km_driven) === chip.value
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Field>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              SECTION 3: PERFORMANCE & ASKING PRICE
          ══════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>3. Performance & Price Quote</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Mileage */}
              <Field
                id="mileage"
                label="Mileage"
                hint={`${minMileage}–${maxMileage}`}
                required
                error={touched.mileage ? errors.mileage : undefined}
              >
                <Input
                  id="mileage"
                  type="number"
                  step="0.1"
                  placeholder="21.0"
                  value={form.mileage}
                  onChange={(e) => updateField('mileage', e.target.value)}
                  onBlur={() => handleBlur('mileage')}
                  suffix="km/l"
                  error={touched.mileage && errors.mileage}
                />
              </Field>

              {/* Engine */}
              <Field
                id="engine"
                label="Engine"
                hint={`${Math.round(minEngine)}–${Math.round(maxEngine)}`}
                required
                error={touched.engine ? errors.engine : undefined}
              >
                <Input
                  id="engine"
                  type="number"
                  placeholder="1197"
                  value={form.engine}
                  onChange={(e) => updateField('engine', e.target.value)}
                  onBlur={() => handleBlur('engine')}
                  suffix="cc"
                  error={touched.engine && errors.engine}
                />
              </Field>

              {/* Max Power */}
              <Field
                id="max_power"
                label="Max Power"
                hint={`${Math.round(minPower)}–${Math.round(maxPower)}`}
                required
                error={touched.max_power ? errors.max_power : undefined}
              >
                <Input
                  id="max_power"
                  type="number"
                  step="0.1"
                  placeholder="83.0"
                  value={form.max_power}
                  onChange={(e) => updateField('max_power', e.target.value)}
                  onBlur={() => handleBlur('max_power')}
                  suffix="bhp"
                  error={touched.max_power && errors.max_power}
                />
              </Field>

              {/* Seats Segmented */}
              <Field
                id="seats"
                label="Seats"
                required
                error={touched.seats ? errors.seats : undefined}
              >
                <Segmented
                  id="seats"
                  size="sm"
                  options={['4', '5', '7', '8']}
                  value={String(form.seats || '5')}
                  onChange={(val) => updateField('seats', Number(val))}
                />
              </Field>
            </div>

            {/* Optional Asking Price */}
            <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
              <Field
                id="asking_price"
                label="Seller's Asking Price (Optional)"
                hint={form.asking_price ? `Formatted: ${formatInr(Number(form.asking_price))}` : 'Add quote to get Good Deal / Fair / Overpriced verdict'}
                error={touched.asking_price ? errors.asking_price : undefined}
              >
                <Input
                  id="asking_price"
                  type="number"
                  step="5000"
                  placeholder="e.g. 520000"
                  prefix="₹"
                  value={form.asking_price || ''}
                  onChange={(e) => updateField('asking_price', e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={() => handleBlur('asking_price')}
                  error={touched.asking_price && errors.asking_price}
                />
              </Field>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              SUBMIT & RESET BUTTONS
          ══════════════════════════════════════════════════════ */}
          <div className="pt-2 flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!isFormValid || loading}
              icon={Sparkles}
              className="flex-1 shadow-md shadow-blue-500/20"
            >
              {loading ? 'Estimating Fair Market Value...' : 'Calculate Fair Price'}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onReset}
              icon={RotateCcw}
              className="shrink-0"
              title="Reset all inputs"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}

