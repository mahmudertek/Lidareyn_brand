import os
import re

root_dir = r"c:\Users\pc\Desktop\Lidareyn_brand"

favicon_root = """
    <!-- Standardized Favicons (Relative) -->
    <link rel="icon" type="image/x-icon" href="favicon.ico?v=999">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon.png?v=999">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon.png?v=999">
    <link rel="apple-touch-icon" sizes="180x180" href="favicon.png?v=999">
"""

favicon_sub = """
    <!-- Standardized Favicons (Relative) -->
    <link rel="icon" type="image/x-icon" href="../favicon.ico?v=999">
    <link rel="icon" type="image/png" sizes="32x32" href="../favicon.png?v=999">
    <link rel="icon" type="image/png" sizes="16x16" href="../favicon.png?v=999">
    <link rel="apple-touch-icon" sizes="180x180" href="../favicon.png?v=999">
"""

def update_favicons():
    count = 0
    for dirpath, _, filenames in os.walk(root_dir):
        if any(x in dirpath for x in ['.git', 'node_modules', '.gemini']):
            continue
            
        rel_path = os.path.relpath(dirpath, root_dir)
        is_root = (rel_path == '.')
        
        block_to_use = favicon_root if is_root else favicon_sub
        prefix_msg = "Root" if is_root else "Subdir"

        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 1. Clean existing lines
                    lines = content.split('\n')
                    new_lines = []
                    for line in lines:
                        # Remove anything with favicon in it
                        if 'favicon.ico' in line or 'favicon.png' in line:
                            continue
                        new_lines.append(line)
                    content = '\n'.join(new_lines)
                    
                    # 2. Inject new block
                    if re.search(r'<head\b[^>]*>', content, re.IGNORECASE):
                        content = re.sub(r'(<head\b[^>]*>)', r'\1' + block_to_use, content, count=1, flags=re.IGNORECASE)
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        count += 1
                        
                except Exception as e:
                    print(f"Error {filename}: {e}")
    
    print(f"Updated {count} files with relative paths.")

if __name__ == "__main__":
    update_favicons()
