"""
Fix footer pages - add mobile search overlay and mobile-categories-btn
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

# Mobile search overlay HTML to add before </body>
MOBILE_SEARCH_OVERLAY = '''
    <!-- Mobile Search Overlay -->
    <div id="mobile-search-overlay" class="mobile-search-overlay">
        <div class="mobile-search-content">
            <form action="arama.html" method="GET" class="mobile-search-form">
                <input type="text" name="q" class="mobile-search-input" placeholder="Ürün, kategori veya marka ara..." autocomplete="off">
                <button type="submit" class="mobile-search-submit">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </form>
            <button class="close-search-btn" aria-label="Kapat">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="mobile-search-results"></div>
        </div>
    </div>
'''

def fix_file(filepath):
    filename = os.path.basename(filepath)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Check if mobile-search-overlay already exists
    if 'mobile-search-overlay' not in content:
        # Add before </body>
        content = content.replace('</body>', MOBILE_SEARCH_OVERLAY + '\n</body>')
        modified = True
        print(f"  Added mobile-search-overlay")
    
    # Check if mobile-categories-btn exists in header
    if 'mobile-categories-btn' not in content:
        # Add after header-container opening
        mobile_btn = '''            <!-- Mobile Categories Button -->
            <a href="index.html#kategoriler" class="mobile-categories-btn">
                <i class="fa-solid fa-bars"></i>
                <span class="mobile-cat-text">Tüm Kategoriler</span>
            </a>
'''
        # Find header-container and add after it
        content = content.replace(
            '<div class="header-container">',
            '<div class="header-container">\n' + mobile_btn
        )
        modified = True
        print(f"  Added mobile-categories-btn")
    
    # Check if mobile-search-btn exists
    if 'mobile-search-btn' not in content:
        # Add before search-container in header-icons
        mobile_search_btn = '''                <button class="icon-btn mobile-search-btn" aria-label="Arama Yap">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
'''
        content = content.replace(
            '<div class="header-icons">',
            '<div class="header-icons">\n' + mobile_search_btn
        )
        modified = True
        print(f"  Added mobile-search-btn")
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Fixed: {filename}")
    else:
        print(f"  - Already has all components: {filename}")

def main():
    print("Fixing footer pages for mobile header...")
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
