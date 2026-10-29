"""Train price models and export artifacts for the API.

Run from the project root:  python ml/train.py
Or from the backend folder:  python ../ml/train.py

Steps implemented (following PLAN.md section 6):
  1. Load and clean the CarDekho dataset (outlier removal, duplicate drop)
  2. Log-transform the target (selling_price → log_price)
  3. 80/20 train/test split with a fixed seed
  4. Correlation-based redundancy filter on numeric features
  5. Build a preprocessing → SelectKBest → model Pipeline
  6. Tune Linear Regression (GridSearchCV) and Random Forest (RandomizedSearchCV)
  7. Evaluate on the held-out test set: R², MAE, RMSE (in rupees)
  8. Save model.joblib, options.json, and metrics.json to backend/artifacts/
"""

import json
import sys
import warnings
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import (
    GridSearchCV,
    RandomizedSearchCV,
    cross_val_score,
    train_test_split,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings("ignore")

# ── paths ──────────────────────────────────────────────────────────────────────
SEED = 42
ROOT = Path(__file__).resolve().parent          # ml/
DATA = ROOT / "data" / "cardekho.csv"
OUT  = ROOT.parent / "backend" / "artifacts"
OUT.mkdir(parents=True, exist_ok=True)

# ── column config (change here if CSV uses different names) ───────────────────
NUM    = ["vehicle_age", "km_driven", "mileage", "engine", "max_power", "seats"]
CAT    = ["brand", "fuel_type", "transmission_type", "seller_type"]
TARGET = "selling_price"


# ── Step 1: preprocessing ─────────────────────────────────────────────────────

def load_clean() -> pd.DataFrame:
    """Load CSV and apply cleaning rules from PLAN.md §6.1."""
    if not DATA.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATA}.\n"
            "Download from Kaggle ('cardekho used car data') and save as ml/data/cardekho.csv"
        )

    df = pd.read_csv(DATA)

    # ── inspect and report ──
    print(f"\n{'='*60}")
    print(f"Raw dataset shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    missing = df.isna().sum()
    print(f"\nMissing values:\n{missing[missing > 0]}")

    # ── drop unnamed index columns ──
    df = df.drop(columns=[c for c in df.columns if c.startswith("Unnamed")], errors="ignore")

    # ── standardise column names (handle common variants) ──
    rename_map = {
        "name":      "car_name",
        "year":      "vehicle_age",   # will convert below if it's a year column
        "fuel":      "fuel_type",
        "seller_type": "seller_type",
        "transmission": "transmission_type",
        "owner":     "seller_type",   # only if no seller_type present
        "km_driven": "km_driven",
        "mileage":   "mileage",
        "engine":    "engine",
        "max_power": "max_power",
        "seats":     "seats",
        "selling_price": "selling_price",
    }
    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns and v not in df.columns})

    # If 'year' was the manufacture year, convert to vehicle_age
    if "vehicle_age" in df.columns and df["vehicle_age"].max() > 100:
        current_year = 2024
        df["vehicle_age"] = current_year - df["vehicle_age"]
        print("Converted 'year' column to vehicle_age (years old).")

    # ── parse numeric columns that may have units embedded (e.g. "1197 CC", "83.0 bhp") ──
    for col in ["mileage", "engine", "max_power"]:
        if col in df.columns and df[col].dtype == object:
            df[col] = pd.to_numeric(df[col].astype(str).str.extract(r"([\d.]+)")[0], errors="coerce")

    # ── ensure required columns exist ──
    missing_cols = [c for c in NUM + CAT + [TARGET] if c not in df.columns]
    if missing_cols:
        raise ValueError(
            f"The following required columns are missing from the CSV:\n{missing_cols}\n"
            f"Available columns: {df.columns.tolist()}\n"
            "Update NUM / CAT / TARGET at the top of train.py to match your CSV."
        )

    # ── drop rows with missing values in required columns ──
    before = len(df)
    df = df.dropna(subset=NUM + CAT + [TARGET])
    print(f"\nDropped {before - len(df)} rows with missing values in required columns.")

    # ── remove duplicates ──
    before = len(df)
    df = df.drop_duplicates()
    print(f"Dropped {before - len(df)} duplicate rows.")

    # ── outlier removal (price) ──
    p99 = df[TARGET].quantile(0.99)
    df = df[(df[TARGET] > 20_000) & (df[TARGET] < p99)]

    # ── outlier removal (km_driven) ──
    p995 = df["km_driven"].quantile(0.995)
    df = df[(df["km_driven"] > 0) & (df["km_driven"] < p995)]

    # ── vehicle_age sanity check ──
    df = df[(df["vehicle_age"] >= 0) & (df["vehicle_age"] <= 30)]

    print(f"\nRows after cleaning: {len(df)}")
    print(f"Price range: Rs. {df[TARGET].min():,.0f} - Rs. {df[TARGET].max():,.0f}")
    print(f"{'='*60}\n")

    return df.reset_index(drop=True)


# ── Step 3a: correlation-based redundancy filter ──────────────────────────────

def drop_correlated(train: pd.DataFrame, threshold: float = 0.85) -> list[str]:
    """Drop one feature from each pair with |r| > threshold.

    Between the two, drop the one less correlated with log_price
    (so we keep the most informative feature).
    """
    available_num = [c for c in NUM if c in train.columns]
    corr = train[available_num].corr().abs()
    target_corr = train[available_num].corrwith(train["log_price"]).abs()
    drop: set[str] = set()

    for i, a in enumerate(available_num):
        for b in available_num[i + 1:]:
            if a in drop or b in drop:
                continue
            if corr.loc[a, b] > threshold:
                loser = a if target_corr[a] < target_corr[b] else b
                drop.add(loser)
                print(f"  Correlation filter: dropping '{loser}' (r={corr.loc[a,b]:.2f} with '{b if loser==a else a}')")

    return sorted(drop)


# ── Step 4: pipeline factory ──────────────────────────────────────────────────

def build_pipeline(num_cols: list[str], model, k: int = 20) -> Pipeline:
    """Preprocessing → SelectKBest → model (all inside one Pipeline).

    The Pipeline ensures encoding, scaling and selection are fitted
    only on training data, preventing any data leakage.
    """
    prep = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT),
        ],
        remainder="drop",
    )
    return Pipeline([
        ("prep",   prep),
        ("select", SelectKBest(f_regression, k=k)),
        ("model",  model),
    ])


def to_json_safe(obj):
    """Convert numpy scalars to Python natives for JSON serialisation."""
    if hasattr(obj, "item"):
        return obj.item()
    return str(obj)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    # ── load and clean ──
    df = load_clean()
    df["log_price"] = np.log1p(df[TARGET])

    # ── train / test split ──
    train, test = train_test_split(df, test_size=0.2, random_state=SEED)
    print(f"Train: {len(train)} rows | Test: {len(test)} rows")

    # ── Step 3a: drop correlated numeric features ──
    print("\nCorrelation filter:")
    dropped = drop_correlated(train)
    if not dropped:
        print("  No features dropped (no pair above threshold).")
    num_cols = [c for c in NUM if c in df.columns and c not in dropped]
    cols = num_cols + CAT
    print(f"Using features: {cols}\n")

    X_tr = train[cols]
    X_te = test[cols]
    y_tr = train["log_price"]
    actual = test[TARGET].to_numpy()

    # ── determine max k (total encoded features after ColumnTransformer) ──
    _temp = build_pipeline(num_cols, LinearRegression(), k=1)
    _temp_fitted = Pipeline(_temp.steps[:-2])   # just the prep step
    _temp_fitted.fit(X_tr, y_tr)
    max_features = _temp_fitted[-1].transform(X_tr).shape[1]
    print(f"Total encoded features available: {max_features}")

    # Clip k candidates so they never exceed actual feature count
    k_candidates = [k for k in [10, 15, 20, 25, 30, 35] if k <= max_features]
    if not k_candidates:
        k_candidates = [max_features]
    print(f"k search space: {k_candidates}\n")

    # ── Step 4 + 5: train and evaluate both models ──
    searches = {
        "Linear Regression": GridSearchCV(
            build_pipeline(num_cols, LinearRegression(), k=k_candidates[-1]),
            {"select__k": k_candidates},
            cv=5, scoring="r2", n_jobs=-1, verbose=0,
        ),
        "Random Forest": RandomizedSearchCV(
            build_pipeline(
                num_cols,
                RandomForestRegressor(random_state=SEED, n_jobs=-1),
                k=k_candidates[-1],
            ),
            {
                "select__k":            k_candidates,
                "model__n_estimators":  [150, 200, 250],
                "model__max_depth":     [12, 16, 20, None],
                "model__min_samples_leaf": [1, 2, 3],
                "model__max_features":  ["sqrt", "log2", 0.5],
            },
            n_iter=20, cv=5, scoring="r2", random_state=SEED, n_jobs=1, verbose=1,
        ),
    }

    results: dict = {}
    preds:   dict = {}
    best:    dict = {}

    print("=" * 60)
    for name, search in searches.items():
        print(f"\nTraining: {name} ...")
        search.fit(X_tr, y_tr)
        pipe = search.best_estimator_
        pred_log = pipe.predict(X_te)
        pred = np.expm1(pred_log)          # back to actual rupees

        r2   = r2_score(actual, pred)
        mae  = mean_absolute_error(actual, pred)
        rmse = mean_squared_error(actual, pred) ** 0.5

        results[name] = {
            "r2":               round(r2,  4),
            "mae":              round(mae, 0),
            "rmse":             round(rmse, 0),
            "cv_r2_on_log_price": round(search.best_score_, 4),
            "best_params":      {str(k): to_json_safe(v) for k, v in search.best_params_.items()},
        }
        preds[name] = pred
        best[name]  = pipe

        print(f"  Best params: {search.best_params_}")
        print(f"  CV R2      : {search.best_score_:.4f}")
        print(f"  Test  R2   : {r2:.4f}")
        print(f"  Test  MAE  : Rs. {mae:,.0f}")
        print(f"  Test  RMSE : Rs. {rmse:,.0f}")

    print("\n" + "=" * 60)
    print("\nModel comparison (test set, prices in Rs.):")
    print(f"{'Model':<20} {'R2':>8} {'MAE':>12} {'RMSE':>14}")
    print("-" * 60)
    for name, r in results.items():
        print(f"{name:<20} {r['r2']:>8.4f} Rs. {r['mae']:>10,.0f} Rs. {r['rmse']:>12,.0f}")

    # ── Feature importance cross-check (Step 3b from PLAN.md) ──
    rf_pipe  = best["Random Forest"]
    prep_out = rf_pipe.named_steps["prep"].get_feature_names_out()
    kept_mask = rf_pipe.named_steps["select"].get_support()
    kept_names = prep_out[kept_mask]
    rf_imp = rf_pipe.named_steps["model"].feature_importances_

    importance = sorted(
        [
            {
                "feature":    f.split("__", 1)[-1],   # strip "num__" / "cat__" prefix
                "importance": float(v),
            }
            for f, v in zip(kept_names, rf_imp)
        ],
        key=lambda d: d["importance"],
        reverse=True,
    )[:12]

    print("\nTop features (Random Forest importances, post SelectKBest):")
    for item in importance:
        bar = "#" * int(item["importance"] * 200)
        print(f"  {item['feature']:<30} {item['importance']:.4f}  {bar}")

    # ── Data for Insights charts ──
    rng = np.random.default_rng(SEED)
    idx = rng.choice(len(actual), size=min(400, len(actual)), replace=False)
    scatter = [
        {"actual": float(actual[i]), "predicted": float(preds["Random Forest"][i])}
        for i in idx
    ]
    by_age  = (
        df.groupby("vehicle_age")[TARGET].mean()
          .round(0).reset_index()
          .rename(columns={"vehicle_age": "vehicle_age", TARGET: "avg_price"})
          .to_dict("records")
    )
    by_fuel = (
        df.groupby("fuel_type")[TARGET].mean()
          .round(0).reset_index()
          .rename(columns={TARGET: "avg_price"})
          .to_dict("records")
    )

    # ── options.json: dynamic dropdown values for the frontend ──
    options = {
        "brand":             sorted(df["brand"].unique().tolist()),
        "fuel_type":         sorted(df["fuel_type"].unique().tolist()),
        "transmission_type": sorted(df["transmission_type"].unique().tolist()),
        "seller_type":       sorted(df["seller_type"].unique().tolist()),
        "ranges": {
            c: [float(df[c].min()), float(df[c].max())]
            for c in num_cols
        },
        "columns": cols,      # used by the API to order DataFrame columns correctly
    }

    # ── metrics.json: evaluation data for the Insights page ──
    metrics = {
        "n_rows":              len(df),
        "dropped_correlated":  dropped,
        "num_features_used":   num_cols,
        "models":              results,
        "feature_importance":  importance,
        "scatter":             scatter,
        "by_age":              by_age,
        "by_fuel":             by_fuel,
    }

    # ── save artifacts ──
    print(f"\nSaving artifacts to {OUT} ...")
    joblib.dump(rf_pipe, OUT / "model.joblib", compress=3)
    (OUT / "options.json").write_text(json.dumps(options, indent=2, default=to_json_safe), encoding="utf-8")
    (OUT / "metrics.json").write_text(json.dumps(metrics, indent=2, default=to_json_safe), encoding="utf-8")
    print("Done. Artifacts saved:")
    print(f"  {OUT / 'model.joblib'}")
    print(f"  {OUT / 'options.json'}")
    print(f"  {OUT / 'metrics.json'}")


if __name__ == "__main__":
    main()

