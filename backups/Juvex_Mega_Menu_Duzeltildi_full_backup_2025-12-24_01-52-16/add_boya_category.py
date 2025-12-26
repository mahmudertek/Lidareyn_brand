import os
import glob
import re

def create_boya_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    # Use kaynak as template if exists
    template_src = os.path.join(base_dir, 'kaynak-malzemeleri.html')
    if not os.path.exists(template_src):
        template_src = os.path.join(base_dir, 'nalburiye-baglanti-elemanlari.html')
        
    dst = os.path.join(base_dir, 'boyalar-boya-malzemeleri.html')
    
    with open(template_src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replacements
    content = content.replace('Kaynak Malzemeleri', 'Boyalar ve Boya Malzemeleri')
    # Use regex for description to be safe replacing previous specific text
    content = re.sub(r'<p>.*?</p>', '<p>İç ve dış cephe boyaları, vernikler, astarlar ve profesyonel uygulama ekipmanları.</p>', content, count=1)
    
    # Icon
    content = content.replace('fa-fire-burner', 'fa-paint-roller')
    content = content.replace('fa-link', 'fa-paint-roller') # In case template was nalbur
    
    # Grid
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-fill-drip"></i></div>
                    <h3>Boya Çeşitleri</h3>
                    <ul class="subcategory-items">
                        <li>İç Cephe Boyaları</li>
                        <li>Dış Cephe Boyaları</li>
                        <li>Astar Boyalar</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-brush"></i></div>
                    <h3>Ahşap & Metal Bakım</h3>
                    <ul class="subcategory-items">
                        <li>Vernikler ve Cilalar</li>
                        <li>Ahşap Koruyucular</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-paint-roller"></i></div>
                    <h3>Uygulama Ekipmanları</h3>
                    <ul class="subcategory-items">
                        <li>Fırça ve Rulolar</li>
                        <li>Spatula ve Mala Çeşitleri</li>
                        <li>Boya Tavaları</li>
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

    new_block = """    'boyalar-boya-malzemeleri': {
        title: 'Boyalar ve Boya Malzemeleri',
        description: 'İç ve dış cephe boyaları, vernikler ve boya malzemeleri.',
        icon: 'fa-paint-roller',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Boya Çeşitleri', items: ['İç Cephe Boyaları (Plastik, Silikonlu)', 'Dış Cephe Boyaları (Akrilik, Silikonlu)', 'Astar Boyalar'], icon: 'fa-fill-drip' },
            { name: 'Ahşap & Metal', items: ['Vernikler ve Cilalar'], icon: 'fa-brush' },
            { name: 'Uygulama Ekipmanları', items: ['Fırça ve Rulolar', 'Spatula ve Mala Çeşitleri'], icon: 'fa-paint-roller' }
        ]
    },
"""
    # Insert after kaynak-malzemeleri
    pattern = re.compile(r"(    'kaynak-malzemeleri': \{.*?\n    \}),\n", re.DOTALL)
    if pattern.search(content):
        if 'boyalar-boya-malzemeleri' not in content:
            content = pattern.sub(r"\1,\n" + new_block, content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Updated categories-data.js")
    else:
        print("Could not find insertion point (kaynak-malzemeleri) in categories-data.js")

def update_index_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_li = """                                <li>
                                    <a href="kategoriler/boyalar-boya-malzemeleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-paint-roller"></i>
                                            <span>Boyalar ve Boya Malzemeleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Boya Çeşitleri</h4>
                                            <ul>
                                                <li><a href="#">İç Cephe Boyaları</a></li>
                                                <li><a href="#">Dış Cephe Boyaları</a></li>
                                                <li><a href="#">Astar Boyalar</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Ahşap & Metal</h4>
                                            <ul>
                                                <li><a href="#">Vernikler ve Cilalar</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Uygulama Ekipmanları</h4>
                                            <ul>
                                                <li><a href="#">Fırça ve Rulolar</a></li>
                                                <li><a href="#">Spatula ve Mala Çeşitleri</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
"""
    # Insert after kaynak-malzemeleri
    # It is currently the last one.
    # Pattern to find end of list: </ul> closing the mega-menu-list.
    
    end_pattern = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li>\s*<a href="#flowing-menu-root")', re.DOTALL)
    end_match = end_pattern.search(content)
    
    if end_match:
        content = content.replace(end_match.group(0), new_li + '\n' + end_match.group(0))
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.html menu")
        return True
    
    print("Could not find insertion point in index.html")
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
    create_boya_page()
    update_categories_data()
    if update_index_menu():
        sync_mega_menu()
