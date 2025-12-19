import os
import re

# Paths
BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
INDEX_FILE = os.path.join(BASE_DIR, "index.html")

def get_master_menu_html():
    """Reads the correct mega menu HTML from index.html (the full list)"""
    print(f"Reading master menu from {INDEX_FILE}...")
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    start_tag = '<ul class="mega-menu-list">'
    
    start_idx = content.find(start_tag)
    if start_idx == -1:
        raise Exception("Could not find mega-menu-list in index.html")
    
    current_idx = start_idx + len(start_tag)
    balance = 1
    closure_idx = -1
    
    while current_idx < len(content):
        next_open = content.find('<ul', current_idx)
        next_close = content.find('</ul>', current_idx)
        
        if next_close == -1:
            break
            
        if next_open != -1 and next_open < next_close:
            balance += 1
            current_idx = next_open + 3
        else:
            balance -= 1
            current_idx = next_close + 5
            if balance == 0:
                closure_idx = next_close + 5
                break
                
    if closure_idx == -1:
        raise Exception("Could not find closing </ul> for mega-menu-list in index.html")
        
    return content[start_idx:closure_idx]

def get_full_mega_menu_block(list_html):
    """Wraps the list HTML in the .mega-menu container"""
    return f'\n                        <div class="mega-menu">\n{list_html}\n                        </div>'

def update_file(file_path, master_list_html):
    """Updates or Injects the mega menu in the given file"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # CASE 1: File already has the mega menu list -> Update it
        start_tag = '<ul class="mega-menu-list">'
        if start_tag in content:
            start_idx = content.find(start_tag)
            # Find the end of validity context (next div close)
            # This is a heuristic that works for the project structure which is consistently formatted now
            next_div_close = content.find('</div>', start_idx) 
            
            if next_div_close != -1:
                new_content = content[:start_idx] + master_list_html + "\n                        " + content[next_div_close:]
                if content != new_content:
                     with open(file_path, "w", encoding="utf-8") as f:
                         f.write(new_content)
                     return "UPDATED"
                return "SKIPPED (No Change)"

        # CASE 2: File is missing the mega menu entirely -> Inject it
        # Look for the "Tüm Kategoriler" link
        # <a href="..." class="nav-link categories-link" ... > ... </a>
        
        # We search for the class "categories-link"
        cat_link_marker = 'class="nav-link categories-link"'
        cat_link_idx = content.find(cat_link_marker)
        
        if cat_link_idx != -1:
            # Find the closing </a> tag for this link
            link_close_idx = content.find('</a>', cat_link_idx)
            if link_close_idx != -1:
                insertion_point = link_close_idx + 4 # AFTER </a>
                
                # Verify we aren't inside an existing mega-menu (false negative above?)
                # Check looking ahead a bit
                lookahead = content[insertion_point:insertion_point+200]
                if 'mega-menu' in lookahead:
                    return "SKIPPED (Already exists but regex failed?)"
                
                # Injection
                full_block = get_full_mega_menu_block(master_list_html)
                new_content = content[:insertion_point] + full_block + content[insertion_point:]
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                return "INJECTED"
        
        return "SKIPPED (Target 'Tüm Kategoriler' link not found)"
        
    except Exception as e:
        print(f"Error updating {file_path}: {e}")
        return "ERROR"

def main():
    try:
        master_list_html = get_master_menu_html()
        print("Successfully extracted master menu HTML.")
    except Exception as e:
        print(f"Critical Error: {e}")
        return

    stats = {"UPDATED": 0, "INJECTED": 0, "SKIPPED": 0, "ERROR": 0}
    
    for root, dirs, files in os.walk(BASE_DIR):
        if '.git' in root or 'backups' in root or 'node_modules' in root:
            continue
            
        for file in files:
            if file.endswith(".html") and file != "index.html":
                file_path = os.path.join(root, file)
                result = update_file(file_path, master_list_html)
                
                if result == "UPDATED" or result == "INJECTED":
                    print(f"{result}: {file}")
                    
                if result.startswith("SKIPPED"):
                    stats["SKIPPED"] += 1
                else:
                    stats[result] += 1
                    
    print(f"\nSummary:")
    print(f"Updated: {stats['UPDATED']}")
    print(f"Injected: {stats['INJECTED']}")
    print(f"Skipped: {stats['SKIPPED']}")
    print(f"Errors: {stats['ERROR']}")

if __name__ == "__main__":
    main()
