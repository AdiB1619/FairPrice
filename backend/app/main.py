"""Fair Price Checker — FastAPI Backend

Endpoints:
  GET  /api/health     → liveness check
  GET  /api/options    → dropdown values + numeric ranges for the form
  POST /api/predict    → estimated price, fair range, verdict
  GET  /api/metrics    → model comparison, feature importance, chart data

The model pipeline is loaded once at startup (lifespan context manager).
It is never retrained here; run ml/train.py to update it.
"""

import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# ── paths ─────────────────────────────────────────────────────────────────────
ART = Path(__file__).resolve().parent.parent / "artifacts"

# Shared in-memory state loaded at startup
state: dict = {}


# ── startup / shutdown ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load artifacts once when the server starts; clear on shutdown."""
    required = ["model.joblib", "options.json", "metrics.json"]
    missing = [f for f in required if not (ART / f).exists()]
    if missing:
        raise RuntimeError(
            f"Missing artifact files: {missing}\n"
            "Run `python ml/train.py` from the project root first."
        )

    state["pipe"]    = joblib.load(ART / "model.joblib")
    state["options"] = json.loads((ART / "options.json").read_text(encoding="utf-8"))
    state["metrics"] = json.loads((ART / "metrics.json").read_text(encoding="utf-8"))
    state["mae"]     = state["metrics"]["models"]["Random Forest"]["mae"]
    print("Artifacts loaded successfully. API ready.")
    yield
    state.clear()


# ── app ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Fair Price Checker API",
    description=(
        "Estimates a fair market price for used cars in India based on a "
        "Random Forest model trained on CarDekho listing data."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS: allow the React dev server (and any configured origins)
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── request / response schemas ────────────────────────────────────────────────

class CarInput(BaseModel):
    """All fields the frontend form collects.

    Categorical values must match the strings returned by /api/options exactly.
    asking_price is optional; omit it to get only an estimate (no verdict).
    """
    brand:             str
    vehicle_age:       int   = Field(ge=0,   le=30,        description="Age of the car in years")
    km_driven:         int   = Field(ge=100, le=1_000_000, description="Total kilometres driven")
    seller_type:       str
    fuel_type:         str
    transmission_type: str
    mileage:           float = Field(gt=0,   le=60,        description="Fuel efficiency in km/l or km/kg")
    engine:            int   = Field(ge=500, le=6_500,     description="Engine displacement in cc")
    max_power:         float = Field(gt=15,  le=700,       description="Maximum power in bhp")
    seats:             int   = Field(ge=2,   le=10,        description="Number of seats")
    asking_price:      Optional[int] = Field(default=None, gt=0,
                                             description="Seller's asking price in ₹ (optional)")

    @field_validator("brand", "fuel_type", "transmission_type", "seller_type", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class FairRange(BaseModel):
    low:  int
    high: int


class PredictResponse(BaseModel):
    estimated_price:   int
    fair_range:        FairRange
    verdict:           Optional[str]   # "good_deal" | "fair" | "overpriced" | null
    difference_percent: Optional[float]
    typical_error_inr: int


# ── endpoints ─────────────────────────────────────────────────────────────────

@app.get("/api/health", tags=["system"])
def health():
    """Liveness check."""
    return {"status": "ok"}


@app.get("/api/options", tags=["data"])
def options():
    """Return dropdown values and numeric ranges for the form.

    The frontend uses this to build select lists and input placeholders
    dynamically, without hard-coding any data in the UI.
    """
    return state["options"]


@app.get("/api/metrics", tags=["data"])
def metrics():
    """Return model comparison, feature importance and chart data.

    Used by the Insights page.
    """
    return state["metrics"]


@app.post("/api/predict", response_model=PredictResponse, tags=["prediction"])
def predict(car: CarInput):
    """Estimate a fair market price for the described car.

    Returns:
    - estimated_price: the model's point estimate (rounded to nearest ₹1,000)
    - fair_range: [P10, P90] across the individual Random Forest trees
    - verdict: good_deal / fair / overpriced (only when asking_price is given)
    - difference_percent: how far asking_price is from the estimate
    - typical_error_inr: the model's MAE on the test set
    """
    opts = state["options"]

    # ── validate categorical values ──
    for field in ["brand", "fuel_type", "transmission_type", "seller_type"]:
        val = getattr(car, field)
        if val not in opts[field]:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Unknown {field}: '{val}'. "
                    f"Valid values: {opts[field]}"
                ),
            )

    # ── build the input DataFrame in the same column order used during training ──
    data = car.model_dump(exclude={"asking_price"})
    try:
        row = pd.DataFrame([data])[opts["columns"]]
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Column mismatch: {e}")

    pipe = state["pipe"]

    # ── point estimate ──
    log_pred = pipe.predict(row)[0]
    estimate = float(np.expm1(log_pred))

    # ── fair range: spread of individual tree predictions ──
    # Transform the row through all steps except the final estimator
    transformed = pipe[:-1].transform(row)
    forest = pipe.named_steps["model"]
    tree_prices = np.expm1(
        np.array([tree.predict(transformed)[0] for tree in forest.estimators_])
    )
    low  = float(np.percentile(tree_prices, 10))
    high = float(np.percentile(tree_prices, 90))

    # Guarantee the point estimate sits within [low, high]
    low  = min(low,  estimate)
    high = max(high, estimate)

    # ── verdict ──
    verdict: Optional[str] = None
    diff:    Optional[float] = None

    if car.asking_price:
        diff = round((car.asking_price - estimate) / estimate * 100, 1)
        if car.asking_price > high:
            verdict = "overpriced"
        elif car.asking_price < low:
            verdict = "good_deal"
        else:
            verdict = "fair"

    return PredictResponse(
        estimated_price    = int(round(estimate, -3)),
        fair_range         = FairRange(
                                 low  = int(round(low,  -3)),
                                 high = int(round(high, -3)),
                             ),
        verdict            = verdict,
        difference_percent = diff,
        typical_error_inr  = int(round(state["mae"], -3)),
    )

