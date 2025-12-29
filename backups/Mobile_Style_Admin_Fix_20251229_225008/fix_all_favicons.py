import os
import re

root_dir = r"c:\Users\pc\Desktop\Lidareyn_brand"

# Template with placeholder for path prefix
favicon_block_template = """
    <!-- Standardized Favicons (Auto-Injected) -->
    <link rel="icon" type="image/x-icon" href="{PREFIX}favicon.ico?v=99">
    <link rel="icon" type="image/png" sizes="32x32" href="{PREFIX}favicon.png?v=99">
    <link rel="icon" type="image/png" sizes="16x16" href="{PREFIX}favicon.png?v=99">
    <link rel="apple-touch-icon" sizes="180x180" href="{PREFIX}favicon.png?v=99">
    <link rel="shortcut icon" href="{PREFIX}favicon.ico?v=99">
"""

def update_favicons():
    count = 0
    for dirpath, _, filenames in os.walk(root_dir):
        if '.git' in dirpath or 'node_modules' in dirpath or '.gemini' in dirpath:
            continue
            
        # Determine prefix based on depth relative to root
        rel_path = os.path.relpath(dirpath, root_dir)
        if rel_path == '.':
            prefix = ""
        else:
            # Count backslashes to determine depth
            depth = len(rel_path.split(os.sep))
            prefix = "../" * depth
            
        current_block = favicon_block_template.replace("{PREFIX}", prefix)

        for filename in filenames:
            if filename.endswith('.html'):
                filepath = os.path.join(dirpath, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 1. Clean existing favicon links (Loose regex to catch variations)
                    # Remove lines containing rel="icon", rel="shortcut icon", rel="apple-touch-icon"
                    lines = content.split('\n')
                    new_lines = []
                    for line in lines:
                        if 'rel="icon"' in line or 'rel="shortcut icon"' in line or 'rel="apple-touch-icon"' in line or '<!-- Favicons' in line:
                            continue
                        if 'favicon.ico' in line or 'favicon.png' in line: # Extra safety
                            continue
                        new_lines.append(line)
                    
                    content = '\n'.join(new_lines)
                    
                    # 2. Inject new block after <head>
                    # Regex to find <head> tag (case insensitive)
                    if re.search(r'<head\b[^>]*>', content, re.IGNORECASE):
                        content = re.sub(r'(<head\b[^>]*>)', r'\1' + current_block, content, count=1, flags=re.IGNORECASE)
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Updated: {filename} (Prefix: '{prefix}')")
                        count += 1
                    else:
                        print(f"Skipped (No head tag): {filename}")
                        
                except Exception as e:
                    print(f"Error processing {filename}: {e}")
    
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    update_favicons()
