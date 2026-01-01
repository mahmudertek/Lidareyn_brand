import os
import re

categories_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'

clean_section = '''
    <section class="category-products-section" style="padding: 20px 0;">
        <div class="container">
            <div class="products-grid">
                <!-- Ürünler Admin Panelinden Yüklenecektir -->
            </div>
        </div>
    </section>
'''

print("Checking for missing product sections...")

for filename in os.listdir(categories_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(categories_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'category-products-section' not in content:
            print(f"Missing section in: {filename}")
            # Footer'dan önce ekle
            # HTML yapısını bozmamak için sidebar-overlay divinden sonra veya footer'dan önce ekleyebiliriz.
            # Genelde yapı: ...content... -> sidebar-overlay -> footer
            # Ama bazı dosyalarda sidebar-overlay footer'dan sonra olabilir.
            
            # En güvenlisi footer etiketini bulup önüne eklemek.
            if '<footer class="main-footer">' in content:
                new_content = content.replace('<footer class="main-footer">', clean_section + '\n\n    <footer class="main-footer">')
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Fixed: {filename}")
            else:
                print(f"Could not find footer in {filename}, skipping.")
        else:
             # Zaten varsa dokunma (önceki script temizledi)
             pass

print("Done.")
