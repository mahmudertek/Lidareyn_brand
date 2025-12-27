
import os
import re

ROOT_DIR = 'c:\\Users\\pc\\Desktop\\Lidareyn_brand'

def update_footer_contacts(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Update email
    content = re.sub(
        r'mailto:destek@galatacarsi\.com',
        'mailto:mail@galatacarsi.com',
        content
    )
    content = re.sub(
        r'>destek@galatacarsi\.com<',
        '>mail@galatacarsi.com<',
        content
    )
    
    # Update WhatsApp number
    content = re.sub(
        r'https://wa\.me/905551234567',
        'https://wa.me/905550501374',
        content
    )
    content = re.sub(
        r'>\+90 555 123 45 67<',
        '>0555 050 13 74<',
        content
    )
    
    # Update phone number
    content = re.sub(
        r'tel:\+905551234567',
        'tel:+905550501374',
        content
    )
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated contacts in: {file_path}")

# Process all HTML files
for root, dirs, files in os.walk(ROOT_DIR):
    if 'backups' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.html'):
            update_footer_contacts(os.path.join(root, file))

print("Done!")
