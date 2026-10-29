import os
import subprocess
import time
import shutil

chrome_paths = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expanduser(r"~\AppData\Local\Google\Chrome\Application\chrome.exe"),
]
chrome = next((p for p in chrome_paths if os.path.exists(p)), None)
if not chrome:
    print("Error: Chrome not found")
    exit(1)

out_dir = r"c:\Users\Aditya\Music\ML\Fair Price Checker\frontend\screenshots\stage-c"
os.makedirs(out_dir, exist_ok=True)
brain_dir = r"C:\Users\Aditya\.gemini\antigravity\brain\9e981f0b-b415-4532-bf4b-fe87ebe835fa\stage-c"
os.makedirs(brain_dir, exist_ok=True)

widths = [1440, 1024, 768, 390]
views = [
    ("insights", "http://localhost:5173/#insights"),
    ("howit", "http://localhost:5173/#howit"),
    ("checker", "http://localhost:5173/#checker"),
]

for view_name, url in views:
    for w in widths:
        h = 900 if w >= 768 else 844
        filename = f"stage-c-{view_name}-{w}px.png"
        filepath = os.path.join(out_dir, filename)
        
        args = [
            chrome,
            "--headless=new",
            "--disable-gpu",
            f"--screenshot={filepath}",
            f"--window-size={w},{h}",
            "--hide-scrollbars",
            url
        ]
        
        print(f"Capturing {view_name} at {w}x{h} -> {filename}...")
        subprocess.run(args, check=True)
        time.sleep(1.5)  # brief pause
        
        # Copy to brain dir for artifact linking
        shutil.copy2(filepath, os.path.join(brain_dir, filename))

print("All screenshots successfully captured!")
