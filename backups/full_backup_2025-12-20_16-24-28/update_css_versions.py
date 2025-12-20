import os

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

for filename in category_files:
    filepath = os.path.join(base_path, filename)
    
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update CSS versions to v4
    content = content.replace('category-accordion.css?v=3', 'category-accordion.css?v=4')
    content = content.replace('category-brands-dropdown.css?v=3', 'category-brands-dropdown.css?v=4')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Updated: {filename}")

print("\nDone!")
