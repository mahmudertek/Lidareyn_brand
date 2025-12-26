"""
Fix brands dropdown placement in all category pages
The dropdown should be OUTSIDE the accordion-content div
"""
import os
import re

KATEGORILER_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

# All 9 main category pages
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

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if file has the brands dropdown
    if 'brands-dropdown-wrapper' not in content:
        print(f"  No brands dropdown found, skipping")
        return
    
    # Check if already fixed (dropdown is after accordion closes properly)
    # Pattern: </div>\s*</div>\s*</div>\s*\n\s*<!-- Brands Dropdown
    correct_pattern = r'</div>\s*</div>\s*</div>\s*\n\s*<!-- Brands Dropdown'
    if re.search(correct_pattern, content):
        print(f"  Already correctly structured")
        return
    
    # Find and fix the incorrect structure
    # The issue is dropdown inside accordion-content
    # Need to close accordion-content and accordion divs before dropdown
    
    # Pattern to find: inside accordion, before <!-- Brands Dropdown
    # Wrong: </div>\n            \n        <!-- Brands Dropdown
    # Should be: </div>\n            </div>\n        </div>\n\n        <!-- Brands Dropdown
    
    wrong_pattern = r'(</div>\s*</div>\s*)\s*<!-- Brands Dropdown'
    replacement = r'\1</div>\n        </div>\n\n        <!-- Brands Dropdown'
    
    new_content, count = re.subn(wrong_pattern, replacement, content, count=1)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✓ Fixed structure")
    else:
        # Try another pattern
        wrong_pattern2 = r'(accordion-children">\s*<a[^<]*</a>\s*</div>\s*</div>\s*)\s*<!-- Brands'
        if re.search(wrong_pattern2, content):
            # Need manual inspection
            print(f"  ⚠ Needs manual check - complex structure")
        else:
            print(f"  - Could not find pattern to fix")

def main():
    print("Fixing brands dropdown placement in category pages...")
    print("=" * 50)
    
    for filename in MAIN_CATEGORIES:
        filepath = os.path.join(KATEGORILER_DIR, filename)
        if os.path.exists(filepath):
            print(f"\n{filename}:")
            fix_file(filepath)
        else:
            print(f"\n{filename}: NOT FOUND")
    
    print("\n" + "=" * 50)
    print("Done!")

if __name__ == "__main__":
    main()
