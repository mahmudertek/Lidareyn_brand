import os
import glob
import re

def create_safety_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    # Use hirdavat as template
    template_src = os.path.join(base_dir, 'hirdavat-el-aletleri.html')
    if not os.path.exists(template_src):
        template_src = os.path.join(base_dir, 'nalburiye-baglanti-elemanlari.html')
        
    dst = os.path.join(base_dir, 'is-guvenligi-ve-calisma-ekipmanlari.html')
    
    with open(template_src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replacements
    content = content.replace('Hırdavat ve El Aletleri', 'İş Güvenliği ve Çalışma Ekipmanları')
    content = re.sub(r'<p>.*?</p>', '<p>Güvenli çalışma ortamları için profesyonel koruyucu donanım ve ekipmanlar.</p>', content, count=1)
    
    # Icon
    content = content.replace('fa-screwdriver-wrench', 'fa-helmet-safety')
    
    # Grid
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-vest"></i></div>
                    <h3>Koruyucu Giyim</h3>
                    <ul class="subcategory-items">
                        <li>İş Elbiseleri</li>
                        <li>Koruyucu Eldivenler</li>
                        <li>Tulum ve Önlükler</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-hard-hat"></i></div>
                    <h3>Ayak & Baş Koruma</h3>
                    <ul class="subcategory-items">
                        <li>Baretler</li>
                        <li>Çelik Burunlu Ayakkabılar</li>
                        <li>İş Botları</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-glasses"></i></div>
                    <h3>Göz & Kulak Koruma</h3>
                    <ul class="subcategory-items">
                        <li>İş Gözlükleri</li>
                        <li>Tam Yüz Maskeleri</li>
                        <li>Kulaklık ve Tıkaçlar</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-stairs"></i></div>
                    <h3>Çalışma Ekipmanları</h3>
                    <ul class="subcategory-items">
                        <li>İş İskelesi</li>
                        <li>Merdiven Sistemleri</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>
'''
    content = re.sub(r'(<div class="subcategories-grid">).*?(</div>\s*</div>)', r'\1' + new_grid + r'\2', content, flags=re.DOTALL)
    
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {dst}")

def update_categories_data():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove nalbur-yapi-malzemeleri
    # Regex for it: 'nalbur-yapi-malzemeleri': { ... },
    pattern_rem = re.compile(r"(\s*'nalbur-yapi-malzemeleri': \{.*?\n    \},)", re.DOTALL)
    if pattern_rem.search(content):
        content = pattern_rem.sub('', content)
        print("Removed nalbur-yapi-malzemeleri")
        
    # 2. Update/Replace is-guvenligi
    # We will rename the key to 'is-guvenligi-ve-calisma-ekipmanlari' to match the request/filename style, 
    # OR keep 'is-guvenligi' but update title. 
    # Let's use 'is-guvenligi-ve-calisma-ekipmanlari' for clarity and to distinguish from old one.
    
    # Remove old 'is-guvenligi'
    pattern_rem_old = re.compile(r"(\s*'is-guvenligi': \{.*?\n    \},)", re.DOTALL)
    if pattern_rem_old.search(content):
        content = pattern_rem_old.sub('', content)
        print("Removed old is-guvenligi")

    # Add new block. Insert it where? Maybe after hirdavat?
    new_block = """    'is-guvenligi-ve-calisma-ekipmanlari': {
        title: 'İş Güvenliği ve Çalışma Ekipmanları',
        description: 'Güvenli çalışma ortamları için gerekli koruyucu donanımlar.',
        icon: 'fa-helmet-safety',
        image: 'gorseller/mega_menu_fragrance_products.png',
        subcategories: [
            { name: 'Koruyucu Giyim', items: ['Koruyucu Giyim (İş Elbisesi, Eldiven)'], icon: 'fa-vest' },
            { name: 'Ayak & Baş Koruma', items: ['Ayak ve Baş Koruyucuları (Baret, Çelik Burunlu Ayakkabı)'], icon: 'fa-hard-hat' },
            { name: 'Göz & Kulak Koruma', items: ['Göz ve Kulak Koruyucuları'], icon: 'fa-glasses' },
            { name: 'Çalışma Ekipmanları', items: ['İş İskelesi ve Merdivenler'], icon: 'fa-stairs' }
        ]
    },
"""
    # Insert after hirdavat-el-aletleri
    pattern_ins = re.compile(r"(    'hirdavat-el-aletleri': \{.*?\n    \}),\n", re.DOTALL)
    if pattern_ins.search(content):
        content = pattern_ins.sub(r"\1,\n" + new_block, content)
        print("Inserted new is-guvenligi block")
    else:
        # If hirdavat not found (maybe fallback), try appending to end of object
        print("Could not find hirdavat to insert after. Appending...")
        # Find last closing brace of object
        last_brace = content.rfind('};')
        if last_brace != -1:
             content = content[:last_brace] + new_block + content[last_brace:]
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_index_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Remove "Yapı Malzemeleri & Nalburiye" LI block
    # It contains "Yapı Malzemeleri & Nalburiye" in span
    # Use regex to find grouping.
    
    # Needs to be robust. 
    # Match <li> ... <span>Yapı Malzemeleri & Nalburiye</span> ... </li>
    
    # Note: Regex for nested structures is hard. 
    # But we know the unique string.
    
    start_str_yapi = '<span>Yapı Malzemeleri & Nalburiye</span>'
    idx_yapi = content.find(start_str_yapi)
    if idx_yapi != -1:
        # Find start LI
        li_start = content.rfind('<li', 0, idx_yapi)
        
        # Find end LI. Since this block has a huge mega-menu inside, we need to be careful.
        # Structure: <li> <a>...</a> <div mega-menu> ... </div> </li>
        # Just searching for next </li> might find an inner one.
        # But wait, looking at the previous file view, this category spans from ~Line 324 to 432.
        # It is followed by <li>... Yapı ve İnşaat Malzemeleri (Line 434)
        
        # So we can search for the START of "Yapı ve İnşaat Malzemeleri" LI.
        next_li_unique = '<span>Yapı ve İnşaat Malzemeleri</span>'
        next_li_pos = content.find(next_li_unique)
        
        if next_li_pos != -1:
            # Go back to its start
            block_end = content.rfind('<li', 0, next_li_pos)
            # Remove from li_start to block_end
            if li_start != -1 and block_end != -1:
                content = content[:li_start] + content[block_end:]
                print("Removed Yapı Malzemeleri & Nalburiye LI")
            else:
                print("Could not bound Yapı Malzemeleri LI")
        else:
             print("Could not find next sibling (Yapı ve İnşaat).")
    else:
        print("Comparison Yapı Malzemeleri not found.")

    # 2. Remove old "İş Güvenliği" LI block if exists
    start_str_is = '<span>İş Güvenliği ve İş Giysileri</span>'
    idx_is = content.find(start_str_is)
    if idx_is != -1:
        li_start_is = content.rfind('<li', 0, idx_is)
        # It is followed by "Oto Bakım" usually? 
        # Line 255. Followed by Oto Bakım at Line 288.
        
        next_li_unique_oto = '<span>Oto Bakım ve Tamir Malzemeleri</span>'
        next_li_pos_oto = content.find(next_li_unique_oto)
        
        if next_li_pos_oto != -1:
             block_end_is = content.rfind('<li', 0, next_li_pos_oto)
             content = content[:li_start_is] + content[block_end_is:]
             print("Removed old İş Güvenliği LI")
        else:
            print("Could not find Oto Bakım sibling.")

    # 3. Insert NEW "İş Güvenliği" LI. 
    # Where? Replaced "Yapı Malzemeleri" slot? 
    # "Yapı Malzemeleri" was removed. So we can insert it where we removed it?
    # Or just insert at the END like the others?
    # The user said "Yapı Malzemeleri ... şununla değiştir". 
    # "Yapı Malzemeleri" was roughly in the middle.
    # But for consistency, having all my new granular categories at the end is nice.
    # HOWEVER, checking my previous logic, "Yapı Malzemeleri" removal was a big chunk.
    # Let's insert the new category at the END (after Hırdavat) to keep the "new granular categories" group together.
    # It feels cleaner than injecting into the middle.

    new_li = """                                <li>
                                    <a href="kategoriler/is-guvenligi-ve-calisma-ekipmanlari.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-helmet-safety"></i>
                                            <span>İş Güvenliği ve Çalışma Ekipmanları</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Koruyucu Giyim</h4>
                                            <ul>
                                                <li><a href="#">İş Elbiseleri, Eldiven</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Ayak & Baş Koruma</h4>
                                            <ul>
                                                <li><a href="#">Baret, Çelik Burunlu Ayakkabı</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Göz & Kulak Koruma</h4>
                                            <ul>
                                                <li><a href="#">Göz ve Kulak Koruyucuları</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Çalışma Ekipmanları</h4>
                                            <ul>
                                                <li><a href="#">İş İskelesi ve Merdivenler</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
"""
    # Insert at end of mega menu list (before </ul>)
    end_pattern = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li>\s*<a href="#flowing-menu-root")', re.DOTALL)
    end_match = end_pattern.search(content)
    
    if end_match:
        content = content.replace(end_match.group(0), new_li + '\n' + end_match.group(0))
        print("Inserted new İş Güvenliği LI at end")
    else:
        # Try loose
        end_pattern_loose = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li><a href="#flowing-menu-root")', re.DOTALL)
        end_match_loose = end_pattern_loose.search(content)
        if end_match_loose:
             content = content.replace(end_match_loose.group(0), new_li + '\n' + end_match_loose.group(0))
             print("Inserted new İş Güvenliği LI at end (loose)")
        else:
             print("Could not insert new LI.")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

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
    create_safety_page()
    update_categories_data()
    update_index_menu()
    sync_mega_menu()
