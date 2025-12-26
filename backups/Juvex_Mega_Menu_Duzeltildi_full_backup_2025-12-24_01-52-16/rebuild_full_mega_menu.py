import re

# Read categories-data.js to get subcategories
categories_full = {
    'elektrikli-el-aletleri': {
        'title': 'Elektrikli El Aletleri',
        'icon': 'fa-plug',
        'subcategories': [
            {'name': 'Delme & Vidalama', 'items': ['Akülü Vidalama', 'Darbeli Matkap', 'Kırıcı Delici']},
            {'name': 'Kesme & Taşlama', 'items': ['Avuç Taşlama', 'Dekupaj Testere', 'Daire Testere']},
            {'name': 'Zımpara & Polisaj', 'items': ['Eksantrik Zımpara', 'Tank Zımpara', 'Polisaj Makinesi']}
        ]
    },
    'olcme-ve-kontrol-aletleri': {
        'title': 'Ölçme & Kontrol Aletleri',
        'icon': 'fa-ruler-combined',
        'subcategories': [
            {'name': 'Lazerli Ölçüm', 'items': ['Lazerli Ölçüm Cihazları (Mesafe Ölçer)', 'Lazer Hizalamalar (Çizgi, Nokta)']},
            {'name': 'Mekanik Ölçüm', 'items': ['Şerit Metreler', 'Çelik Metreler', 'Kumpaslar (Dijital, Analog)', 'Mikrometreler']},
            {'name': 'Terazi & Açı', 'items': ['Su Terazileri (Dijital, Klasik)', 'Açı Ölçerler', 'Dijital Tartılar']},
            {'name': 'Görüntüleme', 'items': ['Endoskoplar']}
        ]
    },
    'hirdavat-el-aletleri': {
        'title': 'Hırdavat ve El Aletleri',
        'icon': 'fa-screwdriver-wrench',
        'subcategories': [
            {'name': 'Ölçü Aletleri', 'items': ['Ölçü Aletleri (Metre, Su Terazisi, Gönye)']},
            {'name': 'Kesici & Delici', 'items': ['Kesici ve Delici Aletler (Testere, Matkap Uçları)']},
            {'name': 'Sıkıştırma & Tutma', 'items': ['Sıkıştırma ve Tutma Aletleri (Pense, İngiliz Anahtarı, Mengene)']},
            {'name': 'Vurucu Aletler', 'items': ['Vurucu Aletler (Çekiç, Balta)']}
        ]
    },
    'oto-bakim-tamir': {
        'title': 'Oto Bakım ve Tamir Malzemeleri',
        'icon': 'fa-wrench',
        'subcategories': [
            {'name': 'Kaldırma ve Taşıma', 'items': ['Kriko ve Sehpalar']},
            {'name': 'Takviye ve Bakım', 'items': ['Akü Takviye Kabloları', 'Yağlama Pompaları ve Gres Tabancaları']},
            {'name': 'Lastik Onarım', 'items': ['Lastik Tamir Kitleri']},
            {'name': 'Depolama', 'items': ['Alet Çantaları ve Takım Dolapları']}
        ]
    },
    'nalbur-yapi-malzemeleri': {
        'title': 'Yapı ve İnşaat Malzemeleri',
        'icon': 'fa-trowel-bricks',
        'subcategories': [
            {'name': 'Kimyasal & Yapıştırıcı', 'items': ['Silikon, Mastik ve Köpükler', 'Yapıştırıcılar (Epoksi, Japon, Poliüretan)', 'Harç ve Beton Malzemeleri']},
            {'name': 'Donanım', 'items': ['Kilitler ve Menteşeler']}
        ]
    },
    'asindirici-kesici': {
        'title': 'Aşındırıcı ve Kesici Uçlar',
        'icon': 'fa-compact-disc',
        'subcategories': [
            {'name': 'Delici & Vidalama', 'items': ['Matkap Uçları (Metal, Ahşap, Beton)', 'Freze Uçları', 'Karot Uçları']},
            {'name': 'Kesme & Taşlama', 'items': ['Taşlama Diskleri', 'Kesme Diskleri']},
            {'name': 'Aşındırma ve Zımpara', 'items': ['Zımpara Kağıtları ve Bantları']}
        ]
    },
    'yapi-kimyasallari': {
        'title': 'Yapıştırıcı, Dolgu ve Kimyasallar',
        'icon': 'fa-flask',
        'subcategories': [
            {'name': 'Yapıştırıcılar', 'items': ['Silikon, Mastik ve Akrilikler', 'Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)', 'Poliüretan Köpükler']},
            {'name': 'Dolgu ve Harçlar', 'items': ['Çimento Esaslı Harçlar', 'Alçı ve Alçı Ürünleri', 'Derz Dolgular']},
            {'name': 'Kimyasallar', 'items': ['Tiner ve Çözücüler']}
        ]
    },
    'kaynak-malzemeleri': {
        'title': 'Kaynak Malzemeleri',
        'icon': 'fa-fire-burner',
        'subcategories': [
            {'name': 'Sarf Malzemeleri', 'items': ['Elektrotlar (Rutil, Bazik)', 'Kaynak Telleri (Gazaltı, Tig)']},
            {'name': 'Koruyucu Ekipman', 'items': ['Kaynak Maskeleri ve Eldivenleri']},
            {'name': 'Makine ve Aksesuar', 'items': ['Kaynak Makineleri ve Aksesuarları']}
        ]
    },
    'tesisat-malzemeleri': {
        'title': 'Tesisat Malzemeleri',
        'icon': 'fa-faucet-drip',
        'subcategories': [
            {'name': 'Su Tesisatı', 'items': ['Su Tesisatı Boru ve Ek Parçaları (PVC, PEX)']},
            {'name': 'Armatür & Vitrifiye', 'items': ['Musluk ve Bataryalar', 'Sifon ve Rezervuar Sistemleri']},
            {'name': 'Isıtma & Havalandırma', 'items': ['Isıtma Tesisatı Malzemeleri (Radyatör, Kombi Bağlantı)', 'Hava ve Havalandırma Kanalları']}
        ]
    },
    'is-guvenligi-ve-calisma-ekipmanlari': {
        'title': 'İş Güvenliği ve Çalışma Ekipmanları',
        'icon': 'fa-helmet-safety',
        'subcategories': [
            {'name': 'Koruyucu Giyim', 'items': ['Koruyucu Giyim (İş Elbisesi, Eldiven)']},
            {'name': 'Ayak & Baş Koruma', 'items': ['Ayak ve Baş Koruyucuları (Baret, Çelik Burunlu Ayakkabı)']},
            {'name': 'Göz & Kulak Koruma', 'items': ['Göz ve Kulak Koruyucuları']},
            {'name': 'Çalışma Ekipmanları', 'items': ['İş İskelesi ve Merdivenler']}
        ]
    }
}

# Define order
order = [
    'elektrikli-el-aletleri',
    'olcme-ve-kontrol-aletleri',
    'hirdavat-el-aletleri',
    'oto-bakim-tamir',
    'nalbur-yapi-malzemeleri',
    'asindirici-kesici',
    'yapi-kimyasallari',
    'kaynak-malzemeleri',
    'tesisat-malzemeleri',
    'is-guvenligi-ve-calisma-ekipmanlari'
]

# Generate full mega menu HTML
mega_menu_html = '''                            <ul class="mega-menu-list">
'''

for slug in order:
    cat = categories_full[slug]
    mega_menu_html += f'''                                <li>
                                    <a href="kategoriler/{slug}.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid {cat['icon']}"></i>
                                            <span>{cat['title']}</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
'''
    for sub in cat['subcategories']:
        mega_menu_html += f'''                                        <div class="sub-menu-column">
                                            <h4>{sub['name']}</h4>
                                            <ul>
'''
        for item in sub['items']:
            mega_menu_html += f'''                                                <li><a href="#">{item}</a></li>
'''
        mega_menu_html += '''                                            </ul>
                                        </div>
'''
    mega_menu_html += '''                                    </div>
                                </li>
'''

mega_menu_html += '''                            </ul>'''

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace mega-menu-list
pattern = r'<ul class="mega-menu-list">[\s\S]*?</ul>(?=\s*</div>\s*</li>\s*<li><a href="#flowing-menu-root")'
new_content = re.sub(pattern, mega_menu_html, content)

if new_content == content:
    # Try alternative pattern
    start = content.find('<ul class="mega-menu-list">')
    if start != -1:
        # Find the closing </ul> for mega-menu-list
        # Look for </ul></div> pattern
        end_pattern = '</ul></div>'
        end = content.find(end_pattern, start)
        if end != -1:
            end += len('</ul>')
            new_content = content[:start] + mega_menu_html + content[end:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Mega menu rebuilt with FULL subcategories!")
print(f"Total categories: {len(order)}")
for slug in order:
    cat = categories_full[slug]
    print(f"  - {cat['title']}: {len(cat['subcategories'])} subcategory groups")
