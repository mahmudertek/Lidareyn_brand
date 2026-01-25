import os
import re

# Google Favicon Standartları ve SEO Temizliği
SOURCE_DIR = r"C:\Users\pc\Desktop\Lidareyn_brand"

FAVICON_BLOCK = """    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#8b7bd8">"""

def fix_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Eğer head yoksa atla
    if '<head>' not in content:
        return

    # Eski favicon ve karmaşık meta tagları temizlemek için agresif regex
    # <head> ile ilk <title> veya <script> veya <link> arasındaki alanı hedefle
    head_start_idx = content.find('<head>') + 6
    
    # Mevcut favicon linklerini temizle
    content = re.sub(r'<link rel="icon".*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link rel="apple-touch-icon".*?>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<link rel="manifest".*?>', '', content, flags=re.IGNORECASE)

    # Yeni bloğu başa ekle
    new_content = content[:head_start_idx] + "\n" + FAVICON_BLOCK + content[head_start_idx:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

# Tüm alt klasörleri dolaş
for root, dirs, files in os.walk(SOURCE_DIR):
    # .git, backups vb. klasörleri atla
    if any(x in root for x in ['.git', 'backups', 'SUNUCU_KLASORU']):
        continue
        
    for file in files:
        if file.endswith(".html"):
            full_path = os.path.join(root, file)
            try:
                fix_html_file(full_path)
                print(f"✅ Hazır: {file}")
            except Exception as e:
                print(f"❌ Hata ({file}): {e}")

print("\n🚀 Tüm sayfalar Google Favicon standartlarına uyarlandı!")
