import os
import glob
import re

def create_kapi_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    template_src = os.path.join(base_dir, 'boyalar-boya-malzemeleri.html')
    if not os.path.exists(template_src):
        # Fallback
        template_src = os.path.join(base_dir, 'nalburiye-baglanti-elemanlari.html')
        
    dst = os.path.join(base_dir, 'kapi-pencere-cerceve.html')
    
    with open(template_src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replacements
    content = content.replace('Boyalar ve Boya Malzemeleri', 'Kapı, Pencere & Çerçeve Sistemleri')
    content = re.sub(r'<p>.*?</p>', '<p>PVC, alüminyum ve ahşap kapı pencere sistemleri, panjurlar ve tüm aksesuarlar.</p>', content, count=1)
    
    # Icon
    content = content.replace('fa-paint-roller', 'fa-door-open')
    content = content.replace('fa-link', 'fa-door-open') # fallback
    
    # Grid
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-door-open"></i></div>
                    <h3>Kapı ve Pencere</h3>
                    <ul class="subcategory-items">
                        <li>PVC Pencere ve Kapı Sistemleri</li>
                        <li>Alüminyum Doğrama Sistemleri</li>
                        <li>Ahşap Kapı ve Pencere</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-border-all"></i></div>
                    <h3>Tamamlayıcı Sistemler</h3>
                    <ul class="subcategory-items">
                        <li>Panjur ve Kepenk Sistemleri</li>
                        <li>Sineklik Sistemleri</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-key"></i></div>
                    <h3>Aksesuarlar</h3>
                    <ul class="subcategory-items">
                        <li>Kapı Kolları ve Menteşeler</li>
                        <li>Kilit Karşılıkları</li>
                        <li>İspanyoletler</li>
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

    new_block = """    'kapi-pencere-cerceve': {
        title: 'Kapı, Pencere & Çerçeve Sistemleri',
        description: 'PVC, alüminyum ve ahşap doğrama sistemleri ve aksesuarları.',
        icon: 'fa-door-open',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Kapı ve Pencere', items: ['PVC Pencere ve Kapı Sistemleri', 'Alüminyum Doğrama Sistemleri', 'Ahşap Kapı ve Pencere'], icon: 'fa-door-open' },
            { name: 'Tamamlayıcılar', items: ['Panjur ve Kepenk Sistemleri'], icon: 'fa-border-all' },
            { name: 'Aksesuarlar', items: ['Kapı Pencere Aksesuarları (Menteşe, Kol, Kilit Karşılığı)'], icon: 'fa-key' }
        ]
    },
"""
    # Insert after boyalar-boya-malzemeleri
    pattern = re.compile(r"(    'boyalar-boya-malzemeleri': \{.*?\n    \}),\n", re.DOTALL)
    if pattern.search(content):
        if 'kapi-pencere-cerceve' not in content:
            content = pattern.sub(r"\1,\n" + new_block, content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Updated categories-data.js")
    else:
        print("Could not find insertion point (boyalar) in categories-data.js")

def update_index_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_li = """                                <li>
                                    <a href="kategoriler/kapi-pencere-cerceve.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-door-open"></i>
                                            <span>Kapı, Pencere & Çerçeve Sistemleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Kapı ve Pencere</h4>
                                            <ul>
                                                <li><a href="#">PVC Pencere ve Kapı Sistemleri</a></li>
                                                <li><a href="#">Alüminyum Doğrama Sistemleri</a></li>
                                                <li><a href="#">Ahşap Kapı ve Pencere</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Tamamlayıcılar</h4>
                                            <ul>
                                                <li><a href="#">Panjur ve Kepenk Sistemleri</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Aksesuarlar</h4>
                                            <ul>
                                                <li><a href="#">Kapı Pencere Aksesuarları</a></li>
                                                <li><a href="#">Menteşe, Kol, Kilit Karşılığı</a></li>
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
    
    # Try alternate end pattern if spacing is weird
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
    create_kapi_page()
    update_categories_data()
    if update_index_menu():
        sync_mega_menu()
