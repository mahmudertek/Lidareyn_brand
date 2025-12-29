
import os
import re

CATEGORIES_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

for filename in os.listdir(CATEGORIES_DIR):
    if not filename.endswith(".html"):
        continue

    filepath = os.path.join(CATEGORIES_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = content
        
        # specific fix for register link
        if 'href="giris-yap.html?tab=register"' in new_content:
            new_content = new_content.replace('href="giris-yap.html?tab=register"', 'href="../giris-yap.html?tab=register"')
            print(f"Fixed register link in {filename}")
            
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)

    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Link fix completed.")
