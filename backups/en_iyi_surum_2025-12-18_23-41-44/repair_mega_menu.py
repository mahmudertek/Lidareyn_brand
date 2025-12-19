import re
import os

# 1. Define Categories Data explicitly to ensure we have the source of truth
# This mirrors the content of categories-data.js you viewed
categories_data = {
    'elektrikli-el-aletleri': {
        'title': 'Elektrikli El Aletleri',
        'icon': 'fa-plug',
        'subcategories': [
            {'name': 'Delme & Vidalama', 'items': ['Akülü Vidalama', 'Darbeli Matkap', 'Kırıcı Delici']},
            {'name': 'Kesme & Taşlama', 'items': ['Avuç Taşlama', 'Dekupaj Testere', 'Daire Testere']},
            {'name': 'Zımpara & Polisaj', 'items': ['Eksantrik Zımpara', 'Tank Zımpara', 'Polisaj Makinesi']},
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
            {'name': 'Boya & İzolasyon', 'items': ['Boyalar ve Boya Malzemeleri (Fırça, Rulo, Tiner)', 'İzolasyon Malzemeleri']},
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

# Define desired order (matching the visual flow of the site)
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

# Generate HTML
html_output = ""
for slug in order:
    if slug not in categories_data:
        continue
    
    data = categories_data[slug]
    
    html_output += f"""                                <li>
                                    <a href="kategoriler/{slug}.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid {data['icon']}"></i>
                                            <span>{data['title']}</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
"""
    
    # Subcategories
    for sub in data['subcategories']:
        html_output += f"""                                        <div class="sub-menu-column">
                                            <h4>{sub['name']}</h4>
                                            <ul>
"""
        for item in sub['items']:
            html_output += f"""                                                <li><a href="#">{item}</a></li>
"""
        html_output += """                                            </ul>
                                        </div>
"""
    
    html_output += """                                    </div>
                                </li>
"""

# Read index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the mega-menu-list section
start_marker = '<ul class="mega-menu-list">'
end_marker = '</ul>'

# Use regex to find the block specifically inside the nav to avoid wrong matches
# Looking for <ul class="mega-menu-list"> ... </ul>
pattern = r'(<ul class="mega-menu-list">\s*)([\s\S]*?)(\s*</ul>)'
match = re.search(pattern, content)

if match:
    full_match = match.group(0)
    start_ul = match.group(1)
    old_content = match.group(2)
    end_ul = match.group(3)
    
    new_block = start_ul + html_output + "                            " + end_ul
    
    new_content = content.replace(full_match, new_block)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully repaired mega menu structure.")
else:
    print("Could not find mega-menu-list in index.html")
