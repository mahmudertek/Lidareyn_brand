import os
import glob
import re

def create_kaynak_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    template_src = os.path.join(base_dir, 'nalburiye-baglanti-elemanlari.html')
    dst = os.path.join(base_dir, 'kaynak-malzemeleri.html')
    
    if not os.path.exists(template_src):
        # Fallback to older one if nalbur doesn't exist (though it should)
        template_src = os.path.join(base_dir, 'yapi-kimyasallari.html')
        
    with open(template_src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replacements
    content = content.replace('Nalburiye & Bağlantı Elemanları', 'Kaynak Malzemeleri')
    # If fallback used
    content = content.replace('Yapıştırıcı, Dolgu ve Kimyasallar', 'Kaynak Malzemeleri')
    
    # Description replacements
    # "Tüm sabitleme, montaj ve hırdavat ihtiyaçlarınız için geniş ürün yelpazesi." -> "Profesyonel kaynak işleri için makine, elektrot ve koruyucu ekipmanlar."
    # "Vida, cıvata, dübel, kilit ve zincir çeşitleri ile güvenli bağlantılar." -> "Gazaltı, Tig ve Elektrot kaynağı için tüm sarf malzemeleri."
    
    content = re.sub(r'<p>.*?</p>', '<p>Gazaltı, Tig ve Elektrot kaynağı için tüm sarf malzemeleri ve ekipmanlar.</p>', content, count=1)
    
    # Icon
    content = content.replace('fa-link', 'fa-fire-burner') # Using fire-burner as welding torch metaphor, or fa-fire
    
    # Grid
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-bolt"></i></div>
                    <h3>Elektrotlar</h3>
                    <ul class="subcategory-items">
                        <li>Rutil Elektrotlar</li>
                        <li>Bazik Elektrotlar</li>
                        <li>Paslanmaz Elektrotlar</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-industry"></i></div>
                    <h3>Kaynak Telleri</h3>
                    <ul class="subcategory-items">
                        <li>Gazaltı Kaynak Telleri</li>
                        <li>Tig Kaynak Telleri</li>
                        <li>Tozaltı Telleri</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-helmet-safety"></i></div>
                    <h3>Koruyucu Donanım</h3>
                    <ul class="subcategory-items">
                        <li>Kaynak Maskeleri</li>
                        <li>Kaynak Eldivenleri</li>
                        <li>Önlük ve Tozluklar</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-plug"></i></div>
                    <h3>Makine & Aksesuar</h3>
                    <ul class="subcategory-items">
                        <li>Kaynak Makineleri</li>
                        <li>Pens ve Torçlar</li>
                        <li>Topraklama Pensesi</li>
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

    new_block = """    'kaynak-malzemeleri': {
        title: 'Kaynak Malzemeleri',
        description: 'Profesyonel kaynak makineleri, elektrotlar ve koruyucu ekipmanlar.',
        icon: 'fa-fire-burner',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Sarf Malzemeleri', items: ['Elektrotlar (Rutil, Bazik)', 'Kaynak Telleri (Gazaltı, Tig)'], icon: 'fa-bolt' },
            { name: 'Koruyucu Ekipman', items: ['Kaynak Maskeleri ve Eldivenleri'], icon: 'fa-helmet-safety' },
            { name: 'Makine ve Aksesuar', items: ['Kaynak Makineleri ve Aksesuarları'], icon: 'fa-plug' }
        ]
    },
"""
    # Insert after nalburiye-baglanti-elemanlari
    pattern = re.compile(r"(    'nalburiye-baglanti-elemanlari': \{.*?\n    \}),\n", re.DOTALL)
    if pattern.search(content):
        # Duplicate check?
        if 'kaynak-malzemeleri' not in content:
            content = pattern.sub(r"\1,\n" + new_block, content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Updated categories-data.js")
    else:
        print("Could not find insertion point (nalburiye) in categories-data.js")

def update_index_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_li = """                                <li>
                                    <a href="kategoriler/kaynak-malzemeleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-fire-burner"></i>
                                            <span>Kaynak Malzemeleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Sarf Malzemeleri</h4>
                                            <ul>
                                                <li><a href="#">Elektrotlar (Rutil, Bazik)</a></li>
                                                <li><a href="#">Kaynak Telleri (Gazaltı, Tig)</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Koruyucu Ekipman</h4>
                                            <ul>
                                                <li><a href="#">Kaynak Maskeleri ve Eldivenleri</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Makine ve Aksesuar</h4>
                                            <ul>
                                                <li><a href="#">Kaynak Makineleri ve Aksesuarları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
"""
    # Insert AFTER nalburiye-baglanti-elemanlari li
    # Find the LI start for Nalburiye
    # Then find the closing </li> for it.
    
    # It starts with: <a href="kategoriler/nalburiye-baglanti-elemanlari.html">
    # Let's find that, then the next </li>.
    
    start_pos = content.find('<a href="kategoriler/nalburiye-baglanti-elemanlari.html">')
    if start_pos == -1:
        print("Could not find Nalburiye in index.html")
        return False
        
    # Find next </li> after start_pos.
    # But wait, Nalburiye has sub-menus with </li>. 
    # Use the cleaner approach: Nalburiye LI is followed by either another LI or </ul>.
    # In current state, it is the last one, so followed by </ul>.
    
    # We can assume Nalburiye block ends just before </ul> closing the mega-menu-list.
    # Or rely on indentation/structure.
    
    # Let's iterate find('</li>') until we pass the block? No.
    
    # Regex matching the Nalburiye Block:
    # (<li[^>]*>\s*<a href="kategoriler/nalburiye-baglanti-elemanlari\.html">.*?</li>)
    # This greedy *? might stop at first </li> which is wrong (nested li).
    
    # However, create_nalbur_page used simple regex and it worked because sub-menu <ul> structure.
    # The LI we want ends at the very end.
    
    # Let's try inserting BEFORE the </ul> of mega-menu-list. 
    # Since Nalburiye is the last item, inserting after it = inserting before </ul>.
    
    end_pattern = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li>\s*<a href="#flowing-menu-root")', re.DOTALL)
    end_match = end_pattern.search(content)
    
    if end_match:
        # Insert before </ul>
        content = content.replace(end_match.group(0), new_li + '\n' + end_match.group(0))
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.html menu")
        return True
    
    # Fallback: Regex for Nalburiye block whole thing is risky.
    print("Could not find safe insertion point via </ul> match. Trying loose match.")
    end_pattern_loose = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li><a href="#flowing-menu-root")', re.DOTALL)
    # Just checking whitespace variations
    # Or maybe the anchor is different.
    
    # Let's assume valid structure.
    
    return False

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
    create_kaynak_page()
    update_categories_data()
    if update_index_menu():
        sync_mega_menu()
