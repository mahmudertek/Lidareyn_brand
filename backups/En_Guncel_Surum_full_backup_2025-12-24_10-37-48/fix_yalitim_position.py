import os
import glob
import re

def fix_misplaced_yalitim():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Identify the misplaced block
    # It starts with <li>...<a href="kategoriler/yalitim-ve-kaplama.html">
    # It is currently stuck inside the sub-menu of "Yapıştırıcı"
    
    # We can use a unique string matching the start 
    start_str = '<a href="kategoriler/yalitim-ve-kaplama.html">'
    
    # It seems to be wrapped in <li>...</li>
    # Let's verify the extent of the block from the previous view
    # It spans lines 565 to 600 (approx)
    # It ends with </li>
    # Followed by empty line and then <li><a href="#">Yapıştırıcı Çeşitleri...</a></li> (Line 602)
    
    # So I can extract it by regex finding the specific block content.
    
    # Pattern: 
    # <li>
    #   <a href="kategoriler/yalitim-ve-kaplama.html">
    #   ...
    # </li>
    
    # Because of nesting, regex is tricky.
    # But I know the exact text from my previous insertion script.
    
    inserted_block_text = """                                <li>
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

    # We can try to just string replace this block with empty string, 
    # BUT we need to handle whitespace/indentation that might have been messy.
    # The file view shows it is indented.
    
    # Let's try to find the start and end indices using the unique anchor and the structure seen in view_file.
    
    match_start = content.find('<a href="kategoriler/yalitim-ve-kaplama.html">')
    if match_start == -1:
        print("Block not found!")
        return False
        
    # Find the <li> immediately preceding
    li_start = content.rfind('<li', 0, match_start)
    
    # The block ends before "<li><a href="#">Yapıştırıcı Çeşitleri"
    # Search for that string after match_start
    
    next_item_marker = '<li><a href="#">Yapıştırıcı Çeşitleri'
    block_end = content.find(next_item_marker, match_start)
    
    if block_end == -1:
        print("Could not find end marker (Yapıştırıcı Çeşitleri)")
        # Maybe it's not exactly that? 
        # Line 602: <li><a href="#">Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)</a></li>
        return False
        
    # Extract the chunk
    chunk_to_remove = content[li_start:block_end]
    
    # Verify it looks like the block (contains Yalıtım)
    if 'Yalıtım ve Kaplama' not in chunk_to_remove:
        print("Chunk extraction logic failed safety check.")
        return False
        
    # Remove it
    print("Removing displaced block...")
    content = content[:li_start] + content[block_end:]
    
    # Now Insert it at the absolute end of mega menu list
    # The mega menu list ends with </ul>
    # Followed by </div>
    # Followed by </li>
    # Followed by <li><a href="#flowing-menu-root" (or similar)
    
    # We can look for the Yapıştırıcı block closing.
    # "Yapıştırıcı, Dolgu ve Kimyasallar" is the last legitimate category.
    # It has 3 sub-columns: Yapıştırıcılar, Dolgu ve Harçlar, Kimyasallar.
    # We can look for the end of "Kimyasallar" sub-column.
    # <h4>Kimyasallar</h4> ... </ul> ... </div> ... </div> ... </li>
    
    # Let's find index of "Yapıştırıcı, Dolgu ve Kimyasallar"
    yapi_marker = '<span>Yapıştırıcı, Dolgu ve Kimyasallar</span>'
    yapi_pos = content.find(yapi_marker)
    
    # From there, find the closing nesting levels.
    # It's fragile.
    
    # Alternative: Find the END of the mega-menu list </ul>.
    # And insert BEFORE it.
    
    # Use the same logic as previous fix.
    end_pattern = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li><a href="#flowing-menu-root")', re.DOTALL)
    end_match = end_pattern.search(content)
    
    if end_match:
        print("Found clean insertion point at end of list.")
        insertion = inserted_block_text + '\n' + end_match.group(1)
        content = content.replace(end_match.group(0), insertion + end_match.group(2))
    else:
        # Try finding just </ul> inside <div class="mega-menu">... </div>
        print("Trying finding mega menu list end via structure.")
        # We know mega-menu-list class.
        # <ul class="mega-menu-list"> ... </ul>
        
        # This regex must match the whole list, which is huge.
        # Instead, find the last </ul> before <div class="logo"> ?
        # Or before "Tüm Markalar"
        
        marker = 'Tüm Markalar</a></li>'
        marker_pos = content.find(marker)
        if marker_pos != -1:
            # Backtrack to find </ul>
            # The structure is: </ul> </div> </li> <li><a ... Tüm Markalar
            ul_end = content.rfind('</ul>', 0, marker_pos)
            if ul_end != -1:
                 print("Found insertion point via backtracking.")
                 # Check if inside correct div?
                 # Assuming yes.
                 content = content[:ul_end] + '\n' + inserted_block_text + '\n' + content[ul_end:]
            else:
                print("Could not backtrace to <ul>")
                return False
        else:
            print("Could not find 'Tüm Markalar'")
            return False

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

def sync_mega_menu():
    path_index = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path_index, 'r', encoding='utf-8') as f:
        source_content = f.read()
    
    mega_menu_match = re.search(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', source_content, re.DOTALL)
    
    if not mega_menu_match:
        print("Could not extraction Mega Menu from index.html")
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
    if fix_misplaced_yalitim():
        sync_mega_menu()
