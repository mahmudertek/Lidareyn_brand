
import os
import re

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
CATEGORIES_DIR = os.path.join(ROOT_DIR, "kategoriler")
JS_PATH = os.path.join(ROOT_DIR, "categories-data.js")

def check_mismatches():
    # 1. Get HTML Files
    html_files = [f for f in os.listdir(CATEGORIES_DIR) if f.endswith(".html")]
    print(f"Found {len(html_files)} HTML files in categories folder.")

    # 2. Extract keys from categories-data.js
    with open(JS_PATH, 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # Very naive regex to find keys like 'key-name': {
    js_keys = re.findall(r"^\s*'([a-zA-Z0-9-]+)':\s*{", js_content, re.MULTILINE)
    print(f"Found {len(js_keys)} keys in categories-data.js.")

    # 3. Compare
    print("\n--- Keys in JS but NO File (BROKEN LINKS) ---")
    file_set = set(html_files)
    for key in js_keys:
        expected_file = key + ".html"
        if expected_file not in file_set:
            print(f"Key: {key} -> Expected: {expected_file} (MISSING)")

    print("\n--- Files but NO Key in JS (NOT IN GRID) ---")
    key_set = set(js_keys)
    for fname in html_files:
        key = fname.replace(".html", "")
        if key not in key_set:
            print(f"File: {fname} -> Key: {key} (MISSING IN JS)")

if __name__ == "__main__":
    check_mismatches()
