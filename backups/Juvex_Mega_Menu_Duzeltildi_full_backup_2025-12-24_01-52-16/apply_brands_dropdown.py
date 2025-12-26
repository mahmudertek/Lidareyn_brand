"""
Apply brands dropdown to all category pages
"""
import os
import re

KATEGORILER_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

# The 9 main categories
MAIN_CATEGORIES = [
    "elektrikli-el-aletleri.html",
    "olcme-ve-kontrol-aletleri.html",
    "el-aletleri.html",
    "nalbur-yapi-malzemeleri.html",
    "asindirici-kesici.html",
    "yapi-kimyasallari.html",
    "kaynak-malzemeleri.html",
    "hirdavat-el-aletleri.html",
    "is-guvenligi-ve-calisma-ekipmanlari.html"
]

# CSS link to add
CSS_LINK = '    <link rel="stylesheet" href="../category-brands-dropdown.css">'

# JS script to add
JS_SCRIPT = '    <script src="../category-brands-dropdown.js"></script>'

# HTML for brands dropdown
BRANDS_DROPDOWN_HTML = '''
        <!-- Brands Dropdown (Mobile Only) -->
        <div class="brands-dropdown-wrapper">
            <button class="brands-dropdown-trigger">
                Bu kategorideki tüm markalar
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="brands-dropdown-content">
                <div class="brands-search-container">
                    <input type="text" class="brands-search-input" placeholder="Marka ara...">
                </div>
                <div class="brands-grid">
                    <!-- Brands will be rendered by JS -->
                </div>
                <div class="brands-pagination">
                    <button class="pagination-arrow pagination-prev" aria-label="Önceki">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <div class="pagination-dots">
                        <!-- Dots will be rendered by JS -->
                    </div>
                    <button class="pagination-arrow pagination-next" aria-label="Sonraki">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>'''

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Add CSS link if not present
    if 'category-brands-dropdown.css' not in content:
        # Find category-accordion.css and add after it
        if 'category-accordion.css' in content:
            content = content.replace(
                '<link rel="stylesheet" href="../category-accordion.css">',
                '<link rel="stylesheet" href="../category-accordion.css">\n' + CSS_LINK
            )
            modified = True
            print(f"  Added CSS link")
    
    # Add JS script if not present
    if 'category-brands-dropdown.js' not in content:
        # Find category-accordion.js and add after it
        if 'category-accordion.js' in content:
            content = content.replace(
                '<script src="../category-accordion.js"></script>',
                '<script src="../category-accordion.js"></script>\n' + JS_SCRIPT
            )
            modified = True
            print(f"  Added JS script")
    
    # Add brands dropdown HTML if not present
    if 'brands-dropdown-wrapper' not in content:
        # Find the closing of category-accordion div container and add after it
        # Looking for </div>\n    </div>\n\n    <!-- Desktop: Subcategory
        pattern = r'(</div>\s*</div>\s*</div>\s*\n\s*<!-- Desktop: Subcategory)'
        if re.search(pattern, content):
            content = re.sub(
                pattern,
                BRANDS_DROPDOWN_HTML + '\n\n    <!-- Desktop: Subcategory',
                content
            )
            modified = True
            print(f"  Added brands dropdown HTML")
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Updated: {os.path.basename(filepath)}")
    else:
        print(f"  - Skipped (already has changes): {os.path.basename(filepath)}")

def main():
    print("Applying brands dropdown to category pages...")
    print("=" * 50)
    
    for filename in MAIN_CATEGORIES:
        filepath = os.path.join(KATEGORILER_DIR, filename)
        if os.path.exists(filepath):
            print(f"\nProcessing: {filename}")
            process_file(filepath)
        else:
            print(f"\n✗ File not found: {filename}")

    print("\n" + "=" * 50)
    print("Done!")

if __name__ == "__main__":
    main()
