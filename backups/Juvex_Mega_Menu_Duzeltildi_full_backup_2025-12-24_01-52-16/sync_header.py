"""
Sync header from index.html to all footer pages
This ensures footer pages have the same header as the main page
"""
import os
import re

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"

# Footer pages to update
FOOTER_PAGES = [
    "iletisim.html",
    "hakkimizda.html",
    "kvkk.html",
    "gizlilik-guvenlik.html",
    "iade-iptal.html",
    "mesafeli-satis-sozlesmesi.html"
]

def extract_header(index_path):
    """Extract header from index.html"""
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find header: from <!-- Modern Premium Header to </header>
    match = re.search(r'(<!-- Modern Premium Header.*?</header>)', content, re.DOTALL)
    if match:
        return match.group(1)
    return None

def update_page_header(filepath, header_html):
    """Replace header in a page"""
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern to match existing header
    # Could be <!-- Header --> or <!-- Modern Premium Header or just <header
    pattern = r'(?:<!-- Header -->[\s\n]*)?(?:<!-- Modern Premium Header.*?)?<header class="main-header".*?</header>'
    
    if re.search(pattern, content, re.DOTALL):
        new_content = re.sub(pattern, header_html, content, flags=re.DOTALL, count=1)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✓ Updated header in {filename}")
        return True
    else:
        print(f"  ✗ Could not find header pattern in {filename}")
        return False

def main():
    print("Syncing header from index.html to footer pages...")
    print("=" * 50)
    
    index_path = os.path.join(ROOT_DIR, "index.html")
    header_html = extract_header(index_path)
    
    if not header_html:
        print("ERROR: Could not extract header from index.html")
        return
    
    print(f"Extracted header ({len(header_html)} characters)")
    print("=" * 50)
    
    for filename in FOOTER_PAGES:
        filepath = os.path.join(ROOT_DIR, filename)
        if os.path.exists(filepath):
            print(f"\n{filename}:")
            update_page_header(filepath, header_html)
        else:
            print(f"\n{filename}: NOT FOUND")
    
    print("\n" + "=" * 50)
    print("Done!")

if __name__ == "__main__":
    main()
