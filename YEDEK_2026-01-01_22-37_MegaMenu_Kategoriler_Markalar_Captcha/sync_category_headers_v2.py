import re

# index.html'den header'ı çek
with open(r'c:\Users\pc\Desktop\Lidareyn_brand\index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

header_match = re.search(r'(<header class="main-header" role="banner">.*?</header>)', index_content, re.DOTALL)
if not header_match:
    print("Header not found in index.html")
    exit()

original_header = header_match.group(1)

# Kategori sayfaları için header'ı uyarla
# index.html#kategoriler -> ../index.html#kategoriler
# kategoriler/ -> (kaldır veya ./ bırak)
# assets/ -> ../assets/
# giris-yap.html -> ../giris-yap.html
# favoriler.html -> ../favoriler.html
# sepet.html -> ../sepet.html
# populer.html -> ../populer.html
# yeni-gelenler.html -> ../yeni-gelenler.html
# juvex.html -> ../juvex.html

adapted_header = original_header
adapted_header = adapted_header.replace('href="index.html', 'href="../index.html')
adapted_header = adapted_header.replace('href="kategoriler/', 'href="')
adapted_header = adapted_header.replace('href="giris-yap.html', 'href="../giris-yap.html')
adapted_header = adapted_header.replace('href="favoriler.html', 'href="../favoriler.html')
adapted_header = adapted_header.replace('href="sepet.html', 'href="../sepet.html')
adapted_header = adapted_header.replace('href="populer.html', 'href="../populer.html')
adapted_header = adapted_header.replace('href="yeni-gelenler.html', 'href="../yeni-gelenler.html')
adapted_header = adapted_header.replace('href="juvex.html', 'href="../juvex.html')
adapted_header = adapted_header.replace('src="assets/', 'src="../assets/')
adapted_header = adapted_header.replace('src="gorseller/', 'src="../gorseller/')

# Kategori sayfalarına uygula
kategoriler_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
import os

for filename in os.listdir(kategoriler_dir):
    if filename.endswith('.html'):
        path = os.path.join(kategoriler_dir, filename)
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            cat_content = f.read()
        
        # Mevcut header'ı bul ve değiştir
        # Eğer header bozulmuşsa (kullanıcının dediği gibi garip harfler), 
        # geniş bir temizlik yapmamız gerekebilir.
        
        # Header'ın başlangıcını ve sonunu bulmaya çalış
        # <header class="main-header" ... </header>
        # Eğer bu bulunamazsa alternatif olarak <div class="header-container"> de bakabiliriz.
        
        new_cat_content = re.sub(r'<header.*?</header>', adapted_header, cat_content, flags=re.DOTALL | re.IGNORECASE)
        
        if new_cat_content == cat_content:
            # Re-try with container if header tag is missing/corrupted
             new_cat_content = re.sub(r'<div class="header-container">.*?</div>\s*</header>', adapted_header, cat_content, flags=re.DOTALL | re.IGNORECASE)

        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_cat_content)

print("✅ Tüm kategori sayfalarının header ve mega menüleri index.html ile senkronize edildi.")
