"""Backend API tests.

Run from the backend/ folder:
    python -m pytest -v

All tests use FastAPI's TestClient (synchronous), which handles
the lifespan context manager correctly.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


# ── helpers ───────────────────────────────────────────────────────────────────

def make_car(client: TestClient, **overrides) -> dict:
    """Build a valid car payload using the first available option for each dropdown."""
    o = client.get("/api/options").json()
    car = {
        "brand":             o["brand"][0],
        "vehicle_age":       5,
        "km_driven":         45_000,
        "seller_type":       o["seller_type"][0],
        "fuel_type":         o["fuel_type"][0],
        "transmission_type": o["transmission_type"][0],
        "mileage":           20.0,
        "engine":            1197,
        "max_power":         83.0,
        "seats":             5,
    }
    car.update(overrides)
    return car


# ── tests ─────────────────────────────────────────────────────────────────────

def test_health():
    """Health endpoint should return status ok."""
    with TestClient(app) as c:
        resp = c.get("/api/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


def test_options_has_required_keys():
    """Options endpoint must return all keys the form depends on."""
    with TestClient(app) as c:
        resp = c.get("/api/options")
        assert resp.status_code == 200
        body = resp.json()
        for key in ["brand", "fuel_type", "transmission_type", "seller_type", "ranges", "columns"]:
            assert key in body, f"Missing key in /api/options: {key}"
        assert len(body["brand"]) > 0


def test_metrics_has_required_keys():
    """Metrics endpoint must return model comparison and chart data."""
    with TestClient(app) as c:
        resp = c.get("/api/metrics")
        assert resp.status_code == 200
        body = resp.json()
        for key in ["models", "feature_importance", "scatter", "by_age", "by_fuel"]:
            assert key in body, f"Missing key in /api/metrics: {key}"
        assert "Random Forest" in body["models"]


def test_predict_no_asking_price():
    """Prediction without asking_price should return estimate and range but no verdict."""
    with TestClient(app) as c:
        resp = c.post("/api/predict", json=make_car(c))
        assert resp.status_code == 200
        body = resp.json()
        assert body["estimated_price"] > 0
        assert body["fair_range"]["low"] <= body["estimated_price"]
        assert body["fair_range"]["high"] >= body["estimated_price"]
        assert body["verdict"] is None
        assert body["difference_percent"] is None
        assert body["typical_error_inr"] > 0


def test_predict_overpriced():
    """Asking price well above the fair range should return 'overpriced'."""
    with TestClient(app) as c:
        base = c.post("/api/predict", json=make_car(c)).json()
        high = base["fair_range"]["high"]
        over = c.post("/api/predict", json=make_car(c, asking_price=int(high * 2))).json()
        assert over["verdict"] == "overpriced"
        assert over["difference_percent"] > 0


def test_predict_good_deal():
    """Asking price well below the fair range should return 'good_deal'."""
    with TestClient(app) as c:
        base = c.post("/api/predict", json=make_car(c)).json()
        low  = base["fair_range"]["low"]
        good = c.post("/api/predict", json=make_car(c, asking_price=max(1000, int(low * 0.4)))).json()
        assert good["verdict"] == "good_deal"
        assert good["difference_percent"] < 0


def test_predict_fair():
    """Asking price equal to the estimate should return 'fair'."""
    with TestClient(app) as c:
        base = c.post("/api/predict", json=make_car(c)).json()
        est  = base["estimated_price"]
        fair = c.post("/api/predict", json=make_car(c, asking_price=est)).json()
        assert fair["verdict"] == "fair"


def test_invalid_age():
    """Negative vehicle_age must be rejected with HTTP 422."""
    with TestClient(app) as c:
        resp = c.post("/api/predict", json=make_car(c, vehicle_age=-1))
        assert resp.status_code == 422


def test_invalid_brand():
    """Unknown brand must be rejected with HTTP 422."""
    with TestClient(app) as c:
        resp = c.post("/api/predict", json=make_car(c, brand="NotARealBrand_XYZ"))
        assert resp.status_code == 422


def test_invalid_fuel():
    """Unknown fuel_type must be rejected with HTTP 422."""
    with TestClient(app) as c:
        resp = c.post("/api/predict", json=make_car(c, fuel_type="Warp Drive"))
        assert resp.status_code == 422


def test_older_car_cheaper():
    """A 12-year-old car should be estimated cheaper than a 3-year-old otherwise identical car."""
    with TestClient(app) as c:
        young = c.post("/api/predict", json=make_car(c, vehicle_age=3)).json()
        old   = c.post("/api/predict", json=make_car(c, vehicle_age=12)).json()
        assert old["estimated_price"] < young["estimated_price"], (
            "Model failed sanity check: older car priced higher than newer car."
        )


def test_high_km_cheaper():
    """A high-mileage car should be estimated cheaper than a low-mileage one."""
    with TestClient(app) as c:
        low_km  = c.post("/api/predict", json=make_car(c, km_driven=10_000)).json()
        high_km = c.post("/api/predict", json=make_car(c, km_driven=200_000)).json()
        assert high_km["estimated_price"] < low_km["estimated_price"], (
            "Model failed sanity check: high-km car priced higher than low-km car."
        )


def test_fair_range_ordering():
    """low must always be <= estimated_price <= high."""
    with TestClient(app) as c:
        for brand in c.get("/api/options").json()["brand"][:5]:
            body = c.post("/api/predict", json=make_car(c, brand=brand)).json()
            assert body["fair_range"]["low"]  <= body["estimated_price"]
            assert body["fair_range"]["high"] >= body["estimated_price"]

