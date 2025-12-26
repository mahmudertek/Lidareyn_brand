import re
import os

# index.html'den header'ı çek
with open(r'c:\Users\pc\Desktop\Lidareyn_brand\index.html', 'r', encoding='utf-8') as f:
    index_content = f.read()

header_match = re.search(r'(<header class="main-header" role="banner">.*?</header>)', index_content, re.DOTALL)
if not header_match:
    print("Header not found in index.html")
    exit()

original_header = header_match.group(1)

# Hedef dosyalar: juvex.html ve diğer kök HTML dosyaları (header içermesi gerekenler)
# Bu dosyalar 'kategoriler' klasöründe OLMADIĞI için link dönüşümü yapmamıza GEREK YOK.
# Direkt index.html header'ını yapıştırabiliriz.

target_files = [
    'juvex.html',
    'yeni-gelenler.html',
    'populer.html',
    'giris-yap.html',
    'favoriler.html',
    'sepet.html',
    'sifremi-unuttum.html',
    'hakkimizda.html',
    'iletisim.html',
    'magazalar.html',
    'kvkk.html',
    'mesafeli-satis-sozlesmesi.html',
    'gizlilik-guvenlik.html',
    'iade-iptal.html',
    'siparis-takibi.html',
    'yeni-uyelik.html',
    'uye-giris.html',
    'sss.html'
]

base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'

for filename in target_files:
    path = os.path.join(base_dir, filename)
    if not os.path.exists(path):
        print(f"File skipped (not found): {filename}")
        continue
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Kök dizindeki dosyalar header'ı index.html ile aynı kullanır, path değişimi gerekmez.
    # Ancak mevcut header'ı bulup değiştirmemiz lazım.
    
    new_content = re.sub(r'<header.*?</header>', original_header, content, flags=re.DOTALL | re.IGNORECASE)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed header in: {filename}")
    else:
        print(f"Header already up to date or not found in: {filename}")

# Ayrıca tekrar kategori sayfalarını da garantiye alalım (önceki script yapmıştı ama olsun)
print("Root files sync complete.")
