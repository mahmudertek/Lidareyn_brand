"""
Add brands dropdown to missing category pages
"""
import os
import re

KATEGORILER_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

# Pages that need brands dropdown HTML
PAGES_TO_FIX = [
    "el-aletleri.html",
    "asindirici-kesici.html"
]

# Brands dropdown HTML
BRANDS_HTML = '''
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
                <div class="brands-grid"></div>
                <div class="brands-pagination">
                    <button class="pagination-arrow pagination-prev" aria-label="Önceki">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <div class="pagination-dots"></div>
                    <button class="pagination-arrow pagination-next" aria-label="Sonraki">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>'''

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has brands dropdown
    if 'brands-dropdown-wrapper' in content:
        print(f"  Already has brands dropdown, skipping.")
        return
    
    # Find first category-accordion closing and add after it
    # Pattern: </div>\r\n            </div>\r\n        </div>\r\n    </section>\r\n\r\n    <!-- Hybrid: Subcategory
    pattern = r'(</div>\s*</div>\s*</div>\s*</section>\s*\n\s*<!-- Hybrid: Subcategory)'
    
    if re.search(pattern, content):
        content = re.sub(
            pattern,
            BRANDS_HTML + '\n        </div>\n    </section>\n\n    <!-- Hybrid: Subcategory',
            content,
            count=1  # Only first occurrence
        )
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ Added brands dropdown")
    else:
        # Alternative: look for first </section> after category-accordion
        pattern2 = r'(category-accordion.*?</div>\s*</div>\s*</div>\s*</section>)'
        match = re.search(pattern2, content, re.DOTALL)
        if match:
            # Insert before the final </section>
            end_pos = match.end()
            section_close_pos = content.rfind('</section>', match.start(), end_pos)
            if section_close_pos > 0:
                content = content[:section_close_pos] + BRANDS_HTML + '\n        </div>\n    ' + content[section_close_pos:]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  ✓ Added brands dropdown (method 2)")
            else:
                print(f"  ✗ Could not find insertion point")
        else:
            print(f"  ✗ Pattern not found")

def main():
    print("Adding brands dropdown to missing category pages...")
    for filename in PAGES_TO_FIX:
        filepath = os.path.join(KATEGORILER_DIR, filename)
        if os.path.exists(filepath):
            print(f"\nProcessing: {filename}")
            process_file(filepath)
        else:
            print(f"\n✗ Not found: {filename}")
    print("\nDone!")

if __name__ == "__main__":
    main()
