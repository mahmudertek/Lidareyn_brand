
import os

# Define the directory and files
categories_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
root_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'

# Define replacements map (Target -> Replacement)
replacements = {
    '245 rn': '245 Ürün',
    'nerilen Sralama': 'Önerilen Sıralama',
    'En Dk Fiyat': 'En Düşük Fiyat',
    'En Yksek Fiyat': 'En Yüksek Fiyat',
    'En ok Satanlar': 'En Çok Satanlar',
    'Hakkmzda': 'Hakkımızda',
    'letiim': 'İletişim',
    'Maazalarmz': 'Mağazalarımız',
    'Szlemeler': 'Sözleşmeler',
    'Aydnlatma': 'Aydınlatma',
    'Mesafeli Sat Szlemesi': 'Mesafeli Satış Sözleşmesi',
    'Gvenlik': 'Güvenlik',
    'ade ve ptal Koullar': 'İade ve İptal Koşulları',
    'Sipari Takibi': 'Sipariş Takibi',
    'yelik': 'Üyelik',
    'ye Giri': 'Üye Giriş',
    'ifremi Unuttum': 'Şifremi Unuttum',
    'Ska Sorulan': 'Sıkça Sorulan',
    'Mteri Hizmetleri': 'Müşteri Hizmetleri',
    'alma Saatleri': 'Çalışma Saatleri',
    'Hafta ii': 'Hafta içi',
    'Gvenli deme': 'Güvenli Ödeme',
    'Tm demeleriniz': 'Tüm ödemeleriniz',
    'sertifikas ile gvence altndadr': 'sertifikası ile güvence altındadır',
    'Hrdavat': 'Hırdavat',
    'ar': 'Çarşı', # Be careful with this one
    'Oto bakm': 'Oto bakım',
    'rnleri': 'Ürünleri',
    'ekipmanlar': 'ekipmanları',
    'zmparalama': 'zımparalama',
    'Delici & Vidalama': 'Delici & Vidalama', # Check existing
    'Kesme & Talama': 'Kesme & Taşlama',
    'Talama ve Kesme': 'Taşlama ve Kesme',
    'Byk': 'Büyük',
    'Gnye': 'Gönye',
    'Yzey leme': 'Yüzey İşleme',
    'Zmparalar': 'Zımparalar',
    'Titreim': 'Titreşim',
    'erit': 'Şerit',
    'Dier Makineler': 'Diğer Makineler',
    'Akl Alet': 'Akülü Alet',
    'lcme': 'Ölçme',
    'Mekanik lm': 'Mekanik Ölçüm',
    'erit Metreler': 'Şerit Metreler',
    'elik Metreler': 'Çelik Metreler',
    'Terazi & A': 'Terazi & Açı',
    'A ler': 'Açı Ölçerler',
    'Grntleme': 'Görüntüleme',
    'lemler': 'İşlemler',
    'Insaat': 'İnşaat',
    'Yaptrc': 'Yapıştırıcı',
    'Kpkle': 'Köpükler',
    'Frca': 'Fırça',
    'Asindirici': 'Aşındırıcı',
    'Uclar': 'Uçlar',
    'Mknatsl': 'Mıknatıslı'
}

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(filepath, 'r', encoding='mbcs') as f:
                content = f.read()
        except:
            print(f"Skipping {filepath} due to encoding errors.")
            return

    original_content = content
    for target, replacement in replacements.items():
        content = content.replace(target, replacement)
    
    # Generic 'rn' fix (dangerous but necessary given the screenshot)
    # The screenshot shows "245 rn". This is specifically "245 rn" -> "245 Ürün".
    # But also "rn 2" -> "Ürün 2" in product cards.
    content = content.replace(' rn', ' Ürün') 
    content = content.replace('rn ', 'Ürün ')
    # Fix broken "Galata ar" title
    content = content.replace('Galata ar', 'Galata Çarşı')

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
    else:
        print(f"No changes: {filepath}")

# Process category files
if os.path.exists(categories_dir):
    for filename in os.listdir(categories_dir):
        if filename.endswith(".html"):
            fix_file(os.path.join(categories_dir, filename))

# Process specific root files that incorporate category-like structures
root_files = ['populer.html', 'yeni-gelenler.html', 'index.html'] 
for filename in root_files:
    path = os.path.join(root_dir, filename)
    if os.path.exists(path):
        fix_file(path)
