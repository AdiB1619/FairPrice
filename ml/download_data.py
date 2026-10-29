"""
Download the CarDekho used car dataset from a public source.
Run this script if you don't have the Kaggle CLI set up.

Usage: python ml/download_data.py
"""
import urllib.request
import pathlib
import sys

# CarDekho dataset - using opendatasoft/public mirror
URLS = [
    # Try multiple public sources
    ("https://raw.githubusercontent.com/dsrscientist/dataset1/master/used_car_dataset.csv", "used_car_public.csv"),
]

OUT = pathlib.Path(__file__).parent / "data"
OUT.mkdir(exist_ok=True)

def try_download():
    for url, fname in URLS:
        dest = OUT / fname
        print(f"Trying: {url}")
        try:
            urllib.request.urlretrieve(url, dest)
            print(f"Downloaded → {dest}")
            return str(dest)
        except Exception as e:
            print(f"  Failed: {e}")
    return None

if __name__ == "__main__":
    result = try_download()
    if result:
        print(f"\nSaved to: {result}")
        print("Rename or copy this file to ml/data/cardekho.csv")
        print("Then inspect columns: python -c \"import pandas as pd; df=pd.read_csv('ml/data/cardekho.csv'); print(df.columns.tolist())\"")
    else:
        print("\nAutomatic download failed. Please:")
        print("1. Go to https://www.kaggle.com/datasets/nehalbirla/vehicle-dataset-from-cardekho")
        print("2. Download the CSV")
        print("3. Save as: ml/data/cardekho.csv")
        sys.exit(1)

