# -*- coding: utf-8 -*-
"""
Tüm kategori sayfalarının mega menüsüne Bahçe Aletleri kategorisini ekler
"""

import os
import re

# Bahçe Aletleri mega menü HTML bloğu (kategori sayfaları için)
BAHCE_ALETLERI_MENU = '''
                                <li>
                                    <a href="bahce-aletleri.html">
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
                                                <li><a href="../arama.html?q=Çit Kesme Makinesi">Çit Kesme Makinesi</a></li>
                                                <li><a href="../arama.html?q=Budama Makası">Budama Makası</a></li>
                                                <li><a href="../arama.html?q=Ağaç Kesme Testeresi">Ağaç Kesme Testeresi</a></li>
                                                <li><a href="../arama.html?q=Dal Budama Aleti">Dal Budama Aleti</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Çim Bakımı</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Çim Biçme Makinesi">Çim Biçme Makinesi</a></li>
                                                <li><a href="../arama.html?q=Tırpan">Tırpan</a></li>
                                                <li><a href="../arama.html?q=Çim Havalandırıcı">Çim Havalandırıcı</a></li>
                                                <li><a href="../arama.html?q=Çim Süpürgesi">Çim Süpürgesi</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Sulama Sistemleri</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Bahçe Hortumu">Bahçe Hortumu</a></li>
                                                <li><a href="../arama.html?q=Sulama Tabancası">Sulama Tabancası</a></li>
                                                <li><a href="../arama.html?q=Damla Sulama Sistemi">Damla Sulama Sistemi</a></li>
                                                <li><a href="../arama.html?q=Fıskiye Yağmurlama">Fıskiye ve Yağmurlama</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Toprak İşleme</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Çapa Makinesi">Çapa Makinesi</a></li>
                                                <li><a href="../arama.html?q=Kürek">Kürek</a></li>
                                                <li><a href="../arama.html?q=Tırmık">Tırmık</a></li>
                                                <li><a href="../arama.html?q=Bel Kazma">Bel ve Kazma</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>'''

def add_bahce_to_kategori_pages():
    kategoriler_dir = 'kategoriler'
    updated_count = 0
    
    for filename in os.listdir(kategoriler_dir):
        if not filename.endswith('.html'):
            continue
            
        filepath = os.path.join(kategoriler_dir, filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            with open(filepath, 'r', encoding='latin-1') as f:
                content = f.read()
        
        # Bahçe Aletleri zaten varsa atla
        if 'bahce-aletleri.html' in content or 'Bahçe Aletleri' in content:
            print(f"⏭️ {filename} - Bahçe Aletleri zaten mevcut")
            continue
        
        # İş Güvenliği kategorisinden sonra Bahçe Aletleri ekle
        # Pattern: İş Güvenliği </li> </ul> </div> önce
        pattern = r'(İş Güvenliği ve Çalışma Ekipmanları</span>.*?</div>\s*</li>)(\s*</ul>\s*</div>)'
        
        if re.search(pattern, content, re.DOTALL):
            new_content = re.sub(
                pattern,
                r'\1' + BAHCE_ALETLERI_MENU + r'\2',
                content,
                flags=re.DOTALL
            )
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ {filename} - Bahçe Aletleri eklendi")
            updated_count += 1
        else:
            print(f"⚠️ {filename} - Pattern bulunamadı")
    
    print(f"\n📊 Toplam {updated_count} dosya güncellendi")

if __name__ == '__main__':
    add_bahce_to_kategori_pages()
