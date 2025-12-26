import shutil
import os
import re

def main():
    # Mapping of generated absolute path to target relative filename in gorseller
    moves = [
        (r'C:/Users/pc/.gemini/antigravity/brain/602dca4b-0896-4dd2-99fb-46ec8e37172d/category_kapi_pencere_1765469467846.png', 'category_kapi_pencere.png', 'kapi-pencere-cerceve'),
        (r'C:/Users/pc/.gemini/antigravity/brain/602dca4b-0896-4dd2-99fb-46ec8e37172d/category_tesisat_1765469499102.png', 'category_tesisat.png', 'tesisat-malzemeleri'),
        (r'C:/Users/pc/.gemini/antigravity/brain/602dca4b-0896-4dd2-99fb-46ec8e37172d/category_hirdavat_1765469534640.png', 'category_hirdavat.png', 'hirdavat-el-aletleri')
    ]
    
    target_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\gorseller'
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
        
    js_path = r'c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js'
    with open(js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()
        
    for src, filename, category_slug in moves:
        dst = os.path.join(target_dir, filename)
        # Normalize paths
        src = os.path.normpath(src)
        dst = os.path.normpath(dst)
        
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied {filename}")
            
            # Update JS
            pattern = re.compile(f"('{category_slug}': {{.*?image: ')([^']+)", re.DOTALL)
            match = pattern.search(js_content)
            if match:
                new_val = f"gorseller/{filename}"
                old_full = match.group(0) # 'slug': { ... image: 'old_path
                new_full = old_full.replace(match.group(2), new_val)
                js_content = js_content.replace(old_full, new_full)
                print(f"Updated JS for {category_slug}")
            else:
                print(f"Could not find image key for {category_slug}")
        else:
            print(f"Source file not found: {src}")

    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

if __name__ == '__main__':
    main()
