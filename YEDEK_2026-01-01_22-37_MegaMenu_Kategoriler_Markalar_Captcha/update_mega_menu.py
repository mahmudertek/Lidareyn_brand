import os
import re

# Get the mega menu from index.html
index_path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    index_content = f.read()

# Extract mega menu section (from <div class="mega-menu"> to closing </div></li> before nav links)
mega_menu_pattern = r'(<div class="mega-menu">.*?</ul>\s*</div>\s*</li>)\s*<li><a href="yeni-gelenler\.html"'
match = re.search(mega_menu_pattern, index_content, re.DOTALL)

if not match:
    print("Could not find mega menu in index.html")
    exit(1)

mega_menu_template = match.group(1)
print(f"Extracted mega menu ({len(mega_menu_template)} chars)")

# List of HTML files to update (excluding backups and index.html)
html_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
files_to_update = []

for filename in os.listdir(html_dir):
    if filename.endswith('.html') and filename != 'index.html' and 'YEDEK' not in filename:
        filepath = os.path.join(html_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'class="mega-menu"' in content and 'Akülü Aletler' not in content:
            files_to_update.append(filepath)

print(f"Found {len(files_to_update)} files to update")

# Update each file
for filepath in files_to_update:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace old mega menu with new one
    old_pattern = r'<div class="mega-menu">.*?</ul>\s*</div>\s*</li>(\s*<li><a href="yeni-gelenler\.html")'
    replacement = mega_menu_template + r'\1'
    
    new_content, count = re.subn(old_pattern, replacement, content, flags=re.DOTALL)
    
    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {os.path.basename(filepath)}")
    else:
        print(f"No match: {os.path.basename(filepath)}")

print("Done!")
