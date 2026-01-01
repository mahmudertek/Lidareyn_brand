import os
import glob
import re

def fix_index_html():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Extract the wrongly placed block
    # It starts with <li>...<span>Yapıştırıcı, Dolgu ve Kimyasallar</span>
    # We can match specific start string
    
    start_marker = '<a href="kategoriler/yapi-kimyasallari.html">'
    # It is wrapped in <li>
    # Look for <li> that immediately precedes this anchor.
    
    # Let's find the start index of the <li> containing this anchor
    # We can search for the anchor, then backtrack to finding line start <li>
    
    ul_pos = content.find(start_marker)
    if ul_pos == -1:
        print("Could not find new category in index.html, maybe already fixed?")
        return False
        
    # Find the preceding <li>
    # search backwards from ul_pos
    li_start = content.rfind('<li', 0, ul_pos)
    
    # Now find the matching closing </li>
    # Since we have nested <li> inside (in the sub menu), we need to be careful.
    # But wait, looking at the previous specific structure:
    # The LI we want to move contains "Yapıştırıcı, Dolgu ve Kimyasallar".
    # Inside it, there are LIs for sub-items.
    # We can use a counter-based approach or regex if we trust the structure.
    
    # Regex for balanced li is hard. 
    # But we know the end of this block from the previous view:
    # It ends with </li>
    # followed by empty lines and then <li><a href="#">Oto Paspası</a></li>
    
    # Let's simple string split/partition? No, dangerous.
    
    # Let's use the exact text block we inserted in the previous turn if possible.
    # But indentation might have changed?
    # I inserted:
    #                                 <li>
    #                                     <a href="kategoriler/yapi-kimyasallari.html">
    # ...
    #                                 </li>
    
    # Let's use specific start and end markers derived from the file view.
    # Start: <li>\s*<a href="kategoriler/yapi-kimyasallari.html">
    # End: </li>\s*<li><a href="#">Oto Paspası</a></li>
    # Wait, the end is just the closing </li>. The NEXT line is Oto Paspası.
    
    # Let's capture the block using the start and the fact that it ends before Oto Paspası
    
    pattern_extract = re.compile(r'(<li>\s*<a href="kategoriler/yapi-kimyasallari\.html">.*?</li>)(\s*<li><a href="#">Oto Paspası</a>)', re.DOTALL)
    
    match = pattern_extract.search(content)
    if match:
        block = match.group(1)
        following_sibling = match.group(2)
        
        print("Found misplaced block.")
        
        # Remove the block from that location (replace with just the following sibling)
        # Note: we need to keep the following sibling!
        content = content.replace(match.group(0), following_sibling.strip()) # strip to remove extra newline if any
        
        # Now insert the block in the correct place.
        # Correct place: Inside .mega-menu-list, at the end.
        # Find </ul> of mega-menu-list.
        # It is followed by </div> (mega-menu) and </li> (nav-item-dropdown)
        
        end_pattern = re.compile(r'(</ul>)(\s*</div>\s*</li>\s*<li><a href="#flowing-menu-root")', re.DOTALL)
        # Note: based on view file, after mega menu list UL closes, we have:
        # 587:                         </div>
        # 588:                     </li>
        # 589:                     <li><a href="#flowing-menu-root" ...
        
        # The #flowing-menu-root might have changed or index.html might have index.html#...
        # In current index.html view:
        # 589:                     <li><a href="#flowing-menu-root" class="nav-link">Tüm Markalar</a></li>
        
        end_match = end_pattern.search(content)
        if end_match:
            print("Found insertion point.")
            # Insert before the </ul>
            # group(1) is </ul>
            # group(2) is trailing context
            # We want to insert block BEFORE </ul>
            
            insertion = block + '\n' + end_match.group(1)
            content = content.replace(end_match.group(0), insertion + end_match.group(2))
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Fixed index.html")
            return True
        else:
            print("Could not find insertion point (mega menu end).")
            # Try looser pattern
            end_pattern_loose = re.compile(r'(</ul>)(\s*</div>\s*</li>)', re.DOTALL)
            end_match_loose = end_pattern_loose.search(content)
            if end_match_loose:
                 # Check if this is indeed the mega-menu list by checking context?
                 # There is only one mega menu list in index.html usually.
                 print("Found loose insertion point.")
                 insertion = block + '\n' + end_match_loose.group(1)
                 content = content.replace(end_match_loose.group(0), insertion + end_match_loose.group(2))
                 with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                 print("Fixed index.html (loose match)")
                 return True
            else:
                 print("Failed to find end of mega menu list.")
    else:
        print("Could not match misplaced block pattern.")
        
    return False

def sync_mega_menu():
    path_index = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path_index, 'r', encoding='utf-8') as f:
        source_content = f.read()
    
    # Extract the corrected mega menu block
    # Look for <div class="mega-menu">...</div>
    # Actually checking the surrounding LI is safer as per previous logic
    mega_menu_match = re.search(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', source_content, re.DOTALL)
    
    if not mega_menu_match:
        print("Could not extraction Mega Menu from index.html")
        return
        
    mega_menu_block = mega_menu_match.group(1)
    
    # List all HTML files
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
    files = glob.glob(os.path.join(base_dir, '*.html')) + glob.glob(os.path.join(base_dir, 'kategoriler', '*.html'))
    
    count = 0
    for file_path in files:
        if os.path.abspath(file_path) == os.path.abspath(path_index):
            continue
        if 'backups' in file_path or 'admin' in file_path:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Target existing mega menu block to replace
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
    if fix_index_html():
        sync_mega_menu()
