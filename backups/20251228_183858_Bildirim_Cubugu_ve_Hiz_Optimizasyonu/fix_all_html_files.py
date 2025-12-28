import os
import re

# Ana dizindeki tüm HTML dosyaları (kategoriler dışında kalanlar)
directory = r'c:\Users\pc\Desktop\Lidareyn_brand'
favicon_tag = '<link rel="icon" type="image/png" href="assets/favicon.png">\n    <link rel="apple-touch-icon" href="assets/favicon.png">'

def fix_html_content(content):
    if '<meta charset="UTF-8">' not in content:
        content = re.sub(r'<head>', '<head>\n    <meta charset="UTF-8">', content, flags=re.IGNORECASE)
    
    if 'favicon.png' not in content:
        content = re.sub(r'</title>', '</title>\n    ' + favicon_tag, content, flags=re.IGNORECASE)

    # Footer: "Popüler Sayfalar" sütununu sil
    footer_pattern = re.compile(r'<div class="popular-column">.*?<h2 class="popular-title">Popüler Sayfalar</h2>.*?</ul>.*?</div>', re.DOTALL | re.IGNORECASE)
    content = footer_pattern.sub('', content)

    # Popüler Markalar sütununu ortala
    content = content.replace('<div class="popular-column">', '<div class="popular-column" style="flex: 1; text-align: center;">')
    content = content.replace('<ul class="popular-list">', '<ul class="popular-list" style="justify-content: center;">')

    return content

for filename in os.listdir(directory):
    # index.html ve admin/ dışındaki HTML'ler
    if filename.endswith('.html') and filename != 'index.html':
        path = os.path.join(directory, filename)
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            fixed_content = fix_html_content(content)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
        except:
            pass

print("✅ Tüm ana sayfa HTML'leri güncellendi.")
