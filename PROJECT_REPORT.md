# JSPM’s
# RAJARSHI SHAHU COLLEGE OF ENGINEERING
### TATHAWADE, PUNE-33
**(An Empowered Autonomous Institute Affiliated to Savitribai Phule Pune University, Pune)**

---

<br>

## A Mini Project Report
on
# “FairPrice: Used Car Valuation and Fair Market Range Estimation Using Ensemble Machine Learning”

<br>

**Course:** Machine Learning (CS3201T)  
**Academic Year:** 2026–27  
**Semester:** Semester-I  
**Class & Division:** TY Div B  

<br>

### -Submitted by-

| Name of Student | Roll No | PRN No |
| :--- | :---: | :---: |
| **Aditya Bachute** | *(Your Roll No)* | *(Your PRN No)* |

<br>

**Under the Guidance of:**  
Department of Computer Engineering  
JSPM’s Rajarshi Shahu College of Engineering, Pune-33  

---

<div style="page-break-after: always;"></div>

## Table of Contents

1. [Title](#1-title)
2. [Abstract](#2-abstract)
3. [Introduction](#3-introduction)
4. [Problem Statement](#4-problem-statement)
5. [Objectives](#5-objectives)
6. [Dataset and Libraries Required](#6-dataset-and-libraries-required)
7. [Approach / Methodology](#7-approach--methodology)
8. [Implementation](#8-implementation)
9. [Results & Discussion](#9-results--discussion)
10. [Conclusion & Future Scope](#10-conclusion--future-scope)

---

<div style="page-break-after: always;"></div>

## 1. Title

**FairPrice: Used Car Valuation and Fair Market Range Estimation Using Ensemble Machine Learning**

---

## 2. Abstract

The Indian pre-owned automobile industry is characterized by significant pricing opacity, fragmented dealer networks, and asymmetric information between buyers and sellers. Conventional automated valuation tools typically act as commercial lead-generation funnels that output single, inflated asking quotes while concealing their mathematical error margins. 

This project presents **FairPrice**, an end-to-end machine learning system engineered to predict fair market prices for used cars and quantify valuation ambiguity through ensemble variance. Trained on a curated corpus of **15,015 authentic Indian marketplace listings** from CarDekho, the system employs logarithmic target transformation ($\log(1+p)$) to counteract heavy luxury price skewness, standardized feature scaling, collinearity pruning ($|r| > 0.85$), and ANOVA F-regression feature selection (`SelectKBest`). 

We benchmarked two major supervised ensemble paradigms: **AdaBoost Regressor (Sequential Boosting)** and **Random Forest Regressor (Parallel Bagging)**. On a 20% held-out test split of 3,003 unseen vehicles, Random Forest achieved an **$R^2$ of 0.9332**, explaining **93.32% of market price variance** with a **Mean Absolute Error (MAE) of ₹89,186** and a **Median Absolute Percentage Error (MdAPE) of 9.59%**, outperforming AdaBoost ($R^2 = 0.9307$, MAE = ₹95,804). 

Crucially, by harvesting the individual leaf predictions across all 150 randomized decision trees, the system extracts the **10th and 90th percentile tree spread (P10–P90)** to construct a calibrated **Fair Market Range**. This interval is evaluated against seller asking quotes to trigger three-tier deal verdicts (*Good Deal*, *Fair Price*, *Overpriced*) and generate automated counter-offer targets. The trained pipeline is served via an asynchronous **FastAPI microservice (<15 ms inference latency)** and presented through a responsive **React 18 frontend** equipped with live Recharts visualizations, interactive steppers, and accessible UI controls.

---

## 3. Introduction

### 3.1 Background
Over the past decade, the Indian pre-owned car market has outpaced the new car market in volume, driven by rising personal mobility demand, rapid urban expansion, and shortening ownership cycles. However, unlike organized financial securities or real estate, used vehicle pricing is uniquely non-linear and multidimensional. A vehicle's residual valuation is dictated by an interplay of continuous mechanical wear (odometer mileage, engine displacement, brake horsepower), temporal decay (vehicle age), fuel dynamics (petrol vs. diesel vs. CNG), and non-tangible brand equity.

### 3.2 Motivation
In an unregulated open marketplace, consumers face two critical hurdles:
1. **The Depreciation Cliff:** Vehicles experience steep, non-linear depreciation within the first 3 to 4 years (losing 35% to 45% of ex-showroom value), after which the rate of depreciation flattens out into an asymptote. Traditional linear pricing formulas fail to fit this curve.
2. **The "Lemons" Problem and Inherent Noise:** Two vehicles with identical specifications (e.g., a 2018 Hyundai i20 with 56,000 km) may settle at widely different transaction prices depending on physical condition, tyre life, and cosmetic wear. Existing commercial platforms provide a single deterministic price point, misleading buyers into false certainty.

### 3.3 Contribution
This project implements an open, mathematically grounded alternative. By implementing **Ensemble Machine Learning** with tree-level variance extraction, **FairPrice** equips Indian car buyers with:
- A high-precision baseline valuation ($R^2 > 93\%$).
- An uncertainty-aware negotiation bracket (P10 to P90).
- Actionable counter-offer intelligence derived from actual market listings.

---

## 4. Problem Statement

> *"To design, train, and deploy an automated machine learning regression system that accurately estimates the fair market resale value of pre-owned cars in the Indian automotive market based on physical and technical specifications, while quantifying epistemic prediction uncertainty (P10–P90 range) to determine whether a seller's quoted price represents a Good Deal, Fair Price, or Overpriced listing."*

### Mathematical Formulation
Given a feature vector:
$$\mathbf{x} = [x_{\text{brand}}, x_{\text{age}}, x_{\text{km}}, x_{\text{fuel}}, x_{\text{transmission}}, x_{\text{seller}}, x_{\text{mileage}}, x_{\text{engine}}, x_{\text{power}}, x_{\text{seats}}]^T$$

The learning objective is to estimate a continuous response function:
$$f: \mathcal{X} \to \mathbb{R}^+ \quad \text{such that} \quad \hat{y} = f(\mathbf{x}) \approx y_{\text{selling\_price}}$$

While minimizing the empirical risk under the $L_1$ and $L_2$ loss norms:
$$\mathcal{L}_{\text{MAE}} = \frac{1}{N}\sum_{i=1}^N |y_i - \hat{y}_i|, \qquad \mathcal{L}_{\text{RMSE}} = \sqrt{\frac{1}{N}\sum_{i=1}^N (y_i - \hat{y}_i)^2}$$

Additionally, the system must compute the bounded prediction interval:
$$\mathcal{I}(\mathbf{x}) = \left[ P_{10}(\{T_m(\mathbf{x})\}_{m=1}^M), \, P_{90}(\{T_m(\mathbf{x})\}_{m=1}^M) \right]$$
where $T_m(\mathbf{x})$ represents the prediction of the $m$-th individual decision tree in an ensemble of $M = 150$ estimators.

---

## 5. Objectives

1. **Data Preprocessing & Sanitization:** Curate and clean a raw Indian used car dataset (~15,411 rows) by handling missing values, dropping duplicates, removing extreme outliers, and normalizing right-skewed prices via log-transformation.
2. **Feature Engineering & Selection:** Implement automated categorical encoding, numerical standardization, collinearity filtering ($|r| > 0.85$), and ANOVA F-regression feature ranking (`SelectKBest`) within an end-to-end data pipeline.
3. **Model Development & Comparative Benchmarking:** Train and optimize two distinct supervised ensemble paradigms:
   - **AdaBoost Regressor** (Sequential Boosting, Course Assignment 9)
   - **Random Forest Regressor** (Parallel Bagging, Production Champion)
4. **Uncertainty Quantification:** Implement a percentile extraction algorithm across 150 decision tree estimators to compute the P10–P90 Fair Market Range.
5. **Full-Stack Deployment:** Export optimized pipeline artifacts into a lightweight Joblib file, develop an asynchronous FastAPI backend for real-time inference, and design a modern, responsive React 18 user interface.
6. **Industrial Benchmarking:** Validate model valuations against live commercial platforms (CarDekho SmartPrice, Droom Orange Book Value) to verify practical negotiation bounds.

---

## 6. Dataset and Libraries Required

### 6.1 Dataset Description
The system is trained on the **CarDekho Indian Used Car Dataset**, capturing pre-owned vehicle transactions and verified listings across major Indian metropolitan hubs (Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai).

* **Raw Observations:** 15,411 rows $\times$ 14 attributes
* **Cleaned Observations:** 15,015 records (97.43% retention rate)
* **Target Feature:** `selling_price` (Continuous integer in INR, ₹20,000 to ₹45,00,000)

#### Attribute Dictionary
| Attribute Name | Data Type | Representation | Description & Domain Range |
| :--- | :---: | :---: | :--- |
| `brand` | Categorical | Nominal (32 Brands) | Manufacturer (Maruti, Hyundai, Honda, Toyota, etc.) |
| `vehicle_age` | Numeric | Discrete Integer | Age of vehicle in years ($0 \le \text{age} \le 29$) |
| `km_driven` | Numeric | Continuous Integer | Cumulative odometer reading ($100 \le \text{km} \le 3,80,000$) |
| `fuel_type` | Categorical | Nominal (5 Classes) | Petrol, Diesel, CNG, LPG, Electric |
| `transmission_type` | Categorical | Binary | Manual, Automatic |
| `seller_type` | Categorical | Nominal (3 Classes) | Individual, Dealer, Trustmark Dealer |
| `mileage` | Numeric | Continuous Float | Fuel economy in km/litre ($7.5 \le \text{mileage} \le 33.54$) |
| `engine` | Numeric | Continuous Integer | Engine displacement in cubic centimeters ($793 \le cc \le 5000$) |
| `max_power` | Numeric | Continuous Float | Maximum engine output in brake horsepower ($38.4 \le bhp \le 400$) |
| `seats` | Numeric | Discrete Integer | Seating capacity ($4, 5, 7, 8$) |
| `selling_price` | Numeric | Continuous Target | Listed market price in INR (Target variable $y$) |

### 6.2 Libraries and Software Tools

#### Python Backend & Machine Learning Stack
* **Python 3.10+ / 3.13**: Primary programming language.
* **Scikit-Learn (v1.5+)**: Core ML library (`RandomForestRegressor`, `AdaBoostRegressor`, `DecisionTreeRegressor`, `SelectKBest`, `ColumnTransformer`, `Pipeline`, `StandardScaler`, `OneHotEncoder`).
* **Pandas (v2.2+) & NumPy (v2.0+)**: Data manipulation, vector math, and log-transformations.
* **FastAPI (v0.115+) & Uvicorn**: High-performance asynchronous REST API framework.
* **Pydantic (v2.0+)**: Request body parsing and strict schema validation.
* **Joblib (v1.4+)**: Serialization of trained pipeline artifacts.
* **Pytest & HTTPX**: Automated API test suite execution.

#### Frontend UI Stack
* **React 18**: Component-based declarative frontend library.
* **Vite 5**: Optimized frontend bundler and HMR dev server.
* **Tailwind CSS v4**: Utility-first styling with `@theme` design tokens.
* **Recharts (v2.12+)**: Responsive SVG charting library for interactive analytics.
* **Headless UI & Lucide React**: Accessible interactive comboboxes, accordions, and icons.

---

## 7. Approach / Methodology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. DATA INGESTION & AUDIT                      │
│               CarDekho Raw Corpus (15,411 Records, 14 Cols)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     2. CLEANING & LOG NORMALIZATION                    │
│   • Drop duplicates (167 rows) & missing values (0)                   │
│   • Outlier Trimming: price (1st & 99th pct), km (99.5th pct)          │
│   • Target Transform: y_trans = np.log1p(selling_price)                │
│   • Cleaned Dataset: 15,015 Records (₹40,000 to ₹45,00,000)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 3. REPRODUCIBLE TRAIN / TEST PARTITION                 │
│         80% Training (12,012 samples) | 20% Holdout Test (3,003)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│         4. PIPELINE PREPROCESSING (Zero Leakage Cross-Validation)       │
│   • Continuous Features (6): StandardScaler()                          │
│   • Categorical Features (4): OneHotEncoder(handle_unknown='ignore')    │
│   • Collinearity Audit: Pearson |r| > 0.85 (max 0.80 -> 0 dropped)     │
│   • Univariate Selection: SelectKBest(score_func=f_regression, k)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               5. ENSEMBLE HYPERPARAMETER OPTIMIZATION (5-Fold CV)      │
│   ├── AdaBoost Regressor (Sequential Boosting, 150 Trees, lr=0.1)      │
│   └── Random Forest Regressor (Parallel Bagging, 150 Trees, leaf=3)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               6. EVALUATION ON UNSEEN TEST SET (3,003 Cars)            │
│   • Inverse Transform: pred_rupees = np.expm1(pred_log)                │
│   • Metrics: R², MAE (₹), RMSE (₹), MdAPE (%), Tolerance Bands         │
│   • Monotonicity & Slice Analysis across Budget, Age, and Brands       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 7. UNCERTAINTY EXTRACTION & PRODUCTION DEPLOYMENT      │
│   • Export pipeline to backend/artifacts/model.joblib                  │
│   • FastAPI serving: Tree percentile evaluation -> P10 & P90           │
│   • React UI: Interactive 7/5 split, RangeBar, and Deal Verdicts       │
└────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Target Log-Transformation
The distribution of selling prices in the pre-owned market exhibits extreme positive (right) skewness due to a minority of ultra-luxury vehicles. In standard regression, squared-error loss ($\mathcal{L}_2$) on raw currency causes estimators to prioritize minimizing absolute errors on ₹50 Lakh luxury vehicles while sacrificing relative percentage accuracy on ₹3 Lakh budget cars.

To resolve this, we apply the natural logarithmic transformation:
$$z = \ln(1 + y) = \text{log1p}(y)$$
This stabilizes residual variance (homoscedasticity) and maps multiplicative relative price errors into additive linear errors. Upon inference, the continuous estimate is inverted back to Rupee denominations via:
$$\hat{y} = \exp(\hat{z}) - 1 = \text{expm1}(\hat{z})$$

### 7.2 Two-Stage Feature Engineering & Selection
1. **Collinearity Filter:** A Pearson correlation analysis was performed on all continuous features. The highest observed inter-feature correlation was $r = 0.8005$ (between `engine` and `max_power`). Because this did not exceed the predefined threshold of $|r| > 0.85$, all original physical attributes were retained.
2. **One-Hot Encoding:** Categorical features (`brand`, `fuel_type`, `transmission_type`, `seller_type`) were expanded into 37 binary indicator columns with `handle_unknown='ignore'`.
3. **Univariate Selection (`SelectKBest`):** Using ANOVA F-regression statistics, features were ranked by their linear dependency on $\ln(1+y)$, and the optimal subset $k$ was tuned through cross-validation.

### 7.3 Ensemble Modeling: Boosting vs. Bagging
Two ensemble methodologies were selected from the course curriculum:
* **AdaBoost Regressor (Assignment 9):** Implements **sequential boosting**. Weak decision tree learners ($\text{max\_depth}=9$) are trained iteratively; at each step, observation weights are recalculated based on linear prediction errors, forcing subsequent estimators to specialize in previously mispriced vehicles.
* **Random Forest Regressor (Production Champion):** Implements **parallel bagging** with feature subspace randomization. By aggregating 150 deep randomized trees trained on bootstrap samples with `max_features=0.5` and `min_samples_leaf=3`, the ensemble substantially reduces variance without increasing bias.

### 7.4 Epistemic Uncertainty & The Fair Market Range
Single-point estimates do not convey model confidence. In **FairPrice**, for every query vector $\mathbf{x}$, all $M = 150$ constituent decision trees in the fitted Random Forest are evaluated individually:
$$\hat{y}_m = \text{expm1}(T_m(\mathbf{x})), \quad \forall m \in \{1, 2, \dots, 150\}$$

The ensemble point estimate is the mean:
$$\hat{y}_{\text{estimate}} = \frac{1}{M}\sum_{m=1}^M \hat{y}_m$$

The **Fair Market Range** is defined by the 10th and 90th empirical percentiles:
$$P_{10} = \text{Percentile}(\{\hat{y}_m\}, 10), \qquad P_{90} = \text{Percentile}(\{\hat{y}_m\}, 90)$$

If the seller provides an asking price $P_{\text{ask}}$, the system evaluates:
$$\text{Verdict} = \begin{cases} 
\text{Good Deal} & \text{if } P_{\text{ask}} < P_{10} \\
\text{Fair Price} & \text{if } P_{10} \le P_{\text{ask}} \le P_{90} \\
\text{Overpriced} & \text{if } P_{\text{ask}} > P_{90} 
\end{cases}$$
When classified as **Overpriced**, the system generates an algorithmic counter-offer: *"A fair transaction target is ₹$P_{10}$ to ₹$P_{90}$."*

---

## 8. Implementation

### 8.1 Machine Learning Training Pipeline (`ml/train.py`)
The pipeline constructs a clean `ColumnTransformer` and executes hyperparameter search across 5 cross-validation folds:

```python
# Preprocessing ColumnTransformer
prep = ColumnTransformer([
    ("num", StandardScaler(), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CAT)
])

# Complete Pipeline Encapsulation
pipeline = Pipeline([
    ("prep", prep),
    ("select", SelectKBest(f_regression, k=35)),
    ("model", RandomForestRegressor(
        n_estimators=150,
        min_samples_leaf=3,
        max_features=0.5,
        random_state=42,
        n_jobs=-1
    ))
])

# Training on Log-Transformed Target
pipeline.fit(X_train, y_train_log)

# Inference and Evaluation on Test Set in Real Rupees
pred_log = pipeline.predict(X_test)
pred_rupees = np.expm1(pred_log)

r2 = r2_score(actual_rupees, pred_rupees)
mae = mean_absolute_error(actual_rupees, pred_rupees)
rmse = np.sqrt(mean_squared_error(actual_rupees, pred_rupees))
```

### 8.2 FastAPI Inference Microservice (`backend/app/main.py`)
The server pre-loads serialized artifacts on lifespan startup, accepting JSON payloads and executing vector predictions in under 15 milliseconds:

```python
@app.post("/api/predict", response_model=PredictResponse)
def predict_price(payload: CarFeatures):
    # Convert incoming JSON into aligned DataFrame
    df_input = pd.DataFrame([payload.model_dump()])
    
    # Predict point estimate
    pred_log = model_pipeline.predict(df_input)[0]
    estimated_price = round(float(np.expm1(pred_log)))
    
    # Extract individual tree leaf predictions for P10-P90
    rf_model = model_pipeline.named_steps["model"]
    prep_steps = Pipeline(model_pipeline.steps[:-1])
    transformed_features = prep_steps.transform(df_input)
    
    tree_preds = [
        float(np.expm1(tree.predict(transformed_features)[0]))
        for tree in rf_model.estimators_
    ]
    p10 = round(float(np.percentile(tree_preds, 10)))
    p90 = round(float(np.percentile(tree_preds, 90)))
    
    # Calculate Deal Verdict
    verdict = "fair"
    if payload.asking_price:
        if payload.asking_price < p10:
            verdict = "good_deal"
        elif payload.asking_price > p90:
            verdict = "overpriced"
            
    return PredictResponse(
        estimated_price=estimated_price,
        fair_range={"low": p10, "high": p90},
        verdict=verdict,
        typical_error_inr=89186
    )
```

### 8.3 Frontend UI Architecture
* **`PriceChecker.jsx`**: Responsive 7/5 desktop split with quick-autofill chips, 3-section structured form, and sticky live results.
* **`RangeBar.jsx`**: Visual dynamic scale rendering the fair band, model point estimate, and seller asking marker with overflow protection.
* **`Insights.jsx`**: Lazy-loaded analytical dashboard with KPI cards, model comparison table, actual-vs-predicted scatter charts, and depreciation curves.
* **`HowItWorks.jsx`**: Interactive 5-stage stepper with Headless UI collapsible disclosure accordions detailing the mathematical formulas.

---

## 9. Results & Discussion

### 9.1 Model Benchmark Comparison (Test Set: $N = 3,003$)
Evaluated on the identical 20% holdout test set:

| Model Architecture | Paradigm | Test $R^2$ | Test MAE (₹) | Test RMSE (₹) | 5-Fold CV $R^2$ (Log) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **AdaBoost Regressor** | Sequential Boosting | 0.9307 | ₹95,804 | ₹1,60,752 | 0.9196 |
| **Random Forest (Champion)**| **Parallel Bagging** | **0.9332** | **₹89,186** | **₹1,57,778** | **0.9276** |
| **Improvement** | — | **+0.25% $R^2$** | **-₹6,618 MAE** | **-₹2,974 RMSE** | **+0.0080 CV** |

* **Discussion:** Both ensemble methods delivered high accuracy ($>93\%$). Random Forest achieved the lowest error metrics and was selected for production because its individual tree structure uniquely supports P10–P90 uncertainty extraction, whereas AdaBoost outputs a single weighted point estimate.

### 9.2 Prediction Accuracy Tolerance Bands
Distribution of absolute percentage error on unseen test vehicles:
* **Within $\pm 5\%$ of Market Value:** 27.84% of vehicles
* **Within $\pm 10\%$ of Market Value:** **51.52% of vehicles**
* **Within $\pm 15\%$ of Market Value:** **69.10% of vehicles**
* **Within $\pm 20\%$ of Market Value:** 81.02% of vehicles
* **Within $\pm 25\%$ of Market Value:** 88.58% of vehicles

*Insight:* Over **69.1% of all vehicles** fall within $\pm 15\%$, which aligns with the standard negotiation threshold in the Indian pre-owned market.

### 9.3 Error Bias & Symmetry
* **Mean Residual:** -₹15,395 (-2.11% of average vehicle price)
* **Median Residual:** -₹2,642 (effectively centered on zero)
* **Directional Balance:** 48.3% over-predicted vs. 51.7% under-predicted (near-perfect 50/50 balance, proving the absence of systematic lowballing or inflation).

### 9.4 Granular Subgroup Slice Analysis

#### By Budget Category
| Segment | Count | MAE | Median APE | Within $\pm 15\%$ |
| :--- | :---: | :---: | :---: | :---: |
| **Budget ($< ₹3\text{ Lakhs}$)** | 402 | ₹39,614 | 14.5% | 50.5% |
| **Mid-range ($₹3\text{L} - ₹6\text{L}$)** | 1,211 | ₹52,216 | **9.1%** | **71.6%** |
| **Upper Mid ($₹6\text{L} - ₹12\text{L}$)** | 1,031 | ₹85,183 | **8.6%** | **75.4%** |
| **Premium ($> ₹12\text{ Lakhs}$)** | 359 | ₹2,80,898 | 10.2% | 63.5% |

#### By Major Automakers
| Brand | Volume | Mean Market Price | MAE | Median % Error | Model $R^2$ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Maruti Suzuki** | 948 | ₹4,84,880 | ₹50,887 | **9.2%** | **0.9115** |
| **Hyundai** | 584 | ₹5,80,517 | ₹59,930 | **8.7%** | **0.9107** |
| **Honda** | 295 | ₹6,05,681 | ₹62,842 | **7.7%** | **0.8819** |
| **Mahindra** | 212 | ₹8,08,599 | ₹98,728 | **9.3%** | **0.8448** |
| **Toyota** | 150 | ₹13,56,093 | ₹1,49,677 | **9.1%** | **0.9020** |

### 9.5 Feature Importance Analysis (MDI Variance Reduction)
The top predictors driving variance reduction across all 150 trees:
1. **Max Engine Power (`max_power`):** **38.86%**
2. **Vehicle Age (`vehicle_age`):** **23.87%**
3. **Engine Displacement (`engine`):** **17.50%**
4. **Transmission (`Automatic`):** **5.12%**
5. **Kilometres Driven (`km_driven`):** **3.01%**
6. **Fuel Economy (`mileage`):** **2.90%**

*Finding:* Engine power, vehicle age, and displacement account for over **80.2%** of used car valuation in India.

### 9.6 Real-World Industrial Benchmarking Case Study
To test the model against live commercial platforms, we evaluated a **2018 Hyundai i20 Asta 1.2 Petrol Manual (56,000 km)** across three platforms:

* **Our Platform (FairPrice):**
  - Point Estimate: **₹3,93,000**
  - Fair Range: **₹3,45,000 to ₹4,45,000**
  - Deal Verdict for ₹4,58,000 ask: **Overpriced (+16.5% vs. estimate)**
  - Automated Counter-Offer: *"Negotiation Target: Offer between ₹3.45 L and ₹4.45 L"*
* **CarDekho SmartPrice:** Recommended Listing Range = **₹4.58 Lakh – ₹5.49 Lakh**
* **Droom Orange Book Value (OBV):** Fair Condition Value = **₹6.03 Lakh – ₹6.40 Lakh** (for 2020 model)

#### Critical Insight
CarDekho’s minimum opening ask (**₹4.58 Lakh**) directly borders our model’s **P90 upper boundary (₹4.45 Lakh)**. This empirically validates that commercial platforms quote retail listing prices containing a 10–15% bargaining cushion, while **FairPrice** identifies the true settlement baseline, providing the consumer with a data-driven counter-offer.

---

## 10. Conclusion & Future Scope

### 10.1 Conclusion
This project successfully implemented an intelligent, transparent, and accurate used car valuation platform tailored to the Indian pre-owned automotive sector. By combining **logarithmic target normalization**, **two-stage feature selection**, and **ensemble machine learning (Random Forest & AdaBoost)**, the system achieves an $R^2$ of **0.9332** and a median absolute percentage error of **9.59%** on 3,003 unseen market listings.

Unlike existing closed-source commercial platforms, **FairPrice**:
1. Eliminates commercial bias and privacy barriers (no mandatory phone numbers or marketing funnels).
2. Replaces single-point estimates with a mathematically grounded **P10–P90 Fair Market Range** based on tree disagreement.
3. Automatically evaluates seller quotes to generate actionable negotiation counter-offers.
4. Provides sub-15ms inference through an asynchronous FastAPI service integrated with a responsive React 18 user interface.

### 10.2 Future Scope
* **Computer Vision for Vehicle Damage Inspection:** Integrating Convolutional Neural Networks (CNNs) to analyze uploaded car photos and automatically adjust valuation based on exterior dents, paint condition, and tyre tread depth.
* **Geographic Micro-Market Modeling:** Incorporating Tier-1 vs. Tier-2 city indicators and regional road-tax differences as predictive features.
* **Service Record & Ownership History:** Expanding the feature schema to incorporate the number of previous owners, insurance claim history, and authorized service logs.
* **SHAP (SHapley Additive exPlanations):** Providing local game-theoretic attribution plots for each individual prediction to explain to the buyer exactly why a particular vehicle gained or lost value.

---

### References
1. CarDekho Indian Used Car Dataset, Kaggle open datasets.
2. Breiman, L. (2001). *Random Forests*. Machine Learning, 45(1), 5-32.
3. Freund, Y., & Schapire, R. E. (1997). *A decision-theoretic generalization of on-line learning and an application to boosting*. Journal of Computer and System Sciences, 55(1), 119-139.
4. Pedregosa, F., et al. (2011). *Scikit-learn: Machine Learning in Python*. Journal of Machine Learning Research, 12, 2825-2830.
5. FastAPI Framework Documentation, Tiangolo, 2024.
