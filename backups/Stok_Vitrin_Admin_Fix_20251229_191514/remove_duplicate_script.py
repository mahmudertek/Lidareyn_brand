
import os

base_dir = r"c:\Users\pc\Desktop\Lidareyn_brand"
html_files = [
    'kategoriler/is-guvenligi-ve-calisma-ekipmanlari.html',
    'kategoriler/kaynak-malzemeleri.html',
    'kategoriler/yapi-kimyasallari.html',
    'kategoriler/nalbur-yapi-malzemeleri.html',
    'kategoriler/elektrikli-el-aletleri.html',
    'kategoriler/olcme-ve-kontrol-aletleri.html',
    'kategoriler/el-aletleri.html',
    'kategoriler/hirdavat-el-aletleri.html',
    'kategoriler/asindirici-kesici.html'
]

# The script tag I likely added or existing one
search_str = 'mobile-menu.js'

for rel_path in html_files:
    file_path = os.path.join(base_dir, rel_path)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        count = content.count(search_str)
        
        if count > 1:
            print(f"Duplicate found in {rel_path}. Removing the last occurrence.")
            # Remove the last instance of the script tag block including src="../mobile-menu.js"
            # It's safer to target the exact string I added if possible, but regex or rfind can work.
            
            # Simple approach: split by the script tag and re-join all but the last one? 
            # But the existing one might have diff attributes? Assumed src="../mobile-menu.js"
            
            target_tag = '<script src="../mobile-menu.js"></script>'
            
            if content.count(target_tag) > 1:
                 # Remove the last one
                 last_pos = content.rfind(target_tag)
                 new_content = content[:last_pos] + content[last_pos + len(target_tag):]
                 
                 with open(file_path, 'w', encoding='utf-8') as f:
                     f.write(new_content)
            else:
                print("Could not find exact duplicate tag match, skipping auto-fix.")

