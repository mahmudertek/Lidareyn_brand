import os
import re

NOTICE_HTML = """
    <!-- Geliştirme Aşaması Bildirimi -->
    <div class="development-notice">
        <div class="notice-content">
            <i class="fa-solid fa-circle-info"></i>
            <span>Sitemiz gelişme aşamasındadır. Siparişleriniz için <a href="mailto:mail@galatacarsi.com">mail</a> veya <a href="https://wa.me/905550501374" target="_blank">WhatsApp</a> yoluyla ulaşabilirsiniz.</span>
        </div>
    </div>
"""

EXCLUDE_DIRS = {'admin', 'backend', 'backups', 'assets', 'gorseller', '.git', 'node_modules', '.agent', '.vscode'}
EXCLUDE_FILES = {'bakimda.html', 'maintenance.html', 'mega-menu-template.html', 'footer-extra.html', 'hero-gradient.html', 'simple_image_test.html', 'test-icons.html', 'test-images.html', 'test_all_images.html', 'test_bebek_image.html'}

BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"

def add_notice_recursive():
    count = 0
    skipped = 0
    total_scanned = 0

    print("Basliyor...")

    for root, dirs, files in os.walk(BASE_DIR):
        # Klasörleri filtrele (yerinde modifikasyon ile alt klasörlere inmesini engelle)
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file.endswith(".html") and file not in EXCLUDE_FILES:
                total_scanned += 1
                filepath = os.path.join(root, file)
                
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Zaten eklenmiş mi kontrol et
                    if 'class="development-notice"' in content:
                        skipped += 1
                        continue

                    # Body etiketini bul ve sonrasına ekle
                    if '<body' in content:
                        # Regex ile body açılış etiketinden sonra ekle (case insensitive)
                        new_content = re.sub(r'(<body[^>]*>)', r'\1' + NOTICE_HTML, content, count=1, flags=re.IGNORECASE)
                        
                        if new_content != content:
                            with open(filepath, 'w', encoding='utf-8') as f:
                                f.write(new_content)
                            print(f"EKLENDI: {file}")
                            count += 1
                        else:
                            print(f"UYARI (Degisiklik Yok): {file}")
                    else:
                        print(f"UYARI (Body Yok): {file}")
                        
                except Exception as e:
                    print(f"HATA ({file}): {e}")

    print(f"\n--- SONUC ---")
    print(f"Taranan: {total_scanned}")
    print(f"Atlanan (Zaten Var): {skipped}")
    print(f"Guncellenen: {count}")

if __name__ == "__main__":
    add_notice_recursive()
