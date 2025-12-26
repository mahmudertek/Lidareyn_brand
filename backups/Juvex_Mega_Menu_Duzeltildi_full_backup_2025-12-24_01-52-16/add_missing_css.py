import os
import glob
import re

def main():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
    
    files = glob.glob(os.path.join(base_dir, '*.html'))
    cat_files = glob.glob(os.path.join(base_dir, 'kategoriler', '*.html'))
    all_files = files + cat_files
    
    count = 0
    for file_path in all_files:
        if 'backups' in file_path or 'admin' in file_path:
            continue
            
        is_subdir = 'kategoriler' in os.path.dirname(os.path.abspath(file_path))
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'mega_menu_styles.css' in content:
                continue
                
            # Determine path to css
            css_filename = 'mega_menu_styles.css'
            if is_subdir:
                css_filename = '../mega_menu_styles.css'
                target_style = '"../style.css"'
                # regex to match href="../style.css" or href='../style.css'
            else:
                target_style = '"style.css"'
            
            # Find insertion point
            # Look for style.css
            # We use loose matching for style.css because it might have query params
            
            # Regex for <link ... href="...style.css..." ... >
            # We want to insert AFTER this tag.
            
            # Simple approach: find the closing > of the style.css link tag.
            
            style_pattern = re.compile(r'(<link[^>]*href=["\'][^"\']*style\.css[^"\']*["\'][^>]*>)', re.IGNORECASE)
            match = style_pattern.search(content)
            
            if match:
                print(f"Adding CSS to {os.path.basename(file_path)}...")
                original_tag = match.group(1)
                new_tag = f'\n    <link rel="stylesheet" href="{css_filename}">'
                
                # Insert after
                new_content = content.replace(original_tag, original_tag + new_tag)
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
            else:
                print(f"  style.css not found in {os.path.basename(file_path)}, skipping CSS injection.")
                
        except Exception as e:
            print(f"  Error processing {file_path}: {e}")

    print(f"Total files updated with CSS: {count}")

if __name__ == '__main__':
    main()
