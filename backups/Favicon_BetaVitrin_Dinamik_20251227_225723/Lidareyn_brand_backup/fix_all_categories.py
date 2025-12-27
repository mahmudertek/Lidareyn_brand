"""
Comprehensive fix for all category pages - ensure brands dropdown
is outside accordion-content and all divs are properly closed.
"""
import os
import re

KATEGORILER_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

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

CORRECT_BRANDS_BLOCK = '''        <!-- Brands Dropdown (Mobile Only) -->
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
        </div>
    </div>

'''

def fix_file(filepath):
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if has brands dropdown
    if 'brands-dropdown-wrapper' not in content:
        print(f"  No brands dropdown - skipping")
        return False
    
    # Remove existing brands dropdown block
    # Pattern to match the brands dropdown and whatever follows until next section
    pattern = r'\s*<!-- Brands Dropdown \(Mobile Only\) -->.*?</div>\s*</div>\s*</div>\s*</div>'
    
    # Find position of accordion and brands dropdown
    accordion_match = re.search(r'<div class="category-accordion">', content)
    brands_match = re.search(r'<!-- Brands Dropdown', content)
    
    if not accordion_match or not brands_match:
        print(f"  Missing accordion or brands dropdown")
        return False
    
    # Find the structure: We need to remove brands dropdown and rebuild properly
    # The pattern is:
    # <div class="container">
    #     <div class="category-accordion">
    #         <button class="accordion-main-trigger">...
    #         <div class="accordion-content">
    #             ... accordion items ...
    #         </div>  <!-- close accordion-content -->
    #     </div>  <!-- close category-accordion -->
    #     
    #     <!-- Brands Dropdown -->
    #     <div class="brands-dropdown-wrapper">
    #         ...
    #     </div>
    # </div>  <!-- close container -->
    
    # Find <!-- Mobile: Category Accordion Navigation --> or just category-accordion 
    # and rebuild from there
    
    # First, remove the brands dropdown block completely
    remove_pattern = r'\s*<!-- Brands Dropdown \(Mobile Only\) -->\s*<div class="brands-dropdown-wrapper">.*?</div>\s*</div>\s*</div>'
    content_no_brands = re.sub(remove_pattern, '', content, flags=re.DOTALL, count=1)
    
    # Now find where to insert the corrected brands dropdown
    # It should be after accordion-content closes, before container closes
    # Look for the pattern: </div>\s*</div>\s*(followed by section or chips)
    
    # Find the accordion structure end
    # The accordion ends with </div></div> (accordion-content + category-accordion)
    # Then we add brands dropdown
    # Then </div> for container
    
    # Pattern: find the category-accordion closing point
    # We need to find: last accordion-parent closing, then accordion-content closing, then category-accordion closing
    
    # Find the last accordion-children closing tag before any section
    accordion_section_pattern = r'(<div class="accordion-children">.*?</div>\s*</div>)\s*(</div>)?\s*(</div>)?\s*(\n\s*<!-- (Desktop|Hybrid|Brands))'
    
    match = re.search(accordion_section_pattern, content_no_brands, re.DOTALL)
    
    if match:
        # Insert proper structure
        insert_pos = match.end(1)
        
        # Count how many closing divs we need
        # After accordion-children and accordion-parent close, we need:
        # </div> for accordion-content
        # </div> for category-accordion
        # then brands dropdown
        # </div> for container
        
        proper_closing = '''
                </div>
            </div>
        </div>

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
        </div>
    </div>

'''
        
        # Replace from the end of last accordion-children up to the next section
        new_content = content_no_brands[:insert_pos] + proper_closing + '    <!-- ' + match.group(5)
        
        # Remove any duplicate closing divs that might occur
        new_content = re.sub(r'(</div>\s*){5,}', '</div>\n            </div>\n        </div>\n    </div>\n\n', new_content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✓ Fixed")
        return True
    else:
        print(f"  Could not find pattern to fix")
        return False

def main():
    print("Comprehensive fix for category pages...")
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
