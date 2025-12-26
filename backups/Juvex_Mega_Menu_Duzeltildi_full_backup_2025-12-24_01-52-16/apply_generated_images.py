import shutil
import os
import re

def main():
    # Mapping of generated absolute path to target relative filename in gorseller
    moves = [
        (r'C:/Users/pc/.gemini/antigravity/brain/602dca4b-0896-4dd2-99fb-46ec8e37172d/category_kaynak_1765469295511.png', 'category_kaynak.png', 'kaynak-malzemeleri'),
        (r'C:/Users/pc/.gemini/antigravity/brain/602dca4b-0896-4dd2-99fb-46ec8e37172d/category_boya_1765469327643.png', 'category_boya.png', 'boyalar-boya-malzemeleri'),
        (r'C:/Users/pc/.gemini/antigravity/brain/602dca4b-0896-4dd2-99fb-46ec8e37172d/category_is_guvenligi_1765469362892.png', 'category_is_guvenligi.png', 'is-guvenligi-ve-calisma-ekipmanlari')
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
            # Find the category block. 
            # Pattern: 'slug': { ... image: 'old_image', ... }
            # Actually structure is: 'slug': { ..., image: '...' }
            
            # Regex to find image within the specific category block
            # We can search for the line starting with '    'slug': {' and ending with next '},' 
            # But the structure is multiline.
            
            # Find the start of the category block
            block_start = js_content.find(f"'{category_slug}': {{")
            if block_start != -1:
                # Find the 'image:' key inside this block (before next '},')
                # A simple way is to find the first 'image:' after block_start
                # But confirm it belongs to this block (check indent or distance?)
                # Safety check: ensure no "}," between block_start and image line.
                
                # Let's search safe.
                # Construct regex for the specific image line within the block
                # We know the key is `image:`
                
                pattern = re.compile(f"('{category_slug}': {{.*?image: ')([^']+)", re.DOTALL)
                match = pattern.search(js_content)
                if match:
                    # Check if the match is actually for the correct slug (it is because included in regex)
                    # Use replace on the full match, but substitute group 2
                    
                    # Wait, regex search across whole file with that pattern is safe.
                    # It finds "'slug': { ... image: '" and captures the existing value.
                    
                    new_val = f"gorseller/{filename}"
                    # replace the group 2
                    # We can't easily replace group 2 with sub.
                    
                    # Let's string replace the match
                    old_full = match.group(0) # 'slug': { ... image: 'old_path
                    new_full = old_full.replace(match.group(2), new_val)
                    
                    js_content = js_content.replace(old_full, new_full)
                    print(f"Updated JS for {category_slug}")
                else:
                    print(f"Could not find image key for {category_slug}")
            else:
                 print(f"Could not find block for {category_slug}")
        else:
            print(f"Source file not found: {src}")

    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

if __name__ == '__main__':
    main()
