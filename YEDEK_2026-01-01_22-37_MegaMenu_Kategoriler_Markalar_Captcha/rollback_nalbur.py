import os
import glob
import re

def clean_nalbur_files():
    # 1. Delete html file
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler\nalburiye-baglanti-elemanlari.html'
    if os.path.exists(path):
        os.remove(path)
        print("Deleted nalburiye-baglanti-elemanlari.html")

    # 2. Update categories-data.js to remove key
    data_path = r'c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js'
    with open(data_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove block 'nalburiye-baglanti-elemanlari': { ... },
    # Regex for it.
    
    pattern = re.compile(r"(\s*'nalburiye-baglanti-elemanlari': \{.*?\n    \},)", re.DOTALL)
    if pattern.search(content):
        content = pattern.sub('', content)
        with open(data_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Removed from categories-data.js")
    else:
        print("Key not found in categories-data.js")

def repair_index_html():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Identify Start point: Otomobil LI start
    # <i class="fa-solid fa-car"></i>\s*<span>Otomobil & Motosiklet</span>
    # The LI wrapping it.
    
    start_key = '<div class="menu-item-left">\s*<i class="fa-solid fa-car"></i>\s*<span>Otomobil & Motosiklet</span>'
    start_match = re.search(start_key, content)
    
    if not start_match:
        print("Could not find Otomobil start")
        return False
        
    # Find LI start before this
    start_pos = start_match.start()
    li_start = content.rfind('<li', 0, start_pos)
    
    # Identify End point: End of Mega Menu List
    # Find the </ul> that closes .mega-menu-list
    # It is followed by </div> (mega-menu container) -> </li> (Tüm Kategoriler) -> <li> (Tüm Markalar)
    
    # We can look for "Tüm Markalar" and backtrack.
    markalar_key = 'Tüm Markalar'
    markalar_pos = content.find(markalar_key)
    if markalar_pos == -1:
        print("Could not find Tüm Markalar")
        return False
        
    # Backtrack to find </ul>
    # The structure is: </ul> </div> </li> <li><a ... Tüm Markalar
    # Or </ul> </div> </li> <li ... ><a ... Tüm Markalar
    
    ul_end = content.rfind('</ul>', 0, markalar_pos)
    
    # We want to replace everything from li_start to ul_end (exclusive, we want to keep </ul>)
    # The replacement will be: Otomobil Block + Yapıştırıcı Block + Yalıtım Block
    
    otomobil_block = """                                <li>
                                    <a href="#">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-car"></i>
                                            <span>Otomobil & Motosiklet</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Otomobil & Motosiklet</h4>
                                            <ul>
                                                <li><a href="#">Oto Aksesuar</a></li>
                                                <li><a href="#">Oto Paspası</a></li>
                                                <li><a href="#">Oto Lastik</a></li>
                                                <li><a href="#">Kask</a></li>
                                                <li><a href="#">Kol Dayama & Kolçak</a></li>
                                                <li><a href="#">Güneşlik & Perde</a></li>
                                                <li><a href="#">Araç Kokusu</a></li>
                                                <li><a href="#">Motosiklet Eldiveni</a></li>
                                                <li><a href="#">Motosiklet Montu</a></li>
                                                <li><a href="#">Motosiklet Botu</a></li>
                                                <li><a href="#">Motosiklet Sepeti</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>"""
                                
    yapi_block = """                                <li>
                                    <a href="kategoriler/yapi-kimyasallari.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-flask"></i>
                                            <span>Yapıştırıcı, Dolgu ve Kimyasallar</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Yapıştırıcılar</h4>
                                            <ul>
                                                <li><a href="#">Silikon, Mastik ve Akrilikler</a></li>
                                                <li><a href="#">Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)</a></li>
                                                <li><a href="#">Poliüretan Köpükler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Dolgu ve Harçlar</h4>
                                            <ul>
                                                <li><a href="#">Çimento Esaslı Harçlar</a></li>
                                                <li><a href="#">Alçı ve Alçı Ürünleri</a></li>
                                                <li><a href="#">Derz Dolgular</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kimyasallar</h4>
                                            <ul>
                                                <li><a href="#">Tiner ve Çözücüler</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>"""
                                
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
    
    new_chunk = otomobil_block + '\n' + yapi_block + '\n' + yalitim_block + '\n'
    
    content = content[:li_start] + new_chunk + content[ul_end:]
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Repaired index.html")
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
    clean_nalbur_files()
    if repair_index_html():
        sync_mega_menu()
