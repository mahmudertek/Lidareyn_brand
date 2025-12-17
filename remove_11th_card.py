import re
import json

file_path = 'index.html'
backup_path = 'removed_category_card_backup.txt'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to capture items inside directCategories
# matching objects inside the array
pattern = r'(const directCategories = \[\s*)([\s\S]*?)(\s*\];)'
match = re.search(pattern, content)

if match:
    prefix = match.group(1)
    array_content = match.group(2)
    suffix = match.group(3)
    
    # Split by closing brace + comma (or just closing brace for simple split)
    # This is a bit fragile with regex split, let's do more robust parsing or simple string manipulation since format is known
    
    # We know the items are wrapped in curly braces { ... }
    # Let's find all occurences of { ... }
    # This regex assumes no nested braces inside the object, which holds for this data
    items_pattern = r'(\s*\{[\s\S]*?\})(\s*,?)'
    items = re.findall(items_pattern, array_content)
    
    if len(items) >= 11:
        # The 11th item is index 10
        item_to_remove = items[10]
        item_str = item_to_remove[0] # The content { ... }
        
        # Save to backup
        with open(backup_path, 'w', encoding='utf-8') as backup:
            backup.write(item_str)
        print(f"Backed up 11th item to {backup_path}")
        
        # Reconstruct the array content without the 11th item
        new_array_content = ""
        for i, item in enumerate(items):
            if i == 10:
                continue
            # Logic to handle commas
            # If it's the last item in the NEW list, ensure no trailing comma if possible (though JS allows it)
            # The regex captured the comma in group 2
            
            # Reconstruction:
            # We just append the object string and the comma/spacing
            # But we need to be careful about the comma of the item BEFORE the removed one?
            # No, the comma is attached to the item itself in my regex group 2 usually.
            # Let's verify group 2
            
            obj_str = item[0]
            separator = item[1]
            
            # If we are removing the LAST item, the previous item might have a comma that is okay to leave (JS allows trailing comma)
            # If we are removing an intermediate item, the logic holds.
            
            # Actually, let's clean up the trailing comma for the new last item just to be clean
            if i == len(items) - 1 and i != 10: 
                 # This was the last item and we kept it
                 pass
            elif i == len(items) - 2 and 10 == len(items) - 1:
                # We are keeping the second to last, and removing the last.
                # Ideally remove comma from this one, but strictly unnecessary for JS
                pass

            new_array_content += obj_str + separator
            
        # The regex findall might miss whitespace between items if not careful, so let's stick to replacing the specific string of the 11th item
        
        # Simpler approach: Locate exactly the 11th item string in the original content and replace it with empty string
        # Re-finding specifically the 11th match in the full string
        
        # Iterator for matches
        current_idx = 0
        def replace_callback(m):
            nonlocal current_idx
            result = m.group(0)
            if current_idx == 10:
                result = "" # Remove it
            current_idx += 1
            return result

        new_array_content_replaced = re.sub(items_pattern, replace_callback, array_content)
        
        # Remove empty lines that might result (cleanup)
        # new_array_content_replaced = re.sub(r'\n\s*\n', '\n', new_array_content_replaced)
        
        final_content = content.replace(array_content, new_array_content_replaced)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
            
        print("Removed 11th item from index.html")
        
    else:
        print(f"Found only {len(items)} items, less than 11.")

else:
    print("Could not find directCategories array.")
