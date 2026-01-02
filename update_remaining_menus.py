# -*- coding: utf-8 -*-
"""
Tüm kalan sayfalara Bahçe Aletleri kategorisini ekler
"""

import os
import re

# Bahçe Aletleri mega menü bloğu
BAHCE_MENU = '''
                                <li>
                                    <a href="kategoriler/bahce-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-leaf"></i>
                                            <span>Bahçe Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Kesme &amp; Budama</h4>
                                            <ul>
                                                <li><a href="arama.html?q=Cit Kesme">Cit Kesme Makinesi</a></li>
                                                <li><a href="arama.html?q=Budama Makasi">Budama Makasi</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Cim Bakimi</h4>
                                            <ul>
                                                <li><a href="arama.html?q=Cim Bicme">Cim Bicme Makinesi</a></li>
                                                <li><a href="arama.html?q=Tirpan">Tirpan</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Sulama Sistemleri</h4>
                                            <ul>
                                                <li><a href="arama.html?q=Bahce Hortumu">Bahce Hortumu</a></li>
                                                <li><a href="arama.html?q=Sulama Tabancasi">Sulama Tabancasi</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Toprak Isleme</h4>
                                            <ul>
                                                <li><a href="arama.html?q=Capa Makinesi">Capa Makinesi</a></li>
                                                <li><a href="arama.html?q=Kurek">Kurek</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>'''

# Pattern: Is Guvenligi kategorisi bitisinden sonra </ul></div> oncesine ekle
PATTERN = r'(is-guvenligi-ve-calisma-ekipmanlari\.html.*?</div>\s*</li>)(\s*</ul>\s*</div>)'

def update_page(filename):
    if not os.path.exists(filename):
        return f"DOSYA YOK: {filename}"
    
    try:
        with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        return f"OKUMA HATASI: {filename} - {e}"
    
    # Zaten bahce-aletleri varsa atla
    if 'bahce-aletleri' in content:
        return f"ZATEN VAR: {filename}"
    
    # Mega menu yoksa atla
    if 'mega-menu-list' not in content:
        return f"MEGA MENU YOK: {filename}"
    
    # Pattern ara ve degistir
    if re.search(PATTERN, content, re.DOTALL | re.IGNORECASE):
        new_content = re.sub(
            PATTERN, 
            r'\1' + BAHCE_MENU + r'\2', 
            content, 
            count=1, 
            flags=re.DOTALL | re.IGNORECASE
        )
        
        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return f"GUNCELLENDI: {filename}"
    
    return f"PATTERN BULUNAMADI: {filename}"

# Guncellenecek sayfalar
pages = [
    'gizlilik-guvenlik.html',
    'iade-iptal.html', 
    'mesafeli-satis-sozlesmesi.html',
    'sifremi-unuttum.html',
    'siparis-detay.html',
    'siparis-takip.html',
    'tum-siparislerim.html',
    'cok-satanlar.html',
    '404.html'
]

print("Mega Menu Guncelleme Islemi")
print("=" * 40)

for page in pages:
    result = update_page(page)
    print(result)

print("=" * 40)
print("Islem tamamlandi!")
