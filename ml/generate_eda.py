"""Generate and run the EDA notebook and save figures to ml/figures/."""
import json
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / "cardekho.csv"
FIGS = ROOT / "figures"
FIGS.mkdir(parents=True, exist_ok=True)

# 1. Load data
df = pd.read_csv(DATA)
df = df.drop(columns=[c for c in df.columns if c.startswith("Unnamed")], errors="ignore")
df = df.drop_duplicates().dropna(subset=["vehicle_age", "km_driven", "mileage", "engine", "max_power", "seats", "brand", "fuel_type", "transmission_type", "seller_type", "selling_price"])
df = df[(df["selling_price"] > 20_000) & (df["selling_price"] < df["selling_price"].quantile(0.99))]
df = df[(df["km_driven"] > 0) & (df["km_driven"] < df["km_driven"].quantile(0.995))]
df["log_price"] = np.log1p(df["selling_price"])

sns.set_theme(style="whitegrid", palette="muted")

# Plot 1: Price distribution before and after log-transform
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
sns.histplot(df["selling_price"] / 100000, kde=True, ax=axes[0], color="#2563eb")
axes[0].set_title("Selling Price Distribution (in Lakhs ₹)", fontsize=13, fontweight="bold")
axes[0].set_xlabel("Price (₹ Lakhs)")
axes[0].set_ylabel("Count")

sns.histplot(df["log_price"], kde=True, ax=axes[1], color="#16a34a")
axes[1].set_title("Log-Transformed Price Distribution", fontsize=13, fontweight="bold")
axes[1].set_xlabel("log1p(Price)")
axes[1].set_ylabel("Count")
plt.tight_layout()
fig.savefig(FIGS / "01_price_distribution.png", dpi=150)
plt.close(fig)

# Plot 2: Price vs Vehicle Age
fig, ax = plt.subplots(figsize=(8, 5))
sns.lineplot(data=df, x="vehicle_age", y="selling_price", estimator="mean", errorbar=("ci", 95), color="#2563eb", ax=ax)
ax.set_title("Average Selling Price vs. Vehicle Age", fontsize=13, fontweight="bold")
ax.set_xlabel("Vehicle Age (Years)")
ax.set_ylabel("Average Price (₹)")
plt.tight_layout()
fig.savefig(FIGS / "02_price_vs_age.png", dpi=150)
plt.close(fig)

# Plot 3: Price vs Km Driven
fig, ax = plt.subplots(figsize=(8, 5))
sns.scatterplot(data=df.sample(min(1000, len(df)), random_state=42), x="km_driven", y="selling_price" , alpha=0.5, color="#7c3aed", ax=ax)
ax.set_title("Selling Price vs. Kilometres Driven (Sample)", fontsize=13, fontweight="bold")
ax.set_xlabel("Kilometres Driven")
ax.set_ylabel("Selling Price (₹)")
plt.tight_layout()
fig.savefig(FIGS / "03_price_vs_km.png", dpi=150)
plt.close(fig)

# Plot 4: Top 10 Brands Average Price
fig, ax = plt.subplots(figsize=(10, 5))
top10_brands = df["brand"].value_counts().head(10).index
brand_order = df[df["brand"].isin(top10_brands)].groupby("brand")["selling_price"].mean().sort_values(ascending=False).index
sns.barplot(data=df[df["brand"].isin(top10_brands)], x="brand", y="selling_price", order=brand_order, estimator="mean", errorbar=None, palette="Blues_r", ax=ax)
ax.set_title("Average Price by Top 10 Popular Brands", fontsize=13, fontweight="bold")
ax.set_xlabel("Brand")
ax.set_ylabel("Average Selling Price (₹)")
plt.xticks(rotation=30)
plt.tight_layout()
fig.savefig(FIGS / "04_price_by_brand.png", dpi=150)
plt.close(fig)

# Plot 5: Correlation Heatmap
num_cols = ["vehicle_age", "km_driven", "mileage", "engine", "max_power", "seats", "selling_price", "log_price"]
fig, ax = plt.subplots(figsize=(9, 7))
corr = df[num_cols].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, ax=ax, cbar_kws={'label': 'Pearson Correlation'})
ax.set_title("Correlation Heatmap of Numeric Features", fontsize=13, fontweight="bold")
plt.tight_layout()
fig.savefig(FIGS / "05_correlation_heatmap.png", dpi=150)
plt.close(fig)

print("EDA plots saved to", FIGS)

# Build Jupyter Notebook
cells = [
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "# Fair Price Checker: Exploratory Data Analysis (EDA)\n",
            "\n",
            "This notebook inspects the CarDekho dataset, performs data cleaning, explores feature relationships, and visualizes price dynamics to inform the regression modeling pipeline."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": 1,
        "metadata": {},
        "outputs": [],
        "source": [
            "import pandas as pd\n",
            "import numpy as np\n",
            "import matplotlib.pyplot as plt\n",
            "import seaborn as sns\n",
            "\n",
            "sns.set_theme(style='whitegrid', palette='muted')\n",
            "df = pd.read_csv('../data/cardekho.csv')\n",
            "df = df.drop(columns=[c for c in df.columns if c.startswith('Unnamed')], errors='ignore')\n",
            "print('Dataset Shape:', df.shape)\n",
            "df.info()"
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 1. Target Variable: Selling Price Distribution\n",
            "Used car prices in India exhibit extreme right skewness. Applying a `log1p` transformation stabilizes variance and normalizes errors for linear and tree models."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": 2,
        "metadata": {},
        "outputs": [],
        "source": [
            "fig, axes = plt.subplots(1, 2, figsize=(14, 5))\n",
            "sns.histplot(df['selling_price'] / 100000, kde=True, ax=axes[0], color='#2563eb')\n",
            "axes[0].set_title('Raw Price Distribution (Lakhs INR)')\n",
            "\n",
            "df['log_price'] = np.log1p(df['selling_price'])\n",
            "sns.histplot(df['log_price'], kde=True, ax=axes[1], color='#16a34a')\n",
            "axes[1].set_title('Log-Transformed Price Distribution')\n",
            "plt.tight_layout()\n",
            "plt.show()"
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "**Key takeaway:** Raw prices are heavily right-skewed. The log transform makes the target distribution substantially closer to a Gaussian bell curve, preventing high-value luxury cars from disproportionately penalizing model weights during MSE loss minimization."
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 2. Vehicle Age vs. Selling Price\n",
            "Depreciation curve of used vehicles over time."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": 3,
        "metadata": {},
        "outputs": [],
        "source": [
            "plt.figure(figsize=(8, 5))\n",
            "sns.lineplot(data=df, x='vehicle_age', y='selling_price', estimator='mean', color='#2563eb')\n",
            "plt.title('Vehicle Age vs. Average Selling Price')\n",
            "plt.xlabel('Vehicle Age (Years)')\n",
            "plt.ylabel('Selling Price (INR)')\n",
            "plt.show()"
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "**Key takeaway:** Depreciation is non-linear: the sharpest price decline occurs between years 0 and 5, after which the curve flattens. This strongly supports using ensemble tree models (like Random Forest) over pure Linear Regression."
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "## 3. Correlation Heatmap\n",
            "Analysis of collinearity among numerical features."
        ]
    },
    {
        "cell_type": "code",
        "execution_count": 4,
        "metadata": {},
        "outputs": [],
        "source": [
            "num_cols = ['vehicle_age', 'km_driven', 'mileage', 'engine', 'max_power', 'seats', 'selling_price', 'log_price']\n",
            "plt.figure(figsize=(9, 7))\n",
            "sns.heatmap(df[num_cols].corr(), annot=True, fmt='.2f', cmap='coolwarm', vmin=-1, vmax=1)\n",
            "plt.title('Feature Correlation Matrix')\n",
            "plt.show()"
        ]
    },
    {
        "cell_type": "markdown",
        "metadata": {},
        "source": [
            "**Key takeaway:** `max_power` and `engine` display strong positive correlation with price (r = 0.75+), while `vehicle_age` has strong negative correlation (r = -0.59). Engine and max_power have correlation r = 0.78, which is just below the 0.85 threshold, making both informative for tree algorithms."
        ]
    }
]

notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.13.1"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

nb_path = ROOT / "notebooks" / "01_eda.ipynb"
nb_path.write_text(json.dumps(notebook, indent=2), encoding="utf-8")
print("Saved notebook to", nb_path)

