import os
import re

# Script tags to add before </body>
SCRIPTS_TO_ADD = '''    <script src="categories-data.js"></script>
    <script src="products-data.js"></script>
    <script src="config.js"></script>
    <script src="auth.js"></script>
    <script src="script.js"></script>
    <script src="live-search.js"></script>
'''

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
    
    # Check if live-search.js is already included
    if 'live-search.js' in content:
        print(f"SKIP: {page} already has live-search.js")
        continue
    
    # Find </body> tag and insert scripts before it
    if '</body>' in content:
        new_content = content.replace('</body>', SCRIPTS_TO_ADD + '</body>')
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"UPDATED: {page}")
        updated_count += 1
    else:
        print(f"SKIP: {page} has no </body> tag")

print(f"\n=== Added scripts to {updated_count} pages ===")
