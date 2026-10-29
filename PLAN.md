# Fair Price Checker: Used Car Price Estimator for Indian Buyers

**Type:** Machine Learning minor project (supervised regression), full stack
**Stack:** Python (scikit-learn, FastAPI) + React (Vite) · **Built in:** Google Antigravity
**Duration:** about 4 weeks

---

## Table of contents
1. Project details
2. System architecture
3. Tech stack
4. Folder structure
5. Dataset
6. ML pipeline (preprocessing → feature selection → algorithm)
7. Backend (FastAPI)
8. Frontend (React)
9. Building it in Antigravity: phase-by-phase prompts
10. Testing
11. Running locally and deployment
12. Timeline
13. Report and PPT structure
14. Viva questions and answers
15. Limitations and future scope
16. Final checklist

---

## 1. Project details

### 1.1 Problem statement
Most people buying a used car in India have no reliable way to judge whether a seller's asking price is fair. Dealers and individual sellers know more than the buyer, so buyers often overpay by tens of thousands of rupees.

### 1.2 Proposed solution
A web application where the buyer enters a car's details (brand, age, kilometres driven, fuel, transmission, engine, and so on) and, optionally, the seller's asking price. A trained machine learning model then returns:

- an **estimated fair price**
- a **fair price range** (the likely band)
- a **verdict**: *Good deal*, *Fair* or *Overpriced*, with the percentage difference

The verdict is what turns a regression exercise into a tool people can actually use.

### 1.3 Objectives
1. Clean and prepare real Indian used-car listing data.
2. Select the features that actually drive price, using correlation analysis and SelectKBest.
3. Train and compare two regression models: Linear Regression (baseline) and Random Forest (main).
4. Serve the best model through a REST API (backend).
5. Build a clean web UI (frontend) for live price checking and for showing model insights.

### 1.4 Who it helps
First-time car buyers, families buying through dealers, and anyone negotiating a private sale.

### 1.5 What makes it different from a basic price predictor
- It gives a **range and a verdict**, not only a single number.
- It has an **Insights page** that explains *why* prices behave as they do (feature importance, price vs age).
- It is built as a proper **frontend + backend** system rather than a notebook.
- It reports its own typical error in rupees, so users know how far to trust it.

### 1.6 Functional requirements
| ID | Requirement |
|---|---|
| F1 | User can enter car details through a validated form |
| F2 | System returns an estimated price and a fair range |
| F3 | If the user gives an asking price, the system returns a verdict and percentage difference |
| F4 | Insights page shows model comparison, feature importance, actual vs predicted and price trends |
| F5 | Invalid input shows a clear error message |

### 1.7 Non-functional requirements
- Prediction response in under 1 second.
- Works on desktop and mobile screens.
- Model and code are reproducible (fixed random seed, `requirements.txt`).

---

## 2. System architecture

```
┌──────────────────────────┐   HTTP / JSON    ┌───────────────────────────┐
│  Frontend (React + Vite) │ ───────────────▶ │  Backend (FastAPI)        │
│  • Price Checker page    │ ◀─────────────── │  • /api/options           │
│  • Insights page         │                  │  • /api/predict           │
│  • How it works page     │                  │  • /api/metrics           │
└──────────────────────────┘                  └─────────────┬─────────────┘
                                                            │ loads at startup
                                              ┌─────────────▼─────────────┐
                                              │ artifacts/                │
                                              │  model.joblib (Pipeline)  │
                                              │  options.json             │
                                              │  metrics.json             │
                                              └─────────────▲─────────────┘
                                                            │ produced by
                                              ┌─────────────┴─────────────┐
                                              │ ml/train.py (offline)     │
                                              │ clean → select → train    │
                                              └───────────────────────────┘
```

**Key design idea:** training happens offline in `ml/train.py`. The API never trains; it only loads the saved pipeline. This separation is easy to explain and is how real ML systems work.

---

## 3. Tech stack

| Layer | Tools |
|---|---|
| ML | Python 3.10+, pandas, numpy, scikit-learn, matplotlib, seaborn, joblib |
| Backend | FastAPI, Uvicorn, Pydantic v2 |
| Frontend | React (Vite), Tailwind CSS, Recharts |
| Testing | pytest, httpx (via FastAPI TestClient) |
| IDE | Google Antigravity |
| Optional hosting | Render (backend), Vercel or Netlify (frontend) |

---

## 4. Folder structure

```
fair-price-checker/
├── PLAN.md                    ← this file (keep it in the repo so the agent can read it)
├── README.md
├── ml/
│   ├── data/
│   │   └── cardekho.csv       ← downloaded from Kaggle (not committed if large)
│   ├── notebooks/
│   │   └── 01_eda.ipynb
│   └── train.py
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── artifacts/             ← generated by train.py
│   ├── tests/
│   │   └── test_api.py
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── pages/
        │   ├── PriceChecker.jsx
        │   ├── Insights.jsx
        │   └── HowItWorks.jsx
        └── components/
            ├── ResultCard.jsx
            ├── RangeBar.jsx
            └── Field.jsx
```

---

## 5. Dataset

- **Source:** the larger "CarDekho used car" dataset on Kaggle (about 15,000 rows). Search Kaggle for "cardekho used car data". A smaller file with about 4,300 rows also exists; prefer the larger one because it has more numeric columns, which makes feature selection meaningful.
- Download it and save as `ml/data/cardekho.csv`.
- **Verify the columns after download.** The code below assumes these names; if your file differs, change the constants at the top of `train.py`.

| Type | Columns assumed |
|---|---|
| Numeric | `vehicle_age`, `km_driven`, `mileage`, `engine`, `max_power`, `seats` |
| Categorical | `brand`, `fuel_type`, `transmission_type`, `seller_type` |
| Target | `selling_price` (₹) |
| Ignored | index column (`Unnamed: 0`), `car_name`, `model` |

Note for the report: these are **listing prices from CarDekho at a point in time**, not final negotiated prices.

---

## 6. ML pipeline

This is the part your teacher will grade most closely, so it follows the required order exactly.

### 6.1 Step 1: Data preprocessing
| Task | Detail |
|---|---|
| Remove noise | Drop the index column and duplicate rows |
| Missing values | Check with `df.isna().sum()`; drop or impute (the dataset is mostly complete) |
| Outliers | Keep prices below the 99th percentile; keep `km_driven` below the 99.5th percentile; remove prices under ₹20,000 and `km_driven == 0` |
| Skewed target | Apply `log1p` to price and train on it; convert back with `expm1` for display |
| Encoding | One-hot encode categorical columns (`handle_unknown="ignore"`) |
| Scaling | `StandardScaler` on numeric columns (needed by Linear Regression) |
| Split | 80/20 train/test with a fixed seed |

### 6.2 Step 2: EDA (in `01_eda.ipynb`, for screenshots in your report)
- Price histogram before and after log transform
- Price vs vehicle age; price vs km driven
- Average price by brand (top 10), by fuel type and by transmission
- Correlation heatmap of numeric features

### 6.3 Step 3: Feature selection (two stages plus a cross-check)
1. **Correlation filter:** if two numeric features have |r| > 0.85 (engine and max_power usually do), drop the one that is *less* correlated with price. This removes redundancy.
2. **SelectKBest with `f_regression`:** scores each (encoded) feature by its linear relationship with price and keeps the top *k*. *k* is tuned by cross-validation rather than guessed.
3. **Cross-check:** compare with Random Forest `feature_importances_`. If both methods agree on the top features, say so in the report.

All selection happens **inside a Pipeline fitted on training data only**, which prevents data leakage.

### 6.4 Step 4: Algorithms
| Model | Role | Tuned parameters |
|---|---|---|
| Linear Regression | Simple, explainable baseline | `k` (GridSearchCV) |
| Random Forest Regressor | Main model | `k`, `n_estimators`, `max_depth`, `min_samples_leaf` (RandomizedSearchCV) |

Why compare two? It lets you show *why* the stronger model is needed: price depends non-linearly on age, mileage and brand.

### 6.5 Step 5: Evaluation
- Metrics on the held-out test set, **in rupees**: R², MAE, RMSE.
- Cross-validation R² from the search.
- Plots: actual vs predicted, residuals, feature importance bar chart.
- MAE is the headline number: "on average, the prediction is off by ₹X."

### 6.6 `ml/train.py` (complete script)

```python
"""Train price models and export artifacts for the API.

Run from the backend folder:  python ../ml/train.py
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

SEED = 42
ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "cardekho.csv"
OUT = ROOT.parent / "backend" / "artifacts"
OUT.mkdir(parents=True, exist_ok=True)

# ---- change these if your CSV uses different column names ----
NUM = ["vehicle_age", "km_driven", "mileage", "engine", "max_power", "seats"]
CAT = ["brand", "fuel_type", "transmission_type", "seller_type"]
TARGET = "selling_price"


def load_clean() -> pd.DataFrame:
    """Step 1: preprocessing (cleaning and outlier removal)."""
    df = pd.read_csv(DATA)
    df = df.drop(columns=[c for c in df.columns if c.startswith("Unnamed")])
    df = df.drop_duplicates().dropna(subset=NUM + CAT + [TARGET])
    df = df[(df[TARGET] > 20_000) & (df[TARGET] < df[TARGET].quantile(0.99))]
    df = df[(df["km_driven"] > 0) & (df["km_driven"] < df["km_driven"].quantile(0.995))]
    return df.reset_index(drop=True)


def drop_correlated(train: pd.DataFrame, threshold: float = 0.85) -> list[str]:
    """Step 3a: for each highly correlated pair, drop the one less related to price."""
    corr = train[NUM].corr().abs()
    target_corr = train[NUM].corrwith(train["log_price"]).abs()
    drop = set()
    for i, a in enumerate(NUM):
        for b in NUM[i + 1:]:
            if a in drop or b in drop:
                continue
            if corr.loc[a, b] > threshold:
                drop.add(a if target_corr[a] < target_corr[b] else b)
    return sorted(drop)


def build_pipeline(num_cols, model, k):
    """Encoding and scaling → SelectKBest → model, all in one Pipeline."""
    prep = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT),
    ])
    return Pipeline([
        ("prep", prep),
        ("select", SelectKBest(f_regression, k=k)),
        ("model", model),
    ])


def to_json_safe(o):
    return o.item() if hasattr(o, "item") else str(o)


def main():
    df = load_clean()
    df["log_price"] = np.log1p(df[TARGET])
    print(f"Rows after cleaning: {len(df)}")

    train, test = train_test_split(df, test_size=0.2, random_state=SEED)
    dropped = drop_correlated(train)
    num_cols = [c for c in NUM if c not in dropped]
    cols = num_cols + CAT
    print("Dropped as redundant:", dropped or "none")

    X_tr, X_te = train[cols], test[cols]
    y_tr = train["log_price"]
    actual = test[TARGET].to_numpy()

    searches = {
        "Linear Regression": GridSearchCV(
            build_pipeline(num_cols, LinearRegression(), k=25),
            {"select__k": [10, 15, 20, 25, 30]},
            cv=5, scoring="r2", n_jobs=-1,
        ),
        "Random Forest": RandomizedSearchCV(
            build_pipeline(num_cols, RandomForestRegressor(random_state=SEED, n_jobs=-1), k=25),
            {
                "select__k": [15, 20, 25, 30],
                "model__n_estimators": [100, 200],
                "model__max_depth": [12, 16, 20],
                "model__min_samples_leaf": [2, 3, 5],
            },
            n_iter=12, cv=3, scoring="r2", random_state=SEED, n_jobs=1,
        ),
    }

    results, preds, best = {}, {}, {}
    for name, search in searches.items():
        search.fit(X_tr, y_tr)
        model = search.best_estimator_
        pred = np.expm1(model.predict(X_te))          # back to rupees
        results[name] = {
            "r2": r2_score(actual, pred),
            "mae": mean_absolute_error(actual, pred),
            "rmse": mean_squared_error(actual, pred) ** 0.5,
            "cv_r2_on_log_price": search.best_score_,
            "best_params": search.best_params_,
        }
        preds[name], best[name] = pred, model
        print(name, {k: v for k, v in results[name].items() if k != "best_params"})

    # Feature importance from the Random Forest (cross-check for SelectKBest)
    rf = best["Random Forest"]
    names = rf.named_steps["prep"].get_feature_names_out()
    kept = names[rf.named_steps["select"].get_support()]
    imp = rf.named_steps["model"].feature_importances_
    importance = sorted(
        ({"feature": f.split("__", 1)[1], "importance": float(v)} for f, v in zip(kept, imp)),
        key=lambda d: d["importance"], reverse=True,
    )[:12]

    # Data for the Insights page
    idx = np.random.default_rng(SEED).choice(len(actual), size=min(300, len(actual)), replace=False)
    scatter = [{"actual": float(actual[i]), "predicted": float(preds["Random Forest"][i])} for i in idx]
    by_age = df.groupby("vehicle_age")[TARGET].mean().round(0).reset_index().to_dict("records")
    by_fuel = df.groupby("fuel_type")[TARGET].mean().round(0).reset_index().to_dict("records")

    options = {
        "brand": sorted(df["brand"].unique().tolist()),
        "fuel_type": sorted(df["fuel_type"].unique().tolist()),
        "transmission_type": sorted(df["transmission_type"].unique().tolist()),
        "seller_type": sorted(df["seller_type"].unique().tolist()),
        "ranges": {c: [float(df[c].min()), float(df[c].max())] for c in NUM},
        "columns": cols,
    }
    metrics = {
        "n_rows": len(df),
        "dropped_correlated": dropped,
        "models": results,
        "feature_importance": importance,
        "scatter": scatter,
        "by_age": by_age,
        "by_fuel": by_fuel,
    }

    joblib.dump(rf, OUT / "model.joblib", compress=3)
    (OUT / "options.json").write_text(json.dumps(options, indent=2, default=to_json_safe))
    (OUT / "metrics.json").write_text(json.dumps(metrics, indent=2, default=to_json_safe))
    print("Saved artifacts to", OUT)


if __name__ == "__main__":
    main()
```

**Practical notes**
- A 200-tree forest can produce a very large file. `compress=3` and `max_depth` / `min_samples_leaf` limits keep it small enough for GitHub (100 MB limit) and free hosting.
- If `SelectKBest` raises an error about *k*, the number of encoded features is below your *k*; lower the values in the grid.
- Do not quote any accuracy number in your report until you have run the script on your own machine.

---

## 7. Backend (FastAPI)

### 7.1 API contract

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/options` | Dropdown values and numeric ranges for the form |
| POST | `/api/predict` | Estimated price, fair range and verdict |
| GET | `/api/metrics` | Model comparison, feature importance and chart data |

**POST `/api/predict` request**
```json
{
  "brand": "Maruti",
  "vehicle_age": 5,
  "km_driven": 45000,
  "seller_type": "Individual",
  "fuel_type": "Petrol",
  "transmission_type": "Manual",
  "mileage": 21.0,
  "engine": 1197,
  "max_power": 83.0,
  "seats": 5,
  "asking_price": 520000
}
```
`asking_price` is optional. Use the exact category spellings returned by `/api/options`.

**Response**
```json
{
  "estimated_price": 485000,
  "fair_range": { "low": 432000, "high": 521000 },
  "verdict": "fair",
  "difference_percent": 7.2,
  "typical_error_inr": 62000
}
```
`verdict` is one of `"good_deal"`, `"fair"`, `"overpriced"`, or `null` when no asking price was given.

### 7.2 How the fair range is computed
A Random Forest is many decision trees. Each tree gives its own price guess; the 10th and 90th percentiles of those guesses form the range. A wide range means the trees disagree, so the car is harder to price. The verdict is *Overpriced* if the asking price is above the high end, *Good deal* if below the low end, and *Fair* otherwise.

### 7.3 `backend/requirements.txt`
```
fastapi
uvicorn[standard]
pydantic>=2
pandas
numpy
scikit-learn>=1.2
joblib
matplotlib
seaborn
pytest
httpx
```

### 7.4 `backend/app/main.py`
```python
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ART = Path(__file__).resolve().parent.parent / "artifacts"
state: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    state["pipe"] = joblib.load(ART / "model.joblib")
    state["options"] = json.loads((ART / "options.json").read_text())
    state["metrics"] = json.loads((ART / "metrics.json").read_text())
    yield
    state.clear()


app = FastAPI(title="Fair Price Checker API", lifespan=lifespan)
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])


class CarInput(BaseModel):
    brand: str
    vehicle_age: int = Field(ge=0, le=30)
    km_driven: int = Field(ge=0, le=1_000_000)
    seller_type: str
    fuel_type: str
    transmission_type: str
    mileage: float = Field(gt=0, le=50)
    engine: int = Field(ge=500, le=6000)
    max_power: float = Field(gt=20, le=700)
    seats: int = Field(ge=2, le=10)
    asking_price: int | None = Field(default=None, gt=0)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/options")
def options():
    return state["options"]


@app.get("/api/metrics")
def metrics():
    return state["metrics"]


@app.post("/api/predict")
def predict(car: CarInput):
    opts = state["options"]
    for field in ["brand", "fuel_type", "transmission_type", "seller_type"]:
        if getattr(car, field) not in opts[field]:
            raise HTTPException(422, detail=f"Unknown {field}: {getattr(car, field)}")

    data = car.model_dump(exclude={"asking_price"})
    row = pd.DataFrame([data])[opts["columns"]]    # same columns/order as training

    pipe = state["pipe"]
    estimate = float(np.expm1(pipe.predict(row)[0]))

    # Fair range from the spread of the individual trees
    transformed = pipe[:-1].transform(row)
    forest = pipe.named_steps["model"]
    tree_prices = np.expm1(np.array([t.predict(transformed)[0] for t in forest.estimators_]))
    low, high = np.percentile(tree_prices, [10, 90])
    low, high = min(low, estimate), max(high, estimate)

    verdict, diff = None, None
    if car.asking_price:
        diff = round((car.asking_price - estimate) / estimate * 100, 1)
        if car.asking_price > high:
            verdict = "overpriced"
        elif car.asking_price < low:
            verdict = "good_deal"
        else:
            verdict = "fair"

    return {
        "estimated_price": int(round(estimate, -3)),
        "fair_range": {"low": int(round(low, -3)), "high": int(round(high, -3))},
        "verdict": verdict,
        "difference_percent": diff,
        "typical_error_inr": int(round(state["metrics"]["models"]["Random Forest"]["mae"], -3)),
    }
```

---

## 8. Frontend (React)

### 8.1 Pages
| Page | Contents |
|---|---|
| **Price Checker** (home) | Form on the left, result card on the right |
| **Insights** | Model comparison table, feature importance bar chart, actual vs predicted scatter, average price by age (line), average price by fuel type (bar) |
| **How it works** | Plain-language pipeline explanation: data → cleaning → feature selection → model → API, plus limitations |

Use simple tab state in `App.jsx` for navigation; a router isn't needed for three pages.

### 8.2 Wireframe (Price Checker)
```
┌──────────────────────────────────────────────────────────────────┐
│ Fair Price Checker        [Price Checker] [Insights] [How it works]│
├──────────────────────────────────┬───────────────────────────────┤
│ Car details                      │ Result                        │
│ Brand [▼]        Fuel [▼]        │ Estimated price   ₹4,85,000   │
│ Age (yrs) [5]    Km driven [..]  │ Fair range  ₹4.3L ─●─ ₹5.2L   │
│ Transmission [▼] Seller [▼]      │                               │
│ Mileage [..]  Engine cc [..]     │ ┌───────────────────────────┐ │
│ Max power bhp [..]  Seats [▼]    │ │ OVERPRICED by 18%         │ │
│ Asking price ₹ [optional]        │ └───────────────────────────┘ │
│ [ Check price ]                  │ Typical error: about ±₹62,000 │
└──────────────────────────────────┴───────────────────────────────┘
```

### 8.3 Behaviour rules
- Load dropdown options from `/api/options` on page load (so the UI never hard-codes brands).
- Disable the button and show a spinner while the request runs.
- Show server validation errors in a red alert above the form.
- Format all rupee values with `Intl.NumberFormat("en-IN")`.
- Verdict colours: green for good deal, blue for fair, red for overpriced.
- Always show the typical error line, so users see the limits of the estimate.
- Layout stacks vertically on mobile.

### 8.4 Setup commands
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install recharts tailwindcss @tailwindcss/vite
```
Add the Tailwind plugin to `vite.config.js` and put `@import "tailwindcss";` at the top of `src/index.css`.

### 8.5 `src/api.js`
```js
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = Array.isArray(err.detail) ? err.detail[0]?.msg : err.detail;
    throw new Error(detail ?? "Request failed");
  }
  return res.json();
}

export const getOptions = () => request("/api/options");
export const getMetrics = () => request("/api/metrics");
export const predictPrice = (body) =>
  request("/api/predict", { method: "POST", body: JSON.stringify(body) });
```

### 8.6 Form submission (inside `PriceChecker.jsx`)
HTML inputs return strings, so convert before sending:
```js
const body = {
  ...form,
  vehicle_age: Number(form.vehicle_age),
  km_driven: Number(form.km_driven),
  mileage: Number(form.mileage),
  engine: Number(form.engine),
  max_power: Number(form.max_power),
  seats: Number(form.seats),
  asking_price: form.asking_price ? Number(form.asking_price) : null,
};
const result = await predictPrice(body);
```

### 8.7 `components/ResultCard.jsx`
```jsx
const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const VERDICTS = {
  good_deal: { label: "Good deal", cls: "bg-green-100 text-green-800", note: "Check the car's condition carefully." },
  fair: { label: "Fair price", cls: "bg-blue-100 text-blue-800", note: "The asking price is within the expected range." },
  overpriced: { label: "Overpriced", cls: "bg-red-100 text-red-800", note: "Consider negotiating." },
};

export default function ResultCard({ result }) {
  if (!result) return null;
  const v = result.verdict ? VERDICTS[result.verdict] : null;
  return (
    <div className="rounded-2xl border p-6 space-y-4">
      <div>
        <p className="text-sm text-gray-500">Estimated fair price</p>
        <p className="text-3xl font-semibold">{inr(result.estimated_price)}</p>
        <p className="text-sm text-gray-600">
          Likely range {inr(result.fair_range.low)} to {inr(result.fair_range.high)}
        </p>
      </div>
      {v && (
        <div className={`rounded-xl p-4 ${v.cls}`}>
          <p className="font-semibold">
            {v.label}
            {result.difference_percent !== null &&
              ` (${result.difference_percent > 0 ? "+" : ""}${result.difference_percent}% vs estimate)`}
          </p>
          <p className="text-sm">{v.note}</p>
        </div>
      )}
      <p className="text-xs text-gray-500">
        Typical model error: about ±{inr(result.typical_error_inr)}. Estimates are based on listing prices, not final deals.
      </p>
    </div>
  );
}
```
`RangeBar.jsx` (optional but impressive): a horizontal bar from `low` to `high` with a dot for the estimate and a marker for the asking price.

---

## 9. Building it in Antigravity

### 9.1 How to work
1. Create the folder structure above and open it as a workspace in Antigravity.
2. Save this file as `PLAN.md` in the project root and tell each agent to read it first.
3. Do the phases **in order**. For phases 2 to 4, if your Antigravity setup offers a planning step, have the agent show its plan first and approve it before it writes code.
4. After every phase, run the code yourself and read what the agent wrote. **You must be able to explain every line in the viva.** Ask the agent to explain anything you don't understand.
5. Commit to git after each working phase.

### 9.2 Rules to paste at the start of every prompt
```
Context: read PLAN.md in the project root. Follow its API contract, folder
structure and column names exactly. Do not invent dataset columns; inspect the
real CSV first. Keep the code simple and well commented, as a student would
write it. Do not add libraries that are not in PLAN.md. Do not change files
outside the phase's scope.
```

### 9.3 Phase prompts

**Phase 0: scaffold**
```
Create the folder structure from PLAN.md section 4 with empty placeholder
files, a .gitignore (Python, Node, .venv, ml/data/*.csv, node_modules),
backend/requirements.txt from section 7.3, and a short README. Set up a Python
virtual environment in backend/ and install the requirements.
```

**Phase 1: EDA notebook**
```
I have placed the dataset at ml/data/cardekho.csv. First print its shape,
columns, dtypes and missing values, and tell me if any column name differs from
PLAN.md section 5. Then build ml/notebooks/01_eda.ipynb with the plots listed in
PLAN.md section 6.2. Add a markdown cell under each plot that explains what it
shows in one or two sentences. Save the figures to ml/figures/.
```

**Phase 2: training script**
```
Implement ml/train.py as described in PLAN.md section 6 (use the script in
6.6 as the reference). Adjust column names to match the real CSV. Run it from
backend/ and confirm that backend/artifacts/ contains model.joblib,
options.json and metrics.json. Print a table comparing both models and report
the R2, MAE and RMSE. Do not change the pipeline order: preprocessing, then
feature selection, then model.
```

**Phase 3: backend API**
```
Implement backend/app/main.py and backend/tests/test_api.py following PLAN.md
section 7 and section 10. Start the server with
`uvicorn app.main:app --reload --port 8000` and verify /api/health,
/api/options, /api/metrics and /api/predict with real example requests. Show me
the responses.
```

**Phase 4: frontend**
```
Create the React (Vite) frontend following PLAN.md section 8: Tailwind CSS,
Recharts, three tabs (Price Checker, Insights, How it works), api.js,
ResultCard and RangeBar components. The form must load dropdown values from
/api/options. Use a clean, modern, mobile-friendly design with plenty of white
space. Run it with `npm run dev` and make sure it talks to the backend on
port 8000.
```

**Phase 5: end-to-end check in the browser**
```
With both servers running, open http://localhost:5173 in the browser and test:
1) a normal prediction with no asking price, 2) an asking price far above the
estimate (expect Overpriced), 3) an asking price far below (expect Good deal),
4) an invalid value such as age = -1 (expect a clear error), 5) the Insights
page charts render, 6) mobile width layout. Take screenshots and list any bugs.
Fix the bugs and re-test.
```

**Phase 6: polish and documentation**
```
Update README.md with setup steps, screenshots, architecture diagram and the
model comparison table using the real numbers from metrics.json. Fill in the
"How it works" page text and a limitations section. Check that a fresh clone
can run the project using only the README.
```

---

## 10. Testing

### 10.1 Backend tests: `backend/tests/test_api.py`
Run with `python -m pytest` from the `backend/` folder.

```python
from fastapi.testclient import TestClient

from app.main import app


def make_car(client, **overrides):
    o = client.get("/api/options").json()
    car = {
        "brand": o["brand"][0],
        "vehicle_age": 5,
        "km_driven": 45000,
        "seller_type": o["seller_type"][0],
        "fuel_type": o["fuel_type"][0],
        "transmission_type": o["transmission_type"][0],
        "mileage": 20.0,
        "engine": 1197,
        "max_power": 83.0,
        "seats": 5,
    }
    car.update(overrides)
    return car


def test_health():
    with TestClient(app) as c:
        assert c.get("/api/health").json() == {"status": "ok"}


def test_predict_returns_range():
    with TestClient(app) as c:
        r = c.post("/api/predict", json=make_car(c))
        assert r.status_code == 200
        body = r.json()
        assert body["estimated_price"] > 0
        assert body["fair_range"]["low"] <= body["fair_range"]["high"]
        assert body["verdict"] is None


def test_verdicts():
    with TestClient(app) as c:
        base = c.post("/api/predict", json=make_car(c)).json()
        high = base["fair_range"]["high"]
        low = base["fair_range"]["low"]
        over = c.post("/api/predict", json=make_car(c, asking_price=int(high * 1.5))).json()
        good = c.post("/api/predict", json=make_car(c, asking_price=max(1, int(low * 0.5)))).json()
        assert over["verdict"] == "overpriced"
        assert good["verdict"] == "good_deal"


def test_invalid_input():
    with TestClient(app) as c:
        assert c.post("/api/predict", json=make_car(c, vehicle_age=-1)).status_code == 422
        assert c.post("/api/predict", json=make_car(c, brand="NotABrand")).status_code == 422
```

### 10.2 Manual test cases for the demo
| Case | Input | Expected |
|---|---|---|
| Typical hatchback | 5 yrs, 45,000 km, petrol, manual | Sensible mid-range price |
| Same car, older | 12 yrs | Lower price |
| Same car, very high km | 150,000 km | Lower price |
| Diesel SUV, automatic | Larger engine and power | Higher price |
| Asking price far too high | 1.5× the estimate | Overpriced |

If the model's behaviour contradicts common sense (an older car priced higher), investigate before the demo.

---

## 11. Running locally and deployment

### 11.1 Local run
```bash
# 1. Backend and training
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # macOS / Linux
pip install -r requirements.txt
python ../ml/train.py             # creates backend/artifacts/
uvicorn app.main:app --reload --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                       # http://localhost:5173
```
API documentation is generated automatically at `http://localhost:8000/docs`. It's a good thing to show your teacher.

### 11.2 Optional deployment (free tiers)
- **Backend on Render:** build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, with the **root directory set to `backend`**. Commit the `artifacts/` folder, or run `train.py` in the build step. Set `ALLOWED_ORIGINS` to your frontend URL.
- **Frontend on Vercel or Netlify:** root directory `frontend`, build command `npm run build`, with the environment variable `VITE_API_URL` set to the backend URL.
- Free backends sleep when idle, so the first request can take 30 to 60 seconds. **For the live demo, run everything locally** and keep the deployed link as a backup.

---

## 12. Timeline

| Week | Goals | Deliverable |
|---|---|---|
| 1 | Dataset, EDA, cleaning, scaffold (Phases 0 and 1) | EDA notebook with plots |
| 2 | Feature selection, training, tuning, evaluation (Phase 2) | `train.py`, `metrics.json`, model comparison table |
| 3 | FastAPI backend and React frontend (Phases 3 and 4) | Working app on localhost |
| 4 | Testing, polish, report, PPT, demo rehearsal (Phases 5 and 6) | Final submission |

---

## 13. Report and PPT structure

**Report chapters**
1. Introduction (problem, motivation, objectives)
2. Literature or related work (a short review of existing price tools such as CarDekho and Cars24 valuation pages)
3. Dataset description
4. Methodology: preprocessing, feature selection, algorithms
5. System design: architecture diagram, API, UI screenshots
6. Results: model comparison, plots, error analysis
7. Limitations and future scope
8. Conclusion and references

**PPT (about 12 slides):** title → problem → solution → architecture → dataset → preprocessing → feature selection → models → results table → feature importance chart → **live demo** → limitations and future scope.

**Demo script (3 minutes):** enter a typical car → show the estimate and range → enter an inflated asking price → show *Overpriced* → open Insights and explain the feature importance chart in one sentence.

---

## 14. Viva questions and answers

1. **Why regression and not classification?** Price is a continuous number. The verdict (good/fair/overpriced) is derived from the predicted range.
2. **Why log-transform the price?** Prices are right-skewed. The log makes the distribution closer to normal and stops expensive cars from dominating the error.
3. **How did you do feature selection?** First a correlation filter to remove redundant numeric features, then SelectKBest with `f_regression` with *k* tuned by cross-validation, then a cross-check against Random Forest importances.
4. **What does `f_regression` measure?** The strength of the linear relationship between each feature and the target, as an F-statistic.
5. **What is data leakage and how did you avoid it?** It means information from the test set influencing training. Scaling, encoding and selection live inside a Pipeline fitted on training data only.
6. **Why did Random Forest do better than Linear Regression?** Price depends non-linearly on age, mileage and brand, and trees capture those interactions. (Support this with your own results table.)
7. **Why is MAE your headline metric?** It is in rupees, so a buyer can understand it directly: "off by about ₹X on average".
8. **How is the fair range computed?** From the 10th and 90th percentiles of the predictions made by the individual trees.
9. **What happens with a brand the model hasn't seen?** `handle_unknown="ignore"` prevents a crash, but accuracy will be lower. The UI only offers known brands.
10. **Why separate frontend and backend?** The frontend handles presentation; the backend owns the model. Either can be changed independently, and the API can later serve a mobile app.
11. **Why train offline instead of inside the API?** Training is slow and only needs to happen when data changes. The API only loads the saved pipeline.

---

## 15. Limitations and future scope

**Limitations (say these yourself before the teacher asks)**
- Data is **listing prices at one point in time**, not final sale prices.
- Condition, accident history, number of owners, colour and city are not captured.
- Rare or luxury cars have few rows, so estimates for them are less reliable.
- The fair range reflects model disagreement, not a statistical guarantee.

**Future scope**
- Add `model` and `city` as features (check the dataset has enough rows per value first).
- Extend to used bikes with the bike dataset.
- Try Gradient Boosting or XGBoost and compare.
- Add SHAP plots to explain each individual prediction.
- Periodic retraining as new listings arrive.

---

## 16. Final checklist

- [ ] Dataset downloaded and columns verified
- [ ] EDA notebook with annotated plots
- [ ] `train.py` runs end to end and produces three artifact files
- [ ] Model comparison table with real numbers (R², MAE, RMSE)
- [ ] Feature importance chart and a one-line reading of it
- [ ] API endpoints work and `/docs` loads
- [ ] `pytest` passes
- [ ] Frontend works on desktop and mobile width
- [ ] Verdict shows correctly for high, fair and low asking prices
- [ ] README lets a fresh clone run the project
- [ ] Report and PPT finished; demo rehearsed twice
- [ ] You can explain every file and every pipeline step without notes
