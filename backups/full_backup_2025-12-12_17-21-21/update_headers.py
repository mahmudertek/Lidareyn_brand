"""
Header Update Script - Tüm alt sayfalardaki header'ı index.html'deki ile değiştirir
"""

import re
import os

# Ana dizin
base_dir = r"c:\Users\pc\Desktop\Lidareyn_brand"

# Güncellenecek sayfalar (index.html hariç)
pages_to_update = [
    "yeni-gelenler.html",
    "populer.html",
    "cok-satanlar.html",
    "markalar.html",
    "favoriler.html",
    "sepet.html",
    "profil.html",
    "giris-yap.html",
    "sifremi-unuttum.html",
    "urun-detay.html",
    "odeme.html",
    "siparis-basarili.html",
    "siparis-takip.html",
    "hakkimizda.html",
    "iletisim.html",
    "sozlesmeler.html",
    "arama.html"
]

# index.html'den doğru header'ı oku
with open(os.path.join(base_dir, "index.html"), "r", encoding="utf-8") as f:
    index_content = f.read()

# Header'ı çıkar (<!-- Modern Premium Header --> ile </header> arası)
header_start = index_content.find("<!-- Modern Premium Header")
header_end = index_content.find("</header>", header_start) + len("</header>")
correct_header = index_content[header_start:header_end]

print(f"✓ Doğru header alındı ({len(correct_header)} karakter)")

# Her sayfayı güncelle
updated_count = 0
for page in pages_to_update:
    page_path = os.path.join(base_dir, page)
    
    if not os.path.exists(page_path):
        print(f"⚠ Atlandı: {page} (dosya bulunamadı)")
        continue
    
    try:
        with open(page_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Mevcut header'ı bul ve değiştir
        # <header ile </header> arası her ne varsa değiştir
        pattern = r'<header[^>]*>.*?</header>'
        
        if re.search(pattern, content, re.DOTALL):
            new_content = re.sub(pattern, correct_header, content, flags=re.DOTALL)
            
            with open(page_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            
            updated_count += 1
            print(f"✓ Güncellendi: {page}")
        else:
            print(f"⚠ Header bulunamadı: {page}")
    
    except Exception as e:
        print(f"✗ Hata ({page}): {e}")

print(f"\n{'='*50}")
print(f"Toplam {updated_count}/{len(pages_to_update)} sayfa güncellendi!")
print(f"{'='*50}")
