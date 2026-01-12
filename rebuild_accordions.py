import os
import re

BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
DATA_FILE = os.path.join(BASE_DIR, "categories-data.js")
KATEGORILER_DIR = os.path.join(BASE_DIR, "kategoriler")

def parse_js_data(content):
    categories = {}
    # Use a simpler way to find slugs: they are at the start of a line or after a {
    slugs = re.findall(r"['\"]([\w-]+)['\"]\s*:\s*\{", content)
    
    for slug in slugs:
        start_pos = content.find(f"'{slug}':")
        if start_pos == -1: 
             start_pos = content.find(f"\"{slug}\":")
        if start_pos == -1: continue
        
        brace_start = content.find("{", start_pos)
        balance = 0
        brace_end = -1
        for i in range(brace_start, len(content)):
            if content[i] == '{': balance += 1
            elif content[i] == '}': 
                balance -= 1
                if balance == 0:
                    brace_end = i + 1
                    break
        
        if brace_end == -1: continue
        block_content = content[brace_start:brace_end]
        
        title_m = re.search(r"title\s*:\s*['\"](.*?)['\"]", block_content)
        title = title_m.group(1) if title_m else slug
        
        subcats = []
        # Find subcategories: [ ... ]
        sub_list_start = re.search(r"subcategories\s*:\s*\[", block_content)
        if sub_list_start:
            sq_start = sub_list_start.end() - 1
            sq_balance = 0
            sq_end = -1
            for k in range(sq_start, len(block_content)):
                if block_content[k] == '[': sq_balance += 1
                elif block_content[k] == ']':
                    sq_balance -= 1
                    if sq_balance == 0:
                        sq_end = k + 1
                        break
            
            if sq_end != -1:
                sub_body = block_content[sq_start+1 : sq_end-1]
                i = 0
                while i < len(sub_body):
                    obj_start = sub_body.find("{", i)
                    if obj_start == -1: break
                    
                    obj_balance = 0
                    obj_end = -1
                    for j in range(obj_start, len(sub_body)):
                        if sub_body[j] == '{': obj_balance += 1
                        elif sub_body[j] == '}':
                            obj_balance -= 1
                            if obj_balance == 0:
                                obj_end = j + 1
                                break
                    if obj_end == -1: break
                    
                    obj_str = sub_body[obj_start:obj_end]
                    name_m = re.search(r"name\s*:\s*['\"](.*?)['\"]", obj_str)
                    items_match = re.search(r"items\s*:\s*\[(.*?)\]", obj_str, re.DOTALL)
                    if name_m and items_match:
                        subcats.append({
                            "name": name_m.group(1),
                            "items": re.findall(r"['\"](.*?)['\"]", items_match.group(1))
                        })
                    i = obj_end
        
        categories[slug] = {"title": title, "subcategories": subcats}
    return categories

def generate_accordion_html(cat_data):
    html = []
    html.append('    <!-- Mobile: Category Accordion Navigation -->')
    html.append('    <div class="container">')
    html.append('        <div class="category-accordion">')
    html.append('            <button class="accordion-main-trigger">')
    html.append('                Alt Kategoriler')
    html.append('                <i class="fa-solid fa-chevron-down"></i>')
    html.append('            </button>')
    html.append('            <div class="accordion-content">')
    
    for sub in cat_data['subcategories']:
        html.append('                <div class="accordion-parent">')
        html.append('                    <button class="accordion-parent-trigger">')
        html.append(f'                        {sub["name"]}')
        html.append('                        <i class="fa-solid fa-chevron-down"></i>')
        html.append('                    </button>')
        html.append('                    <div class="accordion-children">')
        for item in sub['items']:
            html.append(f'                        <a href="#" class="accordion-child-item">{item}</a>')
        html.append('                    </div>')
        html.append('                </div>')
        
    html.append('            </div>')
    html.append('        </div>')
    html.append('    </div>')
    return "\n".join(html)

def main():
    if not os.path.exists(DATA_FILE): return
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    
    categories = parse_js_data(content)
    print(f"Parsed {len(categories)} categories")
    for s, d in categories.items():
        if len(d['subcategories']) > 0:
            print(f"  {s}: {len(d['subcategories'])} subcategories")
    
    for filename in os.listdir(KATEGORILER_DIR):
        if not filename.endswith(".html"): continue
        slug = filename.replace(".html", "")
        if slug not in categories: continue
            
        file_path = os.path.join(KATEGORILER_DIR, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()
            
        start_marker = '<!-- Mobile: Category Accordion Navigation -->'
        start_idx = html_content.find(start_marker)
        if start_idx == -1: continue
            
        end_marker = '<!-- Hybrid: Product Listing -->'
        end_idx = html_content.find(end_marker, start_idx)
        if end_idx == -1:
             end_marker = '<section class="category-products-section"'
             end_idx = html_content.find(end_marker, start_idx)

        if end_idx != -1:
            new_html = html_content[:start_idx] + generate_accordion_html(categories[slug]) + "\n\n    " + html_content[end_idx:]
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(new_html)
                
    print("All accordions updated!")

if __name__ == "__main__":
    main()
