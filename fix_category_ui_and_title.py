import os
import re

def fix_categories():
    base_path = r'C:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    files = [f for f in os.listdir(base_path) if f.endswith('.html')]
    
    # Mapping for correct titles
    titles = {
        'akulu-aletler.html': 'Akülü Aletler',
        'jeneratorler.html': 'Jeneratörler',
        'hobi-aletleri.html': 'Hobi Aletleri',
        'aksesuarlar.html': 'Aksesuarlar',
        'elektrikli-el-aletleri.html': 'Elektrikli El Aletleri',
        'olcme-ve-kontrol-aletleri.html': 'Ölçme ve Kontrol Aletleri',
        'asindirici-kesici.html': 'Aşındırıcı ve Kesici Uçlar',
        'yapi-kimyasallari.html': 'Yapıştırıcı, Dolgu ve Kimyasallar',
        'kaynak-malzemeleri.html': 'Kaynak Malzemeleri',
        'hirdavat-el-aletleri.html': 'Hırdavat ve El Aletleri',
        'is-guvenligi-ve-calisma-ekipmanlari.html': 'İş Güvenliği ve Çalışma Ekipmanları',
        'bahce-aletleri.html': 'Bahçe Aletleri'
    }

    for filename in files:
        filepath = os.path.join(base_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Fix Title
        if filename in titles:
            correct_title = f"{titles[filename]} - Galata Çarşı"
            content = re.sub(r'<title>.*?</title>', f'<title>{correct_title}</title>', content)

        # 2. Add hybrid_category_styles.css if missing
        if 'hybrid_category_styles.css' not in content:
            # Insert before </head>
            content = content.replace('</head>', '    <link rel="stylesheet" href="../hybrid_category_styles.css?v=2">\n</head>')
        else:
            # Force update version if already exists
            content = re.sub(r'hybrid_category_styles\.css\?v=\d+', 'hybrid_category_styles.css?v=2', content)

        # 3. Clean Description (if it says Hırdavat/Oto incorrectly)
        if filename == 'aksesuarlar.html':
            content = content.replace('Oto bakım, tamir, onarım Ürünleri ve servis ekipmanları en uygun fiyatlarla.', 'Profesyonel Elmas Testereler, Matkap Uçları ve El Aletleri Aksesuarları.')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filename}")

if __name__ == "__main__":
    fix_categories()
