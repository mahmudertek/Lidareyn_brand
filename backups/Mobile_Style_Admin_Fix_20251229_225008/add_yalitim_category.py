import os
import glob
import re

def create_yalitim_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    src = os.path.join(base_dir, 'yapi-kimyasallari.html') # Use this as template as it is clean
    dst = os.path.join(base_dir, 'yalitim-ve-kaplama.html')
    
    if not os.path.exists(src):
        return
        
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Title
    content = content.replace('Yapıştırıcı, Dolgu ve Kimyasallar', 'Yalıtım ve Kaplama')
    content = content.replace('İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.', 'Isı, su ve ses yalıtımı için profesyonel çözümler ve kaplama malzemeleri.')
    # Hero P
    content = content.replace('<p>İnşaat, tadilat ve tamirat işleriniz için gerekli silikonlar, yapıştırıcılar, köpükler ve inşaat kimyasalları.</p>', '<p>Yalıtım levhaları, membranlar, mantolama ürünleri ve dekoratif cephe kaplamaları.</p>')
    
    # Icon
    content = content.replace('fa-flask', 'fa-layer-group')
    
    # Grid
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-temperature-arrow-down"></i></div>
                    <h3>Isı Yalıtımı</h3>
                    <ul class="subcategory-items">
                        <li>EPS Levhalar (Strafor)</li>
                        <li>XPS Levhalar</li>
                        <li>Taş Yünü</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-droplet-slash"></i></div>
                    <h3>Su Yalıtımı</h3>
                    <ul class="subcategory-items">
                        <li>Membranlar</li>
                        <li>Sürme İzolasyon</li>
                        <li>Su Yalıtım Bantları</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-volume-xmark"></i></div>
                    <h3>Ses Yalıtımı</h3>
                    <ul class="subcategory-items">
                        <li>Akustik Süngerler</li>
                        <li>Ses Yalıtım Bariyerleri</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-house-chimney"></i></div>
                    <h3>Çatı Malzemeleri</h3>
                    <ul class="subcategory-items">
                        <li>Shingle</li>
                        <li>Kiremit</li>
                        <li>OSB Levha</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-building"></i></div>
                    <h3>Cephe Kaplama</h3>
                    <ul class="subcategory-items">
                        <li>Siding</li>
                        <li>Fuga</li>
                        <li>Dekoratif Paneller</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>
'''
    # Replace grid content
    content = re.sub(r'(<div class="subcategories-grid">).*?(</div>\s*</div>)', r'\1' + new_grid + r'\2', content, flags=re.DOTALL)
    
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {dst}")

def update_categories_data():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_block = """    'yalitim-ve-kaplama': {
        title: 'Yalıtım ve Kaplama',
        description: 'Isı, su ve ses yalıtımı için profesyonel çözümler.',
        icon: 'fa-layer-group',
        image: 'gorseller/mega_menu_yapi_market.png',
        subcategories: [
            { name: 'Isı ve Ses Yalıtımı', items: ['Isı Yalıtım Levhaları (EPS, XPS, Taş Yünü)', 'Ses Yalıtım Ürünleri'], icon: 'fa-temperature-arrow-down' },
            { name: 'Su Yalıtımı', items: ['Su Yalıtım Malzemeleri (Membran, Sürme İzolasyon)'], icon: 'fa-droplet-slash' },
            { name: 'Çatı ve Cephe', items: ['Çatı Malzemeleri (Shingle, Kiremit, O.S.B.)', 'İç/Dış Cephe Kaplamaları (Siding, Fuga, Dekoratif Paneller)'], icon: 'fa-house-chimney' }
        ]
    },
"""
    # Insert after yapi-kimyasallari block
    # Check if yapi-kimyasallari exists
    # Find closing of yapi-kimyasallari block
    # It looks like: 'yapi-kimyasallari': { ... },
    
    pattern = re.compile(r"(    'yapi-kimyasallari': \{.*?\n    \}),\n", re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(r"\1,\n" + new_block, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated categories-data.js")
    else:
        print("Could not find insertion point (yapi-kimyasallari) in categories-data.js")

def update_index_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_li = """                                <li>
                                    <a href="kategoriler/yalitim-ve-kaplama.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-layer-group"></i>
                                            <span>Yalıtım ve Kaplama</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Isı Yalıtımı</h4>
                                            <ul>
                                                <li><a href="#">Isı Yalıtım Levhaları (EPS, XPS, Taş Yünü)</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Su Yalıtımı</h4>
                                            <ul>
                                                <li><a href="#">Su Yalıtım Malzemeleri (Membran, Sürme İzolasyon)</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Ses Yalıtımı</h4>
                                            <ul>
                                                <li><a href="#">Ses Yalıtım Ürünleri</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Çatı ve Cephe</h4>
                                            <ul>
                                                <li><a href="#">Çatı Malzemeleri (Shingle, Kiremit, O.S.B.)</a></li>
                                                <li><a href="#">İç/Dış Cephe Kaplamaları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
"""
    # Insert AFTER yapi-kimyasallari li
    # Find the LI containing yapi-kimyasallari
    
    # Regex: (<li[^>]*>\s*<a href="kategoriler/yapi-kimyasallari\.html">.*?</li>)
    pattern = re.compile(r'(<li[^>]*>\s*<a href="kategoriler/yapi-kimyasallari\.html">.*?</li>)', re.DOTALL)
    
    if pattern.search(content):
        content = pattern.sub(r'\1\n' + new_li, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated index.html menu")
    else:
        print("Could not find yapi-kimyasallari LI in index.html")
        return False
    return True

def sync_mega_menu():
    path_index = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path_index, 'r', encoding='utf-8') as f:
        source_content = f.read()
    
    # Extract mega menu block
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
    create_yalitim_page()
    update_categories_data()
    if update_index_menu():
        sync_mega_menu()
