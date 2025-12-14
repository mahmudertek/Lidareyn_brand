import os

def create_page():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
    src = os.path.join(base_dir, 'oto-bakim-tamir.html')
    dst = os.path.join(base_dir, 'yapi-kimyasallari.html')
    
    if not os.path.exists(src):
        return
        
    with open(src, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replacements
    # Title
    content = content.replace('Oto Bakım ve Tamir Malzemeleri', 'Yapıştırıcı, Dolgu ve Kimyasallar')
    content = content.replace('Oto bakım, tamir ve onarım ürünleri. Krikolar, takviye kabloları, lastik tamir kitleri ve daha fazlası.', 'İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.')
    
    # Hero Icon
    content = content.replace('fa-car-wrench', 'fa-flask')
    
    # Hero Description (P tag)
    # Use simpler replace if possible, or regex
    # The P tag in src is "Oto bakım, tamir ve onarım ürünleri. Krikolar, takviye kabloları, lastik tamir kitleri ve daha fazlası."
    content = content.replace('<p>Oto bakım, tamir ve onarım ürünleri. Krikolar, takviye kabloları, lastik tamir kitleri ve daha fazlası.</p>', '<p>İnşaat, tadilat ve tamirat işleriniz için gerekli silikonlar, yapıştırıcılar, köpükler ve inşaat kimyasalları.</p>')
    
    # Breadcrumb
    # <i class="fa-solid fa-chevron-right"></i>\n            <span>Oto Bakım ve Tamir Malzemeleri</span>
    # Handled by first global replace.
    
    # Grid Content
    new_grid = '''
                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-fill-drip"></i></div>
                    <h3>Yapıştırıcılar</h3>
                    <ul class="subcategory-items">
                        <li>Silikon ve Mastikler</li>
                        <li>Epoksi ve Japon Yapıştırıcılar</li>
                        <li>Poliüretan Köpükler</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-trowel"></i></div>
                    <h3>Dolgu ve Harçlar</h3>
                    <ul class="subcategory-items">
                        <li>Çimento Esaslı Harçlar</li>
                        <li>Alçı ve Alçı Ürünleri</li>
                        <li>Derz Dolgular</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>

                <div class="subcategory-card">
                    <div class="subcategory-icon"><i class="fa-solid fa-bottle-droplet"></i></div>
                    <h3>Kimyasallar</h3>
                    <ul class="subcategory-items">
                        <li>Tiner ve Çözücüler</li>
                        <li>Temizlik Kimyasalları</li>
                    </ul>
                    <a href="#" class="subcategory-link">Tümünü Gör <i class="fa-solid fa-arrow-right"></i></a>
                </div>
'''
    # Find grid to replace
    # src file has "subcategories-grid"> ... </div>
    # We can try to match the inner content
    
    import re
    grid_pattern = re.compile(r'(<div class="subcategories-grid">).*?(</div>\s*</div>)', re.DOTALL)
    if grid_pattern.search(content):
        # We need to act carefully. The regex ends at the closing div of grid AND the closing div of container.
        # But wait, src file has:
        # <div class="subcategories-grid">
        #    ...
        # </div>
        # </div>
        
        # We want to replace the INNER html of the grid.
        # Let's match: <div class="subcategories-grid"> (capture 1) ... (capture content) ... </div> (capture end)
        
        # Simpler: Split by <div class="subcategories-grid"> and </div>\n        </div>
        
        start_marker = '<div class="subcategories-grid">'
        end_marker = '        </div>\n            </div>' # Indentation check
        # Checking src indentation visually:
        # 588:             </div>
        # 589:         </div>
        
        # Just use regex to replace everything inside subcategories-grid
        content = re.sub(r'(<div class="subcategories-grid">).*?(</div>\s*</div>)', r'\1' + new_grid + r'\2', content, flags=re.DOTALL)
        
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Created {dst}")

if __name__ == '__main__':
    create_page()
