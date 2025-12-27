import os

css_link = '<link rel="stylesheet" href="../category-header-fix.css">'
directory = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'category-header-fix.css' not in content:
            # style.css'den sonra ekle
            content = content.replace('style.css?v=201">', 'style.css?v=201">\n    ' + css_link)
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print("✅ CSS yaması tüm kategori sayfalarına eklendi.")
