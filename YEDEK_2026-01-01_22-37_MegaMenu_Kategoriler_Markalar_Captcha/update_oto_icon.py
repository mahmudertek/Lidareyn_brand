import os
import glob
import re

def update_oto_icon():
    # Update categories-data.js
    path_data = r'c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js'
    with open(path_data, 'r', encoding='utf-8') as f:
        data_content = f.read()
    
    if "icon: 'fa-car'" in data_content:
        data_content = data_content.replace("icon: 'fa-car'", "icon: 'fa-car-side'")
        with open(path_data, 'w', encoding='utf-8') as f:
            f.write(data_content)
        print("Updated categories-data.js icon to fa-car-side")
    else:
        print("fa-car icon not found in categories-data.js (or already updated)")

    # Update index.html
    path_index = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path_index, 'r', encoding='utf-8') as f:
        index_content = f.read()
        
    # We are looking for the Otomobil & Motosiklet LI block
    # It currently matches: <i class="fa-solid fa-car"></i>\n\s*<span>Otomobil & Motosiklet</span>
    
    # Let's simple replace fa-car with fa-car-side specifically for this block?
    # Or just globally replace fa-car if it's not used elsewhere?
    # fa-car might be used in sub-categories?
    # Let's check sub-categories. 
    # Otomobil sub-menu has no icons.
    # Other places?
    # It's safer to target the specific block or string.
    
    # Regex for Menu Item
    # <div class="menu-item-left">\s*<i class="fa-solid fa-car"></i>
    pattern = re.compile(r'(<div class="menu-item-left">\s*)<i class="fa-solid fa-car"></i>(\s*<span>Otomobil & Motosiklet</span>)', re.DOTALL)
    
    if pattern.search(index_content):
        index_content = pattern.sub(r'\1<i class="fa-solid fa-car-side"></i>\2', index_content)
        with open(path_index, 'w', encoding='utf-8') as f:
            f.write(index_content)
        print("Updated index.html menu icon to fa-car-side")
    else:
        print("Could not find fa-car pattern in index.html")
        # Maybe it was already fa-car-side?
        if 'fa-car-side' in index_content:
             print("Already fa-car-side?")

def sync_mega_menu():
    path_index = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path_index, 'r', encoding='utf-8') as f:
        source_content = f.read()
    
    mega_menu_match = re.search(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', source_content, re.DOTALL)
    
    if not mega_menu_match:
        print("Could not extract Mega Menu from index.html")
        return
        
    mega_menu_block = mega_menu_match.group(1)
    
    files = glob.glob(os.path.join(r'c:\Users\pc\Desktop\Lidareyn_brand', '*.html')) + glob.glob(os.path.join(r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler', '*.html'))
    
    count = 0
    for file_path in files:
        if os.path.abspath(file_path) == os.path.abspath(path_index):
            continue
        if 'backups' in file_path or 'admin' in file_path:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        target_pattern = re.compile(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', re.DOTALL)
        
        if target_pattern.search(content):
            block_to_insert = mega_menu_block
            
            is_subdir = 'kategoriler' in os.path.dirname(os.path.abspath(file_path))
            if is_subdir:
                block_to_insert = block_to_insert.replace('href="kategoriler/', 'href="')
                block_to_insert = block_to_insert.replace('"index.html', '"../index.html')
                block_to_insert = block_to_insert.replace('"gorseller/', '"../gorseller/')
                block_to_insert = block_to_insert.replace('"assets/', '"../assets/')
                
            new_content = target_pattern.sub(block_to_insert, content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
    
    print(f"Synced Mega Menu to {count} files.")

if __name__ == '__main__':
    update_oto_icon()
    sync_mega_menu()
