
import os
import shutil

ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'
IMG_DIR = os.path.join(ROOT_DIR, 'gorseller')

# 1. Ensure logo exists and copy to root as favicon
src_logo = os.path.join(IMG_DIR, 'logo.png')
dest_favicon_png = os.path.join(ROOT_DIR, 'favicon.png')
dest_favicon_ico = os.path.join(ROOT_DIR, 'favicon.ico') # Some browsers strictly want this

if os.path.exists(src_logo):
    shutil.copy2(src_logo, dest_favicon_png)
    shutil.copy2(src_logo, dest_favicon_ico) # Just naming it .ico (modern browsers handle png in ico, or we just rely on png)
    print("Copied logo.png to root favicon.png and favicon.ico")
else:
    print("Warning: gorseller/logo.png not found!")

# 2. Update HTML files to use the absolute root favicon and absolute OG image
DOMAIN = "https://galatacarsi.com"

def update_meta_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 2a. Fix Favicon
    # Old: <link rel="icon" type="image/png" href="gorseller/logo.png"> OR href="../gorseller/logo.png"
    # New: <link rel="icon" type="image/png" href="/favicon.png"> (Root relative is safest)
    
    # Regex replacement for icon
    # Matches <link rel="icon" ... href="...">
    # We'll just replace specific known patterns to avoid breaking other links
    
    # Pattern 1: gorseller/logo.png
    content = content.replace('href="gorseller/logo.png"', 'href="/favicon.png"')
    content = content.replace('href="../gorseller/logo.png"', 'href="/favicon.png"')
    content = content.replace('href="assets/favicon.png"', 'href="/favicon.png"')
    content = content.replace('href="../assets/favicon.png"', 'href="/favicon.png"')
    
    # 2b. Fix OG Image (Needs absolute URL for social media)
    # Old: content="gorseller/sosyal_medya_gorseli.png"
    # New: content="https://galatacarsi.com/gorseller/sosyal_medya_gorseli.png"
    
    og_img_name = "sosyal_medya_gorseli.png"
    
    # Check if absolute link already exists
    if f'{DOMAIN}/gorseller/{og_img_name}' not in content:
        # Replace relative paths
        content = content.replace(f'content="gorseller/{og_img_name}"', f'content="{DOMAIN}/gorseller/{og_img_name}"')
        content = content.replace(f'content="../gorseller/{og_img_name}"', f'content="{DOMAIN}/gorseller/{og_img_name}"')
    
    # 2c. Fix Shortcut Icon if present or add it
    if '<link rel="shortcut icon"' not in content:
        # Add it before existing icon link if possible
        content = content.replace('<link rel="icon"', '<link rel="shortcut icon" href="/favicon.ico">\n    <link rel="icon"')

    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated metadata in {file_path}")

for root, dirs, files in os.walk(ROOT_DIR):
    for file in files:
        if file.endswith('.html'):
            update_meta_tags(os.path.join(root, file))
