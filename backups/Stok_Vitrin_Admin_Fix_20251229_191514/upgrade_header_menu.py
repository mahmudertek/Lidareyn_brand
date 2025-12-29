import os
import glob
import re

def get_mega_menu_li_block(content):
    # Extract the full LI block for the mega menu category dropdown
    # Starts at line 91 in index.html as per viewing
    # Look for <li class="nav-item-dropdown" ... > ... Tüm Kategoriler ... </li>
    
    # We can perform a robust search
    # Find the li that contains "Tüm Kategoriler" AND "mega-menu"
    
    pattern = re.compile(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', re.DOTALL)
    match = pattern.search(content)
    if match:
        return match.group(1)
    return None

def main():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
    source_path = os.path.join(base_dir, 'index.html')
    
    with open(source_path, 'r', encoding='utf-8') as f:
        source_content = f.read()
    
    mega_menu_li_block = get_mega_menu_li_block(source_content)
    
    if not mega_menu_li_block:
        print("Could not find mega menu LI block in index.html using regex.")
        # Fallback: manual extraction based on known structure if regex fails due to complexity
        # But let's hope regex works. The file is well formatted.
        return
        
    print(f"Extracted mega menu LI block length: {len(mega_menu_li_block)}")
    
    # List of files to update
    files = glob.glob(os.path.join(base_dir, '*.html'))
    cat_files = glob.glob(os.path.join(base_dir, 'kategoriler', '*.html'))
    all_files = files + cat_files
    
    # Regex to find the "Simple" link
    # It usually looks like <li><a href="index.html#kategoriler" class="nav-link">Tüm Kategoriler</a></li>
    # But might have different attributes or whitespace.
    simple_link_pattern = re.compile(r'<li[^>]*>\s*<a href="[^"]*#kategoriler"[^>]*>.*?Tüm Kategoriler.*?</a>\s*</li>', re.DOTALL)
    
    count = 0
    for file_path in all_files:
        if os.path.abspath(file_path) == os.path.abspath(source_path):
            continue
            
        if 'backups' in file_path or 'admin' in file_path:
            continue
            
        # Determine if we are in a subdirectory
        is_subdir = 'kategoriler' in os.path.dirname(file_path)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if it already has the mega menu
            if 'class="mega-menu"' in content and 'Tüm Kategoriler' in content:
                # Already has it. We rely on sync_mega_menu.py for updates, 
                # OR we could force update here too.
                # Let's force update here to be sure, using REPLACEMENT of the block.
                # Find the existing block
                existing_match = re.search(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', content, re.DOTALL)
                if existing_match:
                     # It exists. We will replace it anyway to ensure paths are correct.
                     pass
                else:
                    # Maybe structure is different?
                    pass
                # Actually, let's just focus on UPGRADING the simple ones first.
                # If I try to replace existing huge blocks with regex, it might be slow or risky.
                # But wait, the user said "changes not visible". Sync script updated them.
                # So the issue is files WITHOUT it.
                pass
            
            # Find simple link
            match = simple_link_pattern.search(content)
            if match:
                print(f"Upgrading {os.path.basename(file_path)}...")
                original_text = match.group(0)
                
                # Prepare replacement
                block_to_insert = mega_menu_li_block
                
                if is_subdir:
                    # Adjust paths for subdirectory
                    # 1. href="index.html -> href="../index.html
                    # 2. href="kategoriler/ -> href="
                    
                    # Be careful not to double replace
                    # Replace "kategoriler/" with ""
                    block_to_insert = block_to_insert.replace('href="kategoriler/', 'href="')
                    
                    # Replace "index.html" with "../index.html"
                    # But wait, original block has href="index.html#kategoriler".
                    # After step 1: href="index.html#kategoriler" (no change)
                    # So we replace href="index.html with href="../index.html
                    block_to_insert = block_to_insert.replace('href="index.html', 'href="../index.html')
                    
                    # Also check for other root links if any?
                    # Mega menu mostly has category links.
                
                # Perform replacement
                new_content = content.replace(original_text, block_to_insert)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                
        except Exception as e:
            print(f"  Error processing {file_path}: {e}")

    print(f"Total files upgraded: {count}")

if __name__ == '__main__':
    main()
