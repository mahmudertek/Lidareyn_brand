import os
import glob
import re

def create_nalbur_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    template_src = os.path.join(base_dir, 'yalitim-ve-kaplama.html') # Use Yalıtım as template
    dst = os.path.join(base_dir, 'nalburiye-baglanti-elemanlari.html')
    
    if not os.path.exists(template_src):
        print("Template file missing!")
        return
        
    with open(template_src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Valid Replacements
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
    # Regex: 'yalitim-ve-kaplama': { ... },
    pattern = re.compile(r"(    'yalitim-ve-kaplama': \{.*?\n    \}),\n", re.DOTALL)
    if pattern.search(content):
        # Check if already exists to avoid duplication
        if 'nalburiye-baglanti-elemanlari' not in content:
            content = pattern.sub(r"\1,\n" + new_block, content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Updated categories-data.js")
    else:
        print("Could not find insertion point (yalitim-ve-kaplama) in categories-data.js")

def update_index_menu_and_fix():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Clean up garbage structure around Yalıtım
    # Known garbage:
    # </ul>
    # </div>
    # </div>  <-- Extra
    # </li>
    # <li> <a ... Yalıtım ... (Duplicate)
    
    # Let's use a robust replacement for the Mega Menu End Area.
    # We look for the FIRST valid "Yalıtım" block.
    # It ends with </li>
    
    # Search for Yalıtım start
    yalitim_start = content.find('<a href="kategoriler/yalitim-ve-kaplama.html">')
    if yalitim_start == -1:
        print("Could not find Yalıtım category in index.html")
        return False
        
    # Find the LI start
    li_start = content.rfind('<li', 0, yalitim_start)
    
    # We want to find the END of this valid LI block.
    # It ends before "</ul>" usually involved in the garbage.
    # Let's use find('</ul>') after yalitim_start.
    
    ul_pos = content.find('</ul>', yalitim_start) # Finding the </ul> of mega-menu-list (or sub-menu)
    # The Yalıtım block has a sub-menu with 4 columns, so 4 inner </ul>s.
    # We need to skip them.
    # This is tricky with string find.
    
    # Let's rely on the unique text of the duplicate block or garbage.
    # Duplicate block starts with:
    # <li>
    #     <a href="kategoriler/yalitim-ve-kaplama.html">
    #     ...
    #     <span>Yalıtım ve Kaplama</span>
    
    # We can use regex to find ALL occurences of Yalıtım LI.
    # If more than 1, delete the second one.
    
    matches = list(re.finditer(r'(<li>\s*<a href="kategoriler/yalitim-ve-kaplama\.html">)', content))
    if len(matches) > 1:
        print(f"Found {len(matches)} Yalıtım blocks. Removing duplicates.")
        # Keep the first one.
        # Everything from end of first block to start of "Tüm Markalar" needs inspection.
        
        # But wait, identifying the "end of 1st block" is the hard part without parsing.
        pass # We will rely on replacing the whole tail.

    # Better approach:
    # Identify the point between the LAST valid category item (Yalıtım) and "Tüm Markalar".
    # Replace that entire region with:
    # </li> (closing Yalıtım)
    # <li> (New Nalburiye) ... </li>
    # </ul> (closing mega menu list)
    # </div> (closing mega menu div)
    # </li> (closing mega menu LI)
    # (start of Tüm Markalar) or (End of file part)
    
    # So we match:
    # From: <a href="kategoriler/yalitim-ve-kaplama.html">
    # To: Tüm Markalar</a></li>
    
    # We reconstruct this whole section.
    
    # Start anchor:
    start_anchor = '<a href="kategoriler/yalitim-ve-kaplama.html">'
    # End anchor:
    end_anchor = 'Tüm Markalar</a></li>'
    
    start_idx = content.find(start_anchor)
    end_idx = content.find(end_anchor)
    
    if start_idx == -1 or end_idx == -1:
        print("Anchors not found.")
        return False
        
    # Move start_idx back to LI start
    start_idx = content.rfind('<li', 0, start_idx)
    
    # We will replace content[start_idx : end_idx]
    # But wait, end_idx points to 'T' of Tüm Markalar.
    # The replacement must end right before that.
    # BUT "Tüm Markalar" is inside a <li>...</li>.
    # so end_anchor ensures we are at the text.
    # We should back up to the <li> of "Tüm Markalar".
    
    li_markalar = content.rfind('<li', 0, end_idx)
    
    # So we replace from start of Yalıtım LI to start of Markalar LI.
    
    # New Yalıtım Block (clean string) + New Nalburiye Block + Closing Tags
    
    yalitim_block = """                                <li>
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
                                </li>"""
                                
    nalbur_block = """                                <li>
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
                                </li>"""
    
    closing_tags = """
                            </ul>
                        </div>
                    </li>
                    """
    
    # Combine
    replacement = yalitim_block + '\n' + nalbur_block + '\n' + closing_tags
    
    # Apply REPLACEMENT
    content = content[:start_idx] + replacement + content[li_markalar:]
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Fixed and updated index.html")
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
    if update_index_menu_and_fix():
        sync_mega_menu()
