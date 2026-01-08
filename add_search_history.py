import os
import re

# Kategoriler için
kategori_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'

for filename in os.listdir(kategori_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(kategori_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Zaten eklenmis mi kontrol et
        if 'search-history.js' in content:
            print(f'SKIP: kategoriler/{filename} - already has script')
            continue
        
        # </body> oncesine ekle
        script_tag = '<script src="../search-history.js"></script>\n'
        if '</body>' in content:
            new_content = content.replace('</body>', script_tag + '</body>')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'OK: kategoriler/{filename}')
        else:
            print(f'WARN: kategoriler/{filename} - no </body> found')

# Root HTML sayfaları için
root_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
root_pages = ['populer.html', 'yeni-gelenler.html', 'cok-satanlar.html', 'favoriler.html', 
              'markalar.html', 'juwex.html', 'sepet.html', 'giris-yap.html', 'profil.html',
              'hakkimizda.html', 'iletisim.html', 'kvkk.html', 'siparis-takip.html']

for filename in root_pages:
    filepath = os.path.join(root_dir, filename)
    if not os.path.exists(filepath):
        print(f'SKIP: {filename} - file not found')
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Zaten eklenmis mi kontrol et
    if 'search-history.js' in content:
        print(f'SKIP: {filename} - already has script')
        continue
    
    # </body> oncesine ekle
    script_tag = '<script src="search-history.js"></script>\n'
    if '</body>' in content:
        new_content = content.replace('</body>', script_tag + '</body>')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'OK: {filename}')
    else:
        print(f'WARN: {filename} - no </body> found')

print('Done!')

