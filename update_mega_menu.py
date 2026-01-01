import os
import re

# Get the mega menu content ONLY (the inner UL part inside the div is what matters most, or just the whole div)
index_path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    index_content = f.read()

# Extract JUST the mega-menu div content strictly
# It starts with <div class="mega-menu"> and ends with </div> before the closing </li> of the dropdown
mega_menu_pattern = r'(<div class="mega-menu">[\s\S]*?</div>)\s*</li>\s*<li><a href="yeni-gelenler\.html"'
match = re.search(mega_menu_pattern, index_content)

if not match:
    print("Could not find mega menu in index.html")
    # Fallback debug
    print(index_content[200:500])
    exit(1)

mega_menu_content = match.group(1)
print(f"Extracted mega menu div ({len(mega_menu_content)} chars)")

# List of HTML files to update
html_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
files_to_update = []

for filename in os.listdir(html_dir):
    if filename.endswith('.html') and filename != 'index.html' and 'YEDEK' not in filename:
        files_to_update.append(os.path.join(html_dir, filename))

print(f"Found {len(files_to_update)} files to update")

for filepath in files_to_update:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Target regex: <div class="mega-menu"> ... </div> followed by </li> and nav links
    # This ensures we replace exactly the same block we extracted
    target_pattern = r'<div class="mega-menu">[\s\S]*?</div>(\s*</li>\s*<li><a href="yeni-gelenler\.html")'
    
    if re.search(target_pattern, content):
        # We replace the whole div match with our extracted div content, keeping the group 1 (</li>...) intact
        new_content = re.sub(target_pattern, mega_menu_content + r'\1', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {os.path.basename(filepath)}")
    else:
        print(f"No mega menu match found in: {os.path.basename(filepath)}")

print("Done!")
