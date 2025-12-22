import os
import glob
import re

def create_tesisat_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    template_src = os.path.join(base_dir, 'kapi-pencere-cerceve.html')
    if not os.path.exists(template_src):
        # Fallback
        template_src = os.path.join(base_dir, 'boyalar-boya-malzemeleri.html')
        
    dst = os.path.join(base_dir, 'tesisat-malzemeleri.html')
    
    with open(template_src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replacements
    content = content.replace('Kapı, Pencere & Çerçeve Sistemleri', 'Tesisat Malzemeleri')
    content = re.sub(r'<p>.*?</p>', '<p>Su, ısıtma ve havalandırma tesisatları için profesyonel malzeme ve ekipmanlar.</p>', content, count=1)
    
    # Icon
    content = content.replace('fa-door-open', 'fa-faucet-drip')
    content = content.replace('fa-paint-roller', 'fa-faucet-drip') # fallback
    
    # Grid
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-water"></i></div>
                    <h3>Su Tesisatı</h3>
                    <ul class="subcategory-items">
                        <li>Su Tesisatı Boru ve Ek Parçaları (PVC, PEX)</li>
                        <li>Temiz ve Atık Su Sistemleri</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-sink"></i></div>
                    <h3>Armatür & Vitrifiye</h3>
                    <ul class="subcategory-items">
                        <li>Musluk ve Bataryalar</li>
                        <li>Sifon ve Rezervuar Sistemleri</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-temperature-arrow-up"></i></div>
                    <h3>Isıtma & Havalandırma</h3>
                    <ul class="subcategory-items">
                        <li>Isıtma Tesisatı Malzemeleri (Radyatör, Kombi)</li>
                        <li>Hava ve Havalandırma Kanalları</li>
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

    new_block = """    'tesisat-malzemeleri': {
        title: 'Tesisat Malzemeleri',
        description: 'Su, ısıtma ve havalandırma çözümleri.',
        icon: 'fa-faucet-drip',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Su Tesisatı', items: ['Su Tesisatı Boru ve Ek Parçaları (PVC, PEX)'], icon: 'fa-water' },
            { name: 'Armatür & Vitrifiye', items: ['Musluk ve Bataryalar', 'Sifon ve Rezervuar Sistemleri'], icon: 'fa-sink' },
            { name: 'Isıtma & Havalandırma', items: ['Isıtma Tesisatı Malzemeleri (Radyatör, Kombi Bağlantı)', 'Hava ve Havalandırma Kanalları'], icon: 'fa-temperature-arrow-up' }
        ]
    },
"""
    # Insert after kapi-pencere-cerceve
    pattern = re.compile(r"(    'kapi-pencere-cerceve': \{.*?\n    \}),\n", re.DOTALL)
    if pattern.search(content):
        if 'tesisat-malzemeleri' not in content:
            content = pattern.sub(r"\1,\n" + new_block, content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Updated categories-data.js")
    else:
        print("Could not find insertion point (kapi-pencere) in categories-data.js")

def update_index_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_li = """                                <li>
                                    <a href="kategoriler/tesisat-malzemeleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-faucet-drip"></i>
                                            <span>Tesisat Malzemeleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Su Tesisatı</h4>
                                            <ul>
                                                <li><a href="#">Su Tesisatı Boru ve Ek Parçaları</a></li>
                                                <li><a href="#">PVC, PEX Sistemler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Armatür & Vitrifiye</h4>
                                            <ul>
                                                <li><a href="#">Musluk ve Bataryalar</a></li>
                                                <li><a href="#">Sifon ve Rezervuar Sistemleri</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Isıtma & Havalandırma</h4>
                                            <ul>
                                                <li><a href="#">Isıtma Tesisatı Malzemeleri</a></li>
                                                <li><a href="#">Hava ve Havalandırma Kanalları</a></li>
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
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.html menu")
        return True
    
    end_pattern_loose = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li><a href="#flowing-menu-root")', re.DOTALL)
    end_match_loose = end_pattern_loose.search(content)
    if end_match_loose:
        content = content.replace(end_match_loose.group(0), new_li + '\n' + end_match_loose.group(0))
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.html menu (loose match)")
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
    create_tesisat_page()
    update_categories_data()
    if update_index_menu():
        sync_mega_menu()
