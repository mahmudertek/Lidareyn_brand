# -*- coding: utf-8 -*-
"""
Yapı ve İnşaat Malzemeleri kategorisini mega menülerden kaldırır
"""

import os
import re

def remove_yapi_insaat(filename):
    if not os.path.exists(filename):
        return f"DOSYA YOK: {filename}"
    
    try:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return f"OKUMA HATASI: {filename} - {e}"
    
    # Yapı ve İnşaat Malzemeleri yoksa atla
    if 'nalbur-yapi-malzemeleri' not in content and 'Yapı ve İnşaat Malzemeleri' not in content:
        return f"KATEGORI YOK: {filename}"
    
    original_content = content
    
    # Pattern 1: Tam <li> bloğunu bul ve kaldır (nalbur-yapi-malzemeleri.html linki olan)
    # Bu pattern mega menu içindeki tüm <li>...</li> bloğunu yakalar
    pattern1 = r'<li>\s*<a href="[^"]*nalbur-yapi-malzemeleri\.html"[^>]*>.*?</a>\s*<div class="sub-menu">.*?</div>\s*</li>'
    content = re.sub(pattern1, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    # Pattern 2: kategoriler/ prefix ile
    pattern2 = r'<li>\s*<a href="kategoriler/nalbur-yapi-malzemeleri\.html"[^>]*>.*?</a>\s*<div class="sub-menu">.*?</div>\s*</li>'
    content = re.sub(pattern2, '', content, flags=re.DOTALL | re.IGNORECASE)
    
    if content != original_content:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"KALDIRILDI: {filename}"
    
    return f"DEGISIKLIK YOK: {filename}"

# Ana sayfa listesi
pages = [
    'yeni-gelenler.html',
    'populer.html',
    'juwex.html',
    'hakkimizda.html',
    'iletisim.html',
    'kvkk.html',
    'gizlilik-guvenlik.html',
    'iade-iptal.html',
    'mesafeli-satis-sozlesmesi.html',
    'arama.html',
    'sepet.html',
    'favoriler.html',
    'giris-yap.html',
    'odeme.html',
    'profil.html',
    'urun-detay.html',
    'sifremi-unuttum.html',
    'siparis-detay.html',
    'siparis-takip.html',
    'tum-siparislerim.html',
    'cok-satanlar.html',
    '404.html',
    'markalar.html'
]

print("Yapi ve Insaat Malzemeleri Kategorisi Kaldirma")
print("=" * 50)

for page in pages:
    result = remove_yapi_insaat(page)
    print(result)

print("=" * 50)
print("Islem tamamlandi!")
