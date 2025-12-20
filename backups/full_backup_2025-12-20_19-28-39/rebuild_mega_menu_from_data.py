import re
import os

# Paths
BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
DATA_FILE = os.path.join(BASE_DIR, "categories-data.js")
INDEX_FILE = os.path.join(BASE_DIR, "index.html")

def parse_js_data(content):
    """
    Parses the JS object structure from categories-data.js using a brace-counting approach.
    """
    # Remove comments
    content = re.sub(r'//.*', '', content)
    
    # Find the start of categoriesData
    match_start = re.search(r'categoriesData\s*=\s*\{', content)
    if not match_start:
        return []
        
    start_idx = match_start.end() - 1 # Point to the opening {
    
    # Extract the main object body by balancing braces
    balance = 0
    end_idx = -1
    for i in range(start_idx, len(content)):
        char = content[i]
        if char == '{':
            balance += 1
        elif char == '}':
            balance -= 1
            if balance == 0:
                end_idx = i + 1
                break
                
    if end_idx == -1:
        return []
        
    body = content[start_idx+1 : end_idx-1] # content inside main {}
    
    categories = []
    
    # Now we need to split by top-level keys. 
    # Structure: 'key': { ... }, 'key2': { ... }
    # We can iterate and capture blocks.
    
    # Regex to find a key start:  'slug': {
    key_pattern = re.compile(r"^\s*'([\w-]+)'\s*:\s*\{", re.MULTILINE)
    
    # We will slice the body based on where these keys are found
    # But finding the *end* of each block requires balancing again.
    
    # Simpler approach: regex to find 'key': and then balance from there
    
    cursor = 0
    while cursor < len(body):
        # Find next key
        match = key_pattern.search(body, cursor)
        if not match:
            break
            
        slug = match.group(1)
        block_start = match.end() - 1 # the {
        
        # Balance from block_start
        sub_balance = 0
        block_end = -1
        for j in range(block_start, len(body)):
            if body[j] == '{':
                sub_balance += 1
            elif body[j] == '}':
                sub_balance -= 1
                if sub_balance == 0:
                    block_end = j + 1
                    break
        
        if block_end == -1:
            break # Should not happen
            
        cat_body = body[block_start+1 : block_end-1]
        cursor = block_end
        
        # Now parse fields from cat_body
        title_m = re.search(r"title:\s*'(.*?)'", cat_body)
        title = title_m.group(1) if title_m else slug
        
        desc_m = re.search(r"description:\s*'(.*?)'", cat_body)
        description = desc_m.group(1) if desc_m else ""
        
        icon_m = re.search(r"icon:\s*'(.*?)'", cat_body)
        icon = icon_m.group(1) if icon_m else "fa-circle"
        
        # Subcategories
        subcats = []
        # Find subcategories: [ ... ]
        # Again, use balancing [ ]
        sub_start_m = re.search(r"subcategories:\s*\[", cat_body)
        if sub_start_m:
            sq_balance = 0
            sq_start = sub_start_m.end() - 1
            sq_end = -1
            for k in range(sq_start, len(cat_body)):
                if cat_body[k] == '[':
                    sq_balance += 1
                elif cat_body[k] == ']':
                    sq_balance -= 1
                    if sq_balance == 0:
                        sq_end = k + 1
                        break
            
            if sq_end != -1:
                subcat_block = cat_body[sq_start+1 : sq_end-1]
                
                # Parse objects { ... } inside the array
                # { name: '...', items: [...], icon: '...' }
                # We can iterate finding { and balancing }
                
                sub_cursor = 0
                while sub_cursor < len(subcat_block):
                    obj_start = subcat_block.find('{', sub_cursor)
                    if obj_start == -1:
                        break
                        
                    obj_balance = 0
                    obj_end = -1
                    for m in range(obj_start, len(subcat_block)):
                        if subcat_block[m] == '{':
                            obj_balance += 1
                        elif subcat_block[m] == '}':
                            obj_balance -= 1
                            if obj_balance == 0:
                                obj_end = m + 1
                                break
                    
                    if obj_end == -1: 
                        break
                        
                    sub_obj_str = subcat_block[obj_start:obj_end]
                    sub_cursor = obj_end
                    
                    # Parse fields in sub_obj_str
                    s_name_m = re.search(r"name:\s*'(.*?)'", sub_obj_str)
                    s_name = s_name_m.group(1) if s_name_m else "Sub"
                    
                    s_icon_m = re.search(r"icon:\s*'(.*?)'", sub_obj_str)
                    s_icon = s_icon_m.group(1) if s_icon_m else "fa-caret-right"
                    
                    # items: [ ... ]
                    s_items = []
                    s_items_m = re.search(r"items:\s*\[(.*?)\]", sub_obj_str, re.DOTALL)
                    if s_items_m:
                        raw_items = s_items_m.group(1)
                        s_items = re.findall(r"'(.*?)'", raw_items)
                        
                    subcats.append({
                        "name": s_name,
                        "icon": s_icon,
                        "items": s_items
                    })

        categories.append({
            "slug": slug,
            "title": title,
            "description": description,
            "icon": icon,
            "subcategories": subcats
        })
        
    return categories

def generate_html(categories):
    html_parts = []
    html_parts.append('<ul class="mega-menu-list">')
    
    for cat in categories:
        slug = cat['slug']
        title = cat['title']
        icon = cat['icon']
        
        # Start List Item
        # We need to add 'active' class logic via JS, but HTML structure is key
        html_parts.append('    <li>')
        
        # Link
        html_parts.append(f'        <a href="kategoriler/{slug}.html">')
        html_parts.append('            <div class="menu-item-left">')
        html_parts.append(f'                <i class="fa-solid {icon}"></i>')
        html_parts.append(f'                <span>{title}</span>')
        html_parts.append('            </div>')
        html_parts.append('            <i class="fa-solid fa-chevron-right"></i>')
        html_parts.append('        </a>')
        
        # Sub Menu
        if cat['subcategories']:
            html_parts.append('        <div class="sub-menu">')
            
            for sub in cat['subcategories']:
                html_parts.append('            <div class="sub-menu-column">')
                html_parts.append(f'                <h4>{sub["name"]}</h4>')
                html_parts.append('                <ul>')
                for item in sub['items']:
                    html_parts.append(f'                    <li><a href="#">{item}</a></li>')
                html_parts.append('                </ul>')
                html_parts.append('            </div>')
            
            html_parts.append('        </div>')
        
        html_parts.append('    </li>')

    # Add extra static links at the bottom if needed (based on previous file content)
    # The previous file had "Tüm Markalar", "Yeni Gelenler", "Popüler Ürünler" in the list?
    # No, those were outside the mega-menu-list in the nav-menu, but sometimes people put them inside on mobile?
    # Looking at index.html (lines 253+), they are separate LI items in the .nav-menu, NOT inside .mega-menu-list.
    # The .mega-menu-list contains ONLY the categories.
    
    html_parts.append('</ul>')
    return "\n".join(html_parts)

def main():
    print(f"Reading {DATA_FILE}...")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        js_content = f.read()
            
    categories = parse_js_data(js_content)
    print(f"Found {len(categories)} categories.")
    
    new_html_content = generate_html(categories)
    
    print(f"Reading {INDEX_FILE}...")
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        index_content = f.read()
        
    # Regex to find the <ul class="mega-menu-list"> ... </ul> block
    # We need to be careful to match the closing tag correctly.
    # Since the structure is nested, a simple regex might fail if not greedy enough or too greedy.
    # However, we know specific markers.
    
    start_marker = '<ul class="mega-menu-list">'
    end_marker = '</ul>'
    
    start_idx = index_content.find(start_marker)
    if start_idx == -1:
        print("Error: Could not find <ul class=\"mega-menu-list\"> in index.html")
        return

    # Find the matching closing ul for this specific block
    # Since it's nested (sub-menus have uls), we need to count balance.
    
    current_idx = start_idx + len(start_marker)
    balance = 1 # We are inside the first UL
    
    closure_idx = -1
    
    # Simple parser to find matching </ul>
    while current_idx < len(index_content):
        next_open = index_content.find('<ul', current_idx)
        next_close = index_content.find('</ul>', current_idx)
        
        if next_close == -1:
            break # Should not happen if valid, but file is malformed currently!
            
        if next_open != -1 and next_open < next_close:
            # Found nested open
            balance += 1
            current_idx = next_open + 3
        else:
            # Found close
            balance -= 1
            current_idx = next_close + 5
            if balance == 0:
                closure_idx = next_close + 5
                break
    
    if closure_idx == -1:
         # Fallback for malformed file: Find the </ul> that closes the block before </nav> or similar?
         # Or just use the one before "<!-- Logo (Centered) -->" or similar context?
         # The code around line 253 in index.html shows the list ends, then other LIs start.
         # <ul class="nav-menu">
         #   <li class="nav-item-dropdown"> ... <div class="mega-menu"> <ul class="mega-menu-list"> ... </ul> </div> </li>
         #   <li><a href="#flowing-menu-root"...
         
         # Let's look for the closure of the mega-menu div if the list is messed up
         pass

    # Since we know the file is broken/chopped at line 108/120 etc in the view, 
    # and previous view shows it malformed.
    # Actually, the view_file output showed a weird cutoff or valid-ish lines but looking strangely interleaved.
    # Let's try to replace everything between <ul class="mega-menu-list"> and the next </div> (which closes mega-menu)
    
    # Using regex to find the surrounding container might be safer if the inner HTML is broken.
    pattern = r'(<ul class="mega-menu-list">)(.*?)(</ul>\s*</div>)'
    # This assumes the </ul> is followed by </div> immediately, which matches style.
    
    # Actually, let's just find the start, and find the `</div>` that closes `.mega-menu`.
    # The structure is:
    # <div class="mega-menu">
    #    <ul class="mega-menu-list">
    #       ...
    #    </ul>
    # </div>
    
    mega_menu_start = index_content.find('<div class="mega-menu">')
    if mega_menu_start == -1:
        print("Could not find .mega-menu container")
        return
        
    # Find the closing div for mega-menu. It's likely the next </div> after the </ul>, 
    # BUT if </ul> is missing, we might just look for the first </div> after mega-menu-list start?
    # Or look for line 253 context: <li><a href="#flowing-menu-root"
    
    # Let's replace the whole inner content of <div class="mega-menu">...</div>
    # But wait, looking at line 105: <div class="mega-menu"> <ul class="mega-menu-list"> ...
    
    # Let's construct the FULL replacement for the .mega-menu block
    new_mega_menu_block = f'<div class="mega-menu">\n{new_html_content}\n                        </div>'
    
    # We need to replace the existing .mega-menu div content.
    # Let's find the range.
    
    # Start: <div class="mega-menu">
    # End: The closing div before `</li>` that wraps it. 
    # Context: 
    # 105: <div class="mega-menu">
    # ...
    # 252: </li>
    
    # We can try to replace from `<div class="mega-menu">` up to the `</li>` at line 252 (approx).
    
    # Let's use a robust marker based replacement given we have file content.
    # We look for "Tüm Kategoriler" link before it.
    
    marker_start = '<div class="mega-menu">'
    marker_end_context = '</li>' # Too generic
    marker_end_context_2 = '<li><a href="#flowing-menu-root"' # This is the sibling LI
    
    idx_start = index_content.find(marker_start)
    idx_end_context = index_content.find(marker_end_context_2)
    
    if idx_start != -1 and idx_end_context != -1:
        # We need to find the `</div>` and `</li>` before idx_end_context
        # The structure is: ... </div> </li> <li><a href="#flowing-menu-root"
        
        # So we can just replace everything from `idx_start` up to `idx_end_context` with our new block + closing li?
        # Wait, the structure is:
        # <li ...>
        #    <a ...>Tüm Kategoriler</a>
        #    <div class="mega-menu"> ... </div>
        # </li>
        # <li><a href="#flowing-menu-root" ...
        
        # So correct replacement is `new_mega_menu_block + "\n                    "`
        # And we cut up to the closing `</li>` of the dropdown item.
        
        # Finding the last </li> before idx_end_context
        substring = index_content[idx_start:idx_end_context]
        last_li_close = substring.rfind('</li>')
        
        if last_li_close != -1:
            abs_end = idx_start + last_li_close
            
            # Perform replacement
            # Note: We are replacing `<div class="mega-menu"> ... </div>` 
            # We assume the `</li>` is AFTER the div.
            
            # Let's verify if substring has `</div>`.
            last_div_close = substring.rfind('</div>')
            if last_div_close != -1:
                 # Replace from idx_start to (idx_start + last_div_close + 6)
                 final_content = index_content[:idx_start] + new_mega_menu_block + index_content[idx_start + last_div_close + 6:]
                 
                 with open(INDEX_FILE, "w", encoding="utf-8") as f:
                     f.write(final_content)
                 print("Successfully updated index.html")
                 return

    print("Could not reliably identify replacement zone. Aborting to avoid damage.")

if __name__ == "__main__":
    main()
