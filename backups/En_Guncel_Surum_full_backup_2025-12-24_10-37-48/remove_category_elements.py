import os
import re

# List of category files to update
category_files = [
    'elektrikli-el-aletleri.html',
    'olcme-ve-kontrol-aletleri.html',
    'el-aletleri.html',
    'nalbur-yapi-malzemeleri.html',
    'asindirici-kesici.html',
    'yapi-kimyasallari.html',
    'kaynak-malzemeleri.html',
    'hirdavat-el-aletleri.html',
    'is-guvenligi-ve-calisma-ekipmanlari.html'
]

base_path = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'

# Pattern to match the category-hero section (title + search bar)
category_hero_pattern = re.compile(
    r'<section class="category-hero"[^>]*>.*?</section>\s*',
    re.DOTALL
)

# Pattern to match the subcategory-chips-section
subcategory_chips_pattern = re.compile(
    r'<!-- Desktop: Subcategory Chips.*?</section>\s*',
    re.DOTALL
)

for filename in category_files:
    filepath = os.path.join(base_path, filename)
    
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_length = len(content)
    
    # Remove category-hero section
    content = category_hero_pattern.sub('', content)
    
    # Remove subcategory-chips-section
    content = subcategory_chips_pattern.sub('', content)
    
    new_length = len(content)
    
    if new_length < original_length:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated: {filename} (removed {original_length - new_length} chars)")
    else:
        print(f"- No changes: {filename}")

print("\nDone!")
