import os
import glob
import re

def create_nalbur_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    src = os.path.join(base_dir, 'yalitim-ve-kaplama.html')
    dst = os.path.join(base_dir, 'nalburiye-baglanti-elemanlari.html')
    
    if not os.path.exists(src):
        return
        
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replacements
    content = content.replace('Yalıtım ve Kaplama', 'Nalburiye & Bağlantı Elemanları')
    content = content.replace('Isı, su ve ses yalıtımı için profesyonel çözümler ve kaplama malzemeleri.', 'Tüm sabitleme, montaj ve hırdavat ihtiyaçlarınız için geniş ürün yelpazesi.')
    content = content.replace('<p>Yalıtım levhaları, membranlar, mantolama ürünleri ve dekoratif cephe kaplamaları.</p>', '<p>Vida, cıvata, dübel, kilit ve zincir çeşitleri ile güvenli bağlantılar.</p>')
    
    # Icon
    content = content.replace('fa-layer-group', 'fa-link')
    
    # Grid
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-screw"></i></div>
                    <h3>Vidalama & Sabitleme</h3>
                    <ul class="subcategory-items">
                        <li>Cıvata, Vida ve Somunlar</li>
                        <li>Dübel ve Ankrajlar</li>
                        <li>Rondelalar</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-hammer"></i></div>
                    <h3>Nalburiye Sarf</h3>
                    <ul class="subcategory-items">
                        <li>Çivi ve Teller</li>
                        <li>Perçinler</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-lock"></i></div>
                    <h3>Güvenlik & Yük</h3>
                    <ul class="subcategory-items">
                        <li>Zincir ve Halatlar</li>
                        <li>Kilitler ve Asma Kilitler</li>
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

    new_block = """    'nalburiye-baglanti-elemanlari': {
        title: 'Nalburiye & Bağlantı Elemanları',
        description: 'Vida, cıvata, dübel ve kilit sistemleri.',
        icon: 'fa-link',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Vidalama & Sabitleme', items: ['Cıvata, Vida ve Somunlar', 'Dübel ve Ankrajlar (Kimyasal ve Mekanik)', 'Rondelalar'], icon: 'fa-screw' },
            { name: 'Nalburiye Sarf', items: ['Çivi ve Teller', 'Perçinler'], icon: 'fa-hammer' },
            { name: 'Güvenlik & Yük', items: ['Zincir ve Halatlar', 'Kilitler ve Asma Kilitler'], icon: 'fa-lock' }
        ]
    },
"""
    # Insert after yalitim-ve-kaplama
    pattern = re.compile(r"(    'yalitim-ve-kaplama': \{.*?\n    \}),\n", re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(r"\1,\n" + new_block, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated categories-data.js")
    else:
        print("Could not find insertion point (yalitim-ve-kaplama) in categories-data.js")

def update_index_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_li = """                                <li>
                                    <a href="kategoriler/nalburiye-baglanti-elemanlari.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-link"></i>
                                            <span>Nalburiye & Bağlantı Elemanları</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Vidalama & Sabitleme</h4>
                                            <ul>
                                                <li><a href="#">Cıvata, Vida ve Somunlar</a></li>
                                                <li><a href="#">Dübel ve Ankrajlar</a></li>
                                                <li><a href="#">Rondelalar</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Nalburiye Sarf</h4>
                                            <ul>
                                                <li><a href="#">Çivi ve Teller</a></li>
                                                <li><a href="#">Perçinler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Güvenlik & Yük</h4>
                                            <ul>
                                                <li><a href="#">Zincir ve Halatlar</a></li>
                                                <li><a href="#">Kilitler ve Asma Kilitler</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
"""
    # Insert AFTER yalitim-ve-kaplama li
    pattern = re.compile(r'(<li[^>]*>\s*<a href="kategoriler/yalitim-ve-kaplama\.html">.*?</li>)', re.DOTALL)
    
    if pattern.search(content):
        content = pattern.sub(r'\1\n' + new_li, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.html menu")
    else:
        print("Could not find yalitim-ve-kaplama LI in index.html")
        return False
    return True

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
    create_nalbur_page()
    update_categories_data()
    if update_index_menu():
        sync_mega_menu()
