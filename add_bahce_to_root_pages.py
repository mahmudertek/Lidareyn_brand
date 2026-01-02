# -*- coding: utf-8 -*-
"""
Tüm sayfalardaki mega menülere Bahçe Aletleri kategorisini ekler
"""

import os
import re

# Bahçe Aletleri mega menü HTML bloğu (ana sayfa için - arama.html path'leri)
BAHCE_ALETLERI_MENU_ROOT = '''
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
                                                <li><a href="arama.html?q=Çit Kesme Makinesi">Çit Kesme Makinesi</a></li>
                                                <li><a href="arama.html?q=Budama Makası">Budama Makası</a></li>
                                                <li><a href="arama.html?q=Ağaç Kesme Testeresi">Ağaç Kesme Testeresi</a></li>
                                                <li><a href="arama.html?q=Dal Budama Aleti">Dal Budama Aleti</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Çim Bakımı</h4>
                                            <ul>
                                                <li><a href="arama.html?q=Çim Biçme Makinesi">Çim Biçme Makinesi</a></li>
                                                <li><a href="arama.html?q=Tırpan">Tırpan</a></li>
                                                <li><a href="arama.html?q=Çim Havalandırıcı">Çim Havalandırıcı</a></li>
                                                <li><a href="arama.html?q=Çim Süpürgesi">Çim Süpürgesi</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Sulama Sistemleri</h4>
                                            <ul>
                                                <li><a href="arama.html?q=Bahçe Hortumu">Bahçe Hortumu</a></li>
                                                <li><a href="arama.html?q=Sulama Tabancası">Sulama Tabancası</a></li>
                                                <li><a href="arama.html?q=Damla Sulama Sistemi">Damla Sulama Sistemi</a></li>
                                                <li><a href="arama.html?q=Fıskiye Yağmurlama">Fıskiye ve Yağmurlama</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Toprak İşleme</h4>
                                            <ul>
                                                <li><a href="arama.html?q=Çapa Makinesi">Çapa Makinesi</a></li>
                                                <li><a href="arama.html?q=Kürek">Kürek</a></li>
                                                <li><a href="arama.html?q=Tırmık">Tırmık</a></li>
                                                <li><a href="arama.html?q=Bel Kazma">Bel ve Kazma</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>'''

# Dosya listesi
ROOT_PAGES = [
    'populer.html',
    'yeni-gelenler.html', 
    'markalar.html',
    'arama.html',
    'sepet.html',
    'favoriler.html',
    'giris-yap.html',
    'odeme.html',
    'profil.html',
    'urun-detay.html',
    'juwex.html'
]

def add_bahce_to_pages():
    updated_count = 0
    
    for filename in ROOT_PAGES:
        if not os.path.exists(filename):
            print(f"⏭️ {filename} - Dosya bulunamadı")
            continue
            
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            try:
                with open(filename, 'r', encoding='latin-1') as f:
                    content = f.read()
            except Exception as e:
                print(f"❌ {filename} - Okuma hatası: {e}")
                continue
        
        # Bahçe Aletleri zaten varsa atla
        if 'bahce-aletleri' in content:
            print(f"⏭️ {filename} - Bahçe Aletleri zaten mevcut")
            continue
        
        # Mega menü var mı kontrol et
        if 'mega-menu-list' not in content:
            print(f"⏭️ {filename} - Mega menü bulunamadı")
            continue
        
        # İş Güvenliği kategorisinden sonra ekleme yap
        # Pattern: İş Güvenliği sub-menu kapanışından sonra </li> </ul> önce
        # Aranacak pattern: Çalışma Ekipmanları alt kategorisinin sub-menu kapanışı
        
        # Farklı pattern'ler dene
        patterns = [
            # Pattern 1: İş Güvenliği kategorisi bitişi
            (r'(İş Güvenliği ve Çalışma Ekipmanları</span>.*?</div>\s*</li>)(\s*</ul>\s*</div>)', 
             r'\1' + BAHCE_ALETLERI_MENU_ROOT + r'\2'),
            # Pattern 2: Yedek pattern
            (r'(İş İskelesi ve\s*Merdivenler</a></li>\s*</ul>\s*</div>\s*</div>\s*</li>)(\s*</ul>\s*</div>)',
             r'\1' + BAHCE_ALETLERI_MENU_ROOT + r'\2')
        ]
        
        updated = False
        for pattern, replacement in patterns:
            if re.search(pattern, content, re.DOTALL | re.IGNORECASE):
                new_content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.IGNORECASE)
                if new_content != content:
                    with open(filename, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"✅ {filename} - Bahçe Aletleri eklendi")
                    updated_count += 1
                    updated = True
                    break
        
        if not updated:
            print(f"⚠️ {filename} - Pattern bulunamadı (manuel düzenleme gerekli)")
    
    print(f"\n📊 Toplam {updated_count} dosya güncellendi")

if __name__ == '__main__':
    add_bahce_to_pages()
