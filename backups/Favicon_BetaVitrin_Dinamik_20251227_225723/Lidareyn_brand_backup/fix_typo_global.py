
import os

ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'

def fix_typos(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix encoding attribute typo
    content = content.replace('chÇarşıset', 'charset')
    
    # Fix description typos
    content = content.replace('onÇarşım', 'onarım')
    content = content.replace('ekipmanlÇarşı', 'ekipmanları')
    content = content.replace('servis ekipmanlÇarşı', 'servis ekipmanları')
    
    # Also seen: Galata Çarşıet -> Galata Market? No, charset likely from "ar" -> "Çarşı" replacement.
    # Check if there are other obviously broken tags 
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed typos in {file_path}")

for root, dirs, files in os.walk(ROOT_DIR):
    for file in files:
        if file.endswith('.html'):
            fix_typos(os.path.join(root, file))
