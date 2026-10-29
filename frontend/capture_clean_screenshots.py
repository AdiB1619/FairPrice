import os
import subprocess
import time
import shutil

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
out_dir = r"c:\Users\Aditya\Music\ML\Fair Price Checker\frontend\screenshots\stage-c"
os.makedirs(out_dir, exist_ok=True)
brain_dir = r"C:\Users\Aditya\.gemini\antigravity\brain\9e981f0b-b415-4532-bf4b-fe87ebe835fa\stage-c"
os.makedirs(brain_dir, exist_ok=True)

# 1. Capture Insights (Desktop 1440px & Mobile 390px)
for w, h, fname in [(1440, 1100, "stage-c-insights-1440px.png"), (390, 844, "stage-c-insights-390px.png"), (1024, 900, "stage-c-insights-1024px.png"), (768, 900, "stage-c-insights-768px.png")]:
    target = os.path.join(out_dir, fname)
    args = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        f"--screenshot={target}",
        f"--window-size={w},{h}",
        "--virtual-time-budget=6000",
        "--hide-scrollbars",
        "http://localhost:5173/#insights"
    ]
    subprocess.run(args, check=True)
    shutil.copy2(target, os.path.join(brain_dir, fname))
    print(f"Captured clean {fname}")

# 2. Capture How It Works (Desktop 1440px & Mobile 390px)
for w, h, fname in [(1440, 1100, "stage-c-howit-1440px.png"), (390, 844, "stage-c-howit-390px.png"), (1024, 900, "stage-c-howit-1024px.png"), (768, 900, "stage-c-howit-768px.png")]:
    target = os.path.join(out_dir, fname)
    args = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        f"--screenshot={target}",
        f"--window-size={w},{h}",
        "--virtual-time-budget=4000",
        "--hide-scrollbars",
        "http://localhost:5173/#howit"
    ]
    subprocess.run(args, check=True)
    shutil.copy2(target, os.path.join(brain_dir, fname))
    print(f"Captured clean {fname}")

# 3. Capture Price Checker (Desktop 1440px & Mobile 390px)
for w, h, fname in [(1440, 950, "stage-c-checker-1440px.png"), (390, 844, "stage-c-checker-390px.png"), (1024, 900, "stage-c-checker-1024px.png"), (768, 900, "stage-c-checker-768px.png")]:
    target = os.path.join(out_dir, fname)
    args = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        f"--screenshot={target}",
        f"--window-size={w},{h}",
        "--virtual-time-budget=5000",
        "--hide-scrollbars",
        "http://localhost:5173/#checker"
    ]
    subprocess.run(args, check=True)
    shutil.copy2(target, os.path.join(brain_dir, fname))
    print(f"Captured clean {fname}")

print("All clean screenshots successfully regenerated!")

