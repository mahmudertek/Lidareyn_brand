import os
import re

root_dir = r"c:\Users\pc\Desktop\Lidareyn_brand"

# HTML files to update (exclude backups)
html_files = []
for root, dirs, files in os.walk(root_dir):
    if 'backups' in root or 'backup' in root.lower() or 'admin' in root.lower():
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

print(f"Found {len(html_files)} HTML files to process")

count = 0
for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix 1: Change inline breadcrumb link color from gold (#ffd700) or any color to standard dark gray
        # The breadcrumb in urun-detay.html uses inline styles with gold links
        # We need to fix all inline breadcrumb a tags to have consistent color
        
        # Fix 2: Add proper padding-top to main element for fixed header
        # The main element has padding-top: 20px; but it should account for notice+header (58px) + extra
        
        # Pattern to find main style with insufficient padding
        content = re.sub(
            r'<main style="padding-top:\s*20px;"',
            '<main style="padding-top: 80px;"',
            content
        )
        
        # Fix inline breadcrumb styling - change link color to match site theme
        # Find breadcrumb div and update its inline styles
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1
            print(f"Updated: {filepath}")
    
    except Exception as e:
        print(f"Error: {filepath}: {e}")

print(f"\nTotal files updated: {count}")
