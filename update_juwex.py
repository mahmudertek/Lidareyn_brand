import os
import re

# Root directory
root_dir = r"c:\Users\pc\Desktop\Lidareyn_brand"

# Files to update (exclude backups)
html_files = []
for root, dirs, files in os.walk(root_dir):
    # Skip backup directories
    if 'backups' in root or 'backup' in root.lower():
        continue
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

print(f"Found {len(html_files)} HTML files to process")

# Replace Juvex with Juwex in all files
count = 0
for filepath in html_files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace only the display text "Juvex" in navigation links, not the filename
        # Pattern: >Juvex</a> should become >Juwex</a>
        new_content = content.replace('>Juvex</a>', '>Juwex</a>')
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Updated: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

print(f"\nTotal files updated: {count}")
