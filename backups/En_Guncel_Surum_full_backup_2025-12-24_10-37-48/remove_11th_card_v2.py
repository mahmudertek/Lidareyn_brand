import re

file_path = 'index.html'
backup_path = 'removed_category_card_backup.txt'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to capture items inside directCategories
pattern = r'(const directCategories = \[\s*)([\s\S]*?)(\s*\];)'
match = re.search(pattern, content)

if match:
    prefix = match.group(1)
    array_content = match.group(2)
    suffix = match.group(3)
    
    # Capture items
    # item pattern: { ... }
    # We strip whitespace to be safe
    # item_matches will contain just the object strings
    item_matches = re.findall(r'\{[\s\S]*?\}', array_content)
    
    if len(item_matches) >= 11:
        removed_item = item_matches[10]
        
        # Backup
        with open(backup_path, 'w', encoding='utf-8') as b:
            b.write(removed_item)
        print(f"Backed up item to {backup_path}")
        
        # Remove
        del item_matches[10]
        
        # Reconstruct
        # We need to preserve the indentation. 
        # Typically indented by 16 spaces (4 tabs or 16 spaces) based on previous file view
        # Let's inspect the first item to see indentation?
        # Or just use a standard indentation
        
        new_inner = ""
        for i, item in enumerate(item_matches):
            new_inner += item
            if i < len(item_matches) - 1:
                new_inner += ",\n"
        
        # Replace
        new_block = prefix + new_inner + suffix
        final_content = content.replace(match.group(0), new_block)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
        print("Successfully removed 11th item.")
        
    else:
        print(f"Not enough items to remove 11th. Found {len(item_matches)}")
else:
    print("Could not find directCategories.")
