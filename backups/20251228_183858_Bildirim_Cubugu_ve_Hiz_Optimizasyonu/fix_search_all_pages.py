import os
import re

# Correct search container HTML with inline onclick
OLD_SEARCH = '''<div class="search-container" role="search">
                    <input type="text" id="header-search-input" class="search-input" placeholder="Ürün ara..."
                        aria-label="Ürün arama" autocomplete="off">
                    <button class="icon-btn search-btn" aria-label="Arama yap" type="button"><i
                            class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>
                </div>'''

NEW_SEARCH = '''<div class="search-container" role="search" id="search-container">
                    <input type="text" id="header-search-input" class="search-input" placeholder="Ürün ara..."
                        aria-label="Ürün arama" autocomplete="off" onfocus="document.getElementById('search-container').classList.add('active')">
                    <button class="icon-btn search-btn" aria-label="Arama yap" type="button" onclick="var sc = document.getElementById('search-container'); sc.classList.toggle('active'); if(sc.classList.contains('active')) document.getElementById('header-search-input').focus();"><i
                            class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>
                </div>'''

# List of main HTML pages to update
pages_to_update = [
    'populer.html',
    'yeni-gelenler.html',
    'favoriler.html',
    'sepet.html',
    'profil.html',
    'markalar.html',
    'arama.html',
    'odeme.html',
    'hakkimizda.html',
    'iletisim.html',
    'kvkk.html',
    'gizlilik-guvenlik.html',
    'mesafeli-satis-sozlesmesi.html',
    'iade-iptal.html',
    'siparis-takip.html',
    'siparis-detay.html',
    'urun-detay.html',
    'tum-siparislerim.html',
    'cok-satanlar.html',
    'siparis-basarili.html'
]

updated_count = 0

for page in pages_to_update:
    if not os.path.exists(page):
        continue
    
    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace old search container with new one
    if OLD_SEARCH in content:
        new_content = content.replace(OLD_SEARCH, NEW_SEARCH)
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"UPDATED: {page}")
        updated_count += 1
    else:
        print(f"SKIP: {page} - pattern not found")

print(f"\n=== Updated {updated_count} pages ===")
