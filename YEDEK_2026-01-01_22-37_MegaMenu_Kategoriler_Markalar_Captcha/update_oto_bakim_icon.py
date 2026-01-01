import os
import glob
import re

def update_oto_bakim_icon():
    # Update categories-data.js
    path_data = r'c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js'
    with open(path_data, 'r', encoding='utf-8') as f:
        data_content = f.read()
    
    # It has icon: 'fa-car-wrench' which is correct.
    # But user says it is missing.
    # Maybe fa-car-wrench is valid in Font Awesome 6.5.1? Yes it should be.
    # Maybe fallback to fa-screwdriver-wrench if needed, but that is used for Hirdavat.
    # Or fa-wrench.
    
    # If the user says "missing", maybe the font awesome class is wrong or not rendering.
    # Let's try changing it to 'fa-wrench' or just ensure it is correct.
    # In index.html it is <i class="fa-solid fa-car-wrench"></i>
    
    # Let's assume fa-car-wrench is problematic for some reason or they want a different one.
    # OR maybe they meant the PREVIOUS request's category which I fixed?
    # No, specific "Oto Bakım ve Tamir Malzemeleri".
    
    # Let's try 'fa-tools' or 'fa-wrench'. 
    # Or maybe the I tag is empty? In the file view it shows:
    # <i class="fa-solid fa-car-wrench"></i>
    # So it is there.
    
    # If the user sees "no icon", maybe it is invisible (white on white?) or invalid class.
    # Let's change it to 'fa-screwdriver-wrench' (but generic) or 'fa-gears'.
    # Actually, 'fa-car-wrench' was introduced in v6.
    # The site uses v6.5.1.
    
    # I will replace it with 'fa-toolbox' just to be safe and distinct.
    # OR maybe simply re-apply it if it was somehow broken in other files.
    
    # I'll update to 'fa-toolbox' as a safe alternative, or 'fa-wrench'.
    # Let's use 'fa-wrench'.
    
    new_icon = 'fa-wrench'
    
    if "icon: 'fa-car-wrench'" in data_content:
        data_content = data_content.replace("icon: 'fa-car-wrench'", f"icon: '{new_icon}'")
        with open(path_data, 'w', encoding='utf-8') as f:
            f.write(data_content)
        print(f"Updated categories-data.js icon to {new_icon}")

    # Update index.html
    path_index = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path_index, 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Regex for Menu Item
    # <div class="menu-item-left">\s*<i class="fa-solid fa-car-wrench"></i>
    pattern = re.compile(r'(<div class="menu-item-left">\s*)<i class="fa-solid fa-car-wrench"></i>(\s*<span>Oto Bakım ve Tamir Malzemeleri</span>)', re.DOTALL)
    
    if pattern.search(index_content):
        index_content = pattern.sub(rf'\1<i class="fa-solid {new_icon}"></i>\2', index_content)
        with open(path_index, 'w', encoding='utf-8') as f:
            f.write(index_content)
        print(f"Updated index.html menu icon to {new_icon}")
    else:
        print("Could not find fa-car-wrench pattern in index.html")

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
    update_oto_bakim_icon()
    sync_mega_menu()
