import React, { useState } from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import {
  Database,
  Filter,
  Cpu,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Server,
  Layers,
  ArrowRight,
  Code2,
} from 'lucide-react';

const PIPELINE_STEPS = [
  {
    id: 1,
    title: 'Data Collection',
    short: 'Collection',
    icon: Database,
    summary: '15,000+ real pre-owned car listings scraped across major Indian metropolitan hubs.',
    description:
      'We curate authentic Indian pre-owned vehicle records originally collected from CarDekho. Each listing captures real seller specifications including brand, year of manufacture, cumulative odometer distance, fuel variant, transmission type, engine capacity, horsepower, and listed asking price.',
    techDetails: {
      source: 'CarDekho Web Scraper Catalog',
      dimensions: '15,411 raw rows x 13 initial attributes',
      target: 'selling_price (INR Indian Rupees)',
      keyColumns: ['brand', 'vehicle_age', 'km_driven', 'fuel_type', 'transmission', 'engine', 'max_power', 'seats'],
    },
  },
  {
    id: 2,
    title: 'Data Cleaning & Preprocessing',
    short: 'Cleaning',
    icon: Filter,
    summary: 'Deduplication, outlier trimming (1st & 99th percentiles), and logarithmic price normalization.',
    description:
      'To prevent garbage-in, garbage-out, listings with impossible odometers (0 km or >99.5th percentile) and non-sensical prices (< ₹20,000 or >99th percentile) are pruned. Most critically, market prices are log-transformed via log(1 + price). Because Indian car prices are strongly right-skewed by a minority of ₹50L+ luxury cars, the log transform normalizes residual error distributions.',
    techDetails: {
      cleanedRows: '15,015 verified listings retained (97.4% retention rate)',
      logTransform: 'y_trans = np.log1p(selling_price)  # Inverse: np.expm1(y_pred)',
      numericScaling: 'StandardScaler(with_mean=True, with_std=True)',
      categoricalEncoding: 'OneHotEncoder(handle_unknown="ignore", sparse_output=False)',
    },
  },
  {
    id: 3,
    title: 'Two-Stage Feature Selection',
    short: 'Features',
    icon: Cpu,
    summary: 'Collinearity elimination (|r| > 0.85) followed by ANOVA F-statistic ranking (SelectKBest).',
    description:
      'To avoid multicollinearity and overfitting, our pipeline runs a two-tier filter. First, features with Pearson correlation |r| > 0.85 (such as engine displacement and horsepower) are filtered, dropping the redundant variable. Next, an automated ANOVA F-regression ranks all encoded features, selecting the optimal top-k subset determined by cross-validation.',
    techDetails: {
      leakagePrevention: 'Selection operates strictly INSIDE the cross-validated Pipeline on training folds only.',
      collinearityThreshold: '|r| > 0.85 drops redundant predictor',
      scorer: 'f_regression (Scikit-Learn univariate F-test)',
      agreementValidation: 'SelectKBest top rankings verified against Random Forest MDI variance reduction rankings.',
    },
  },
  {
    id: 4,
    title: 'Ensemble Model Training',
    short: 'Training',
    icon: Sparkles,
    summary: 'AdaBoost Regressor (Boosting) benchmarked against a 150-tree Random Forest regressor (Bagging).',
    description:
      'We compare two premier ensemble paradigms: AdaBoost Regressor (Assignment 9, sequential decision tree boosting to reduce bias) and Random Forest Regressor (parallel decision tree bagging to reduce variance). While AdaBoost achieves an impressive R² of 0.9307, Random Forest edges it out with R² = 0.9332 (MAE ₹89,186) and uniquely allows extracting the P10–P90 tree prediction spread to quantify valuation uncertainty.',
    techDetails: {
      adaBoost: 'AdaBoostRegressor(n_estimators=150, learning_rate=0.1, loss="linear")',
      randomForest: 'RandomForestRegressor(n_estimators=150, min_samples_leaf=3, max_features=0.5)',
      crossValidation: '5-Fold CV on log(1 + price) space',
      hyperparameterSearch: 'RandomizedSearchCV with SelectKBest feature selection',
    },
  },
  {
    id: 5,
    title: 'FastAPI Serving & Fair Range',
    short: 'Serving',
    icon: ShieldCheck,
    summary: 'Sub-15ms inference server calculating P10–P90 tree ensemble spread for fair valuation bands.',
    description:
      'The trained scikit-learn pipeline is exported into a lightweight Joblib artifact and pre-warmed in FastAPI memory. When a query arrives, the backend evaluates all 150 trees individually. The 10th and 90th percentiles of tree predictions form the "Fair Range". A wider range indicates tree disagreement and higher valuation ambiguity.',
    techDetails: {
      runtime: 'FastAPI async Python web server (Uvicorn)',
      latency: '< 15ms median response time',
      uncertaintyMetric: 'P10 = np.percentile(tree_preds, 10), P90 = np.percentile(tree_preds, 90)',
      verdictLogic: 'Overpriced (ask > P90), Good Deal (ask < P10), Fair Price (P10 <= ask <= P90)',
    },
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  const scrollToStep = (id) => {
    setActiveStep(id);
    const elem = document.getElementById(`pipeline-step-${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      {/* ── Page Header ── */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <Badge variant="brand" size="sm" icon={Sparkles}>
          Under The Hood
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How the Fair Price Checker Works
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          A transparent look into our data pipeline, feature engineering, and ensemble pricing algorithm.
        </p>
      </div>

      {/* ── Horizontal Stepper ── */}
      <Card className="p-4 sm:p-5 shadow-sm">
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 -z-0" />

          {/* Stepper Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative z-10">
            {PIPELINE_STEPS.map((s) => {
              const StepIcon = s.icon;
              const isActive = activeStep === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToStep(s.id)}
                  className={`flex flex-col items-center p-2.5 rounded-xl text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 ring-2 ring-brand-600 text-brand-700 dark:text-brand-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                  aria-label={`Jump to Step ${s.id}: ${s.title}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold leading-tight line-clamp-1">
                    {s.id}. {s.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── Detailed Pipeline Steps with Accordions ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            End-to-End Machine Learning Pipeline
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            5 Stages • Fully Reproducible
          </span>
        </div>

        {PIPELINE_STEPS.map((s) => {
          const StepIcon = s.icon;
          const isSelected = activeStep === s.id;
          return (
            <Card
              key={s.id}
              id={`pipeline-step-${s.id}`}
              className={`p-6 transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-brand-500/50 shadow-md border-brand-200 dark:border-brand-800'
                  : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 flex items-center justify-center shrink-0 mt-0.5">
                  <StepIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                      Step {s.id} of 5
                    </span>
                    <Badge variant="neutral" size="sm">
                      {s.techDetails.runtime || s.techDetails.dimensions || s.techDetails.source || 'Scikit-Learn'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    {s.summary}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                    {s.description}
                  </p>

                  {/* ── Technical Details Accordion (HeadlessUI Disclosure) ── */}
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <Disclosure>
                      {({ open }) => (
                        <>
                          <DisclosureButton className="flex items-center justify-between w-full text-xs font-semibold text-brand-600 dark:text-brand-400 py-1.5 px-3 rounded-lg bg-brand-50/60 dark:bg-brand-950/40 hover:bg-brand-100/60 dark:hover:bg-brand-900/40 transition-colors cursor-pointer">
                            <span className="flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5" />
                              Technical Specifications & Implementation Details
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                open ? 'rotate-180' : ''
                              }`}
                            />
                          </DisclosureButton>
                          <DisclosurePanel className="mt-2.5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-2 text-slate-700 dark:text-slate-300">
                            {Object.entries(s.techDetails).map(([key, val]) => (
                              <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1">
                                <span className="text-slate-500 dark:text-slate-400 capitalize shrink-0 sm:w-36">
                                  {key.replace(/([A-Z])/g, ' $1')}:
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100 break-all">
                                  {Array.isArray(val) ? val.join(', ') : String(val)}
                                </span>
                              </div>
                            ))}
                          </DisclosurePanel>
                        </>
                      )}
                    </Disclosure>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Limitations & Assumptions Card ── */}
      <Card className="p-6 border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Model Limitations & Safe Usage
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Important market boundaries to consider before negotiating.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Listing Prices vs. Deal Prices
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Our training data captures public asking prices on marketplace listings. Real closed transactions typically settle 5% to 12% below asking price after direct negotiation.
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Physical Condition Unrecorded
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Tabular specs cannot observe paint scratches, chassis rust, tyre tread depth, battery age, flood history, or periodic service records. Always commission an on-site mechanical inspection.
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Rare & Niche Exotic Vehicles
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              Ultra-luxury and rare imports have fewer samples in the catalog. While mainstream brands (Maruti, Hyundai, Honda) maintain high precision, exotic cars show wider tree disagreement.
            </p>
          </div>

          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              Fair Range Definition
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              The 10th-to-90th percentile tree spread represents ensemble variance among 150 randomized decision trees, not an infallible statistical guarantee.
            </p>
          </div>
        </div>
      </Card>

      {/* ── System Architecture Diagram Card ── */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Production Architecture & Offline Training
        </h2>

        <div className="bg-slate-900 text-slate-200 rounded-xl p-4 overflow-x-auto text-xs font-mono leading-relaxed border border-slate-800">
          <pre>{`[Offline Training Phase]
  CarDekho Dataset (~15k rows)
       │
       ▼
  ml/train.py ──▶ 1. Data Cleaning (Trim outliers, log1p price)
               ──▶ 2. Feature Selection (Drop |r| > 0.85, SelectKBest)
               ──▶ 3. 5-Fold Cross-Validated Random Forest Training
               ──▶ 4. Serialize to backend/artifacts/ (model.joblib, options.json, metrics.json)

[Online Inference Phase]
  User Input (Browser)
       │  HTTP POST /api/predict
       ▼
  FastAPI Backend (:8000)
       │  Loads model.joblib at server lifespan startup (zero re-training)
       ▼
  Pipeline Transform ──▶ 150 Decision Trees evaluate in parallel
                      ──▶ np.mean(trees) = Estimated Price (Rs.)
                      ──▶ np.percentile(trees, [10, 90]) = Fair Range Band
                      ──▶ Verdict calculation (Good Deal / Fair / Overpriced)
       │
       ▼  JSON Response (< 15ms)
  React Frontend (Sticky Results Panel + Animated RangeBar)`}</pre>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          The production server performs zero re-training on user queries. Inference executes strictly through the saved pipeline in under 15ms.
        </p>
      </Card>

      {/* ── Tech Stack Summary ── */}
      <Card className="p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Full-Stack Technology Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { layer: 'Machine Learning', stack: 'Scikit-Learn, Pandas, NumPy, Joblib' },
            { layer: 'Inference API', stack: 'FastAPI, Uvicorn, Pydantic v2' },
            { layer: 'Frontend UI', stack: 'React 18, Vite, Tailwind CSS v4' },
            { layer: 'Components', stack: 'Lucide Icons, Headless UI, Framer Motion' },
            { layer: 'Data Visualization', stack: 'Recharts Responsive SVGs' },
            { layer: 'Quality & Testing', stack: 'Pytest, Pytest-Asyncio, HTTPX' },
          ].map((item) => (
            <div
              key={item.layer}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {item.layer}
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {item.stack}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
