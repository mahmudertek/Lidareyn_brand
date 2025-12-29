
import os
import re

ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'

def update_contact_links(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Pattern 1: WhatsApp - icon outside link
    # <i class="fa-brands fa-whatsapp"></i>\n                                <a href="https://wa.me/...">
    content = re.sub(
        r'<i class="fa-brands fa-whatsapp"></i>\s*<a href="(https://wa\.me/\d+)"[^>]*>([^<]+)</a>',
        r'<a href="\1" target="_blank"><i class="fa-brands fa-whatsapp"></i> \2</a>',
        content
    )
    
    # Pattern 2: Phone - icon outside link
    content = re.sub(
        r'<i class="fa-solid fa-phone"></i>\s*<a href="(tel:[^"]+)">([^<]+)</a>',
        r'<a href="\1"><i class="fa-solid fa-phone"></i> \2</a>',
        content
    )
    
    # Pattern 3: Email - icon outside link
    content = re.sub(
        r'<i class="fa-solid fa-envelope"></i>\s*<a href="(mailto:[^"]+)">([^<]+)</a>',
        r'<a href="\1"><i class="fa-solid fa-envelope"></i> \2</a>',
        content
    )
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated contact links in: {file_path}")

# Process all HTML files
for root, dirs, files in os.walk(ROOT_DIR):
    if 'backups' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            update_contact_links(os.path.join(root, file))

print("Done!")
