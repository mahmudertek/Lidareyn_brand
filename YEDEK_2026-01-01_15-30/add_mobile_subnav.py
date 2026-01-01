import os
import re

# Mobile sub-nav HTML to add after </header>
MOBILE_SUB_NAV = '''
    <!-- Mobile Sub-Navigation Bar -->
    <nav class="mobile-sub-nav">
        <a href="index.html#flowing-menu-root" class="mobile-nav-link">Tüm Markalar</a>
        <a href="yeni-gelenler.html" class="mobile-nav-link">Yeni Gelenler</a>
        <a href="populer.html" class="mobile-nav-link">Popüler Ürünler</a>
    </nav>
'''

# List of HTML pages to update
pages_to_update = [
    'favoriler.html',
    'sepet.html',
    'profil.html',
    'populer.html',
    'yeni-gelenler.html',
    'markalar.html',
    'arama.html',
    'odeme.html',
    'urun-detay.html'
]

updated_count = 0

for page in pages_to_update:
    if not os.path.exists(page):
        continue
    
    with open(page, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if mobile-sub-nav already exists
    if 'mobile-sub-nav' in content:
        print(f"SKIP: {page} already has mobile-sub-nav")
        continue
    
    # Find </header> and add mobile-sub-nav after it
    if '</header>' in content:
        new_content = content.replace('</header>', '</header>' + MOBILE_SUB_NAV)
        
        with open(page, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"UPDATED: {page}")
        updated_count += 1
    else:
        print(f"SKIP: {page} has no </header> tag")

print(f"\n=== Added mobile-sub-nav to {updated_count} pages ===")
