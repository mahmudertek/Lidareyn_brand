import os
import re

# HTML dosyalarının bulunduğu dizin
base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'

# Backups klasörünü hariç tut
exclude_dirs = ['backups', 'backend', 'node_modules', '.git', 'assets', 'gorseller', 'admin', 'kategoriler']

# Config.js script tag'i
config_script = '    <script src="config.js"></script>\n'

# HTML dosyalarını bul ve güncelle
updated_files = []

for root, dirs, files in os.walk(base_dir):
    # Hariç tutulacak dizinleri atla
    dirs[:] = [d for d in dirs if d not in exclude_dirs]
    
    for file in files:
        if file.endswith('.html'):
            file_path = os.path.join(root, file)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Eğer config.js zaten eklenmişse atla
                if 'config.js' in content:
                    continue
                
                # auth.js'den önce config.js'i ekle
                if '<script src="auth.js"></script>' in content:
                    new_content = content.replace(
                        '<script src="auth.js"></script>',
                        config_script + '    <script src="auth.js"></script>'
                    )
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    updated_files.append(file)
                    print(f'✅ Updated: {file}')
                
            except Exception as e:
                print(f'❌ Error processing {file}: {e}')

print(f'\n📊 Total files updated: {len(updated_files)}')
print('\n✅ Config.js successfully added to all HTML files!')
