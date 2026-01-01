
import os
import re

BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"

FAVICON_ROOT = """
    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="favicon.png">
"""

FAVICON_SUB = """
    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../favicon.png">
"""

def fix_all():
    count_badges = 0
    count_favicons = 0
    total_files = 0
    
    for root, dirs, files in os.walk(BASE_DIR):
        # Exclude directories
        if 'backups' in root or 'admin' in root or '.git' in root or 'node_modules' in root or 'backend' in root:
            continue
            
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                rel_path = os.path.relpath(root, BASE_DIR)
                is_root = (rel_path == '.')
                
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # 1. Badge Temizliği: <span class="cart-count">...</span> -> <span class="cart-count"></span>
                    # Regex ile içeride ne varsa sil (whitespace, 0, rakam vb.)
                    content = re.sub(r'<span class="cart-count">.*?</span>', r'<span class="cart-count"></span>', content, flags=re.DOTALL)

                    # 2. Favicon Temizliği ve Ekleme
                    # Eski favicon linklerini temizle (sadece bizim eklediklerimizi değil, hepsini)
                    # Ancak dikkatli olmalı, başka <link> leri silmemeli.
                    # rel="icon", rel="shortcut icon", rel="apple-touch-icon"
                    
                    # Remove existing icon links
                    content = re.sub(r'<link\s+rel=["\']icon["\'][^>]*>', '', content, flags=re.IGNORECASE)
                    content = re.sub(r'<link\s+rel=["\']shortcut icon["\'][^>]*>', '', content, flags=re.IGNORECASE)
                    content = re.sub(r'<link\s+rel=["\']apple-touch-icon["\'][^>]*>', '', content, flags=re.IGNORECASE)
                    
                    # Clean up empty lines created by removal could be nice but not strictly necessary
                    
                    # Yeni faviconları ekle (Head başlangıcına)
                    insertion = FAVICON_ROOT if is_root else FAVICON_SUB
                    
                    if '<head>' in content:
                        # <head> tagini bulup hemen sonrasına ekle
                        content = re.sub(r'(<head[^>]*>)', r'\1' + insertion, content, count=1, flags=re.IGNORECASE)
                        count_favicons += 1
                    
                    if content != original_content:
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        count_badges += 1
                        
                    total_files += 1

                except Exception as e:
                    print(f"Hata {file}: {e}")

    print(f"Islem tamamlandi. {total_files} dosya tarandi. {count_badges} dosya guncellendi.")

if __name__ == "__main__":
    fix_all()
