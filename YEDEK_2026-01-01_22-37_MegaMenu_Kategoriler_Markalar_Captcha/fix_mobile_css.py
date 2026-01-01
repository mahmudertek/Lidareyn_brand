"""
Fix footer pages - add missing mobile.css and viewport meta tag
"""
import os
import re

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"

# Footer pages to fix
FOOTER_PAGES = [
    "iletisim.html",
    "hakkimizda.html",
    "kvkk.html",
    "gizlilik-guvenlik.html",
    "iade-iptal.html",
    "mesafeli-satis-sozlesmesi.html"
]

def fix_file(filepath):
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # 1. Fix viewport meta tag (add maximum-scale and user-scalable)
    if 'maximum-scale=1.0, user-scalable=no' not in content:
        content = re.sub(
            r'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
            content
        )
        modified = True
        print(f"  Fixed viewport meta")
    
    # 2. Add mobile.css if missing
    if 'mobile.css' not in content:
        # Add after style.css
        content = content.replace(
            '<link rel="stylesheet" href="style.css">',
            '<link rel="stylesheet" href="style.css">\n    <link rel="stylesheet" href="mobile.css?v=5">'
        )
        modified = True
        print(f"  Added mobile.css")
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Fixed: {filename}")
    else:
        print(f"  - Already has all fixes: {filename}")

def main():
    print("Fixing mobile CSS and viewport in footer pages...")
    print("=" * 50)
    
    for filename in FOOTER_PAGES:
        filepath = os.path.join(ROOT_DIR, filename)
        if os.path.exists(filepath):
            print(f"\n{filename}:")
            fix_file(filepath)
        else:
            print(f"\n{filename}: NOT FOUND")
    
    print("\n" + "=" * 50)
    print("Done!")

if __name__ == "__main__":
    main()
