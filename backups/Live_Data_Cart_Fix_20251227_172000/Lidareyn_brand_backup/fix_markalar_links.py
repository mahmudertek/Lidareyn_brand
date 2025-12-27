"""
Alt sayfalardaki Tüm Markalar linkini düzelt
"""

import os
import re

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

updated_count = 0

for page in pages_to_update:
    page_path = os.path.join(base_dir, page)
    
    if not os.path.exists(page_path):
        print(f"⚠ Atlandı: {page} (dosya bulunamadı)")
        continue
    
    try:
        with open(page_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Tüm Markalar linkini bul ve değiştir
        # Hem #flowing-menu-root hem de markalar.html gibi linkler olabilir
        old_patterns = [
            r'href="#flowing-menu-root"',
            r'href="markalar.html"',
            r'href="#"[^>]*>Tüm Markalar',
        ]
        
        # Önce mevcut linki kontrol et
        found = False
        for pattern in old_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                found = True
                break
        
        if found or 'Tüm Markalar' in content:
            # Tüm Markalar linkini güncelle
            # <a href="..." ...>Tüm Markalar</a> formatını bul
            new_content = re.sub(
                r'<a\s+href="[^"]*"([^>]*)>\s*Tüm Markalar\s*</a>',
                r'<a href="index.html#flowing-menu-root"\1>Tüm Markalar</a>',
                content,
                flags=re.IGNORECASE
            )
            
            if new_content != content:
                with open(page_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                
                updated_count += 1
                print(f"✓ Güncellendi: {page}")
            else:
                print(f"⚠ Değişiklik yok: {page}")
        else:
            print(f"⚠ 'Tüm Markalar' bulunamadı: {page}")
    
    except Exception as e:
        print(f"✗ Hata ({page}): {e}")

print(f"\n{'='*50}")
print(f"Toplam {updated_count}/{len(pages_to_update)} sayfa güncellendi!")
print(f"{'='*50}")
