
import os
import re

ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'

FAVICON_BLOCK = '''    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="favicon.png">
'''

FAVICON_BLOCK_SUBDIR = '''    <!-- Favicons -->
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../favicon.png">
'''

def add_favicon(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip if already has proper favicon
    if 'rel="icon" type="image/x-icon"' in content:
        return
    
    # Determine if file is in subdirectory
    is_subdir = 'kategoriler' in file_path or 'admin' in file_path or 'markalar' in file_path
    
    favicon_to_add = FAVICON_BLOCK_SUBDIR if is_subdir else FAVICON_BLOCK
    
    # Remove old favicon links if any
    content = re.sub(r'\s*<link[^>]*rel="(shortcut icon|icon|apple-touch-icon)"[^>]*>\s*', '', content)
    
    # Find insertion point - after <title> tag
    title_match = re.search(r'</title>\s*', content)
    if title_match:
        insert_pos = title_match.end()
        new_content = content[:insert_pos] + '\n' + favicon_to_add + content[insert_pos:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Added favicon to: {file_path}")

# Process all HTML files
for root, dirs, files in os.walk(ROOT_DIR):
    # Skip backups
    if 'backups' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            add_favicon(os.path.join(root, file))

print("Done!")
