import sys
import os
import re
import json

BASE_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
DATA_FILE = os.path.join(BASE_DIR, "categories-data.js")

def main():
    if len(sys.argv) < 5:
        print("Usage: python manage_subcategory.py <action> <categorySlug> <groupName> <subName>")
        return

    action = sys.argv[1] # 'add' or 'delete'
    cat_slug = sys.argv[2]
    group_name = sys.argv[3]
    sub_name = sys.argv[4] if len(sys.argv) > 4 else ""

    print(f"Action: {action}, Category: {cat_slug}, Group: {group_name}, Sub: {sub_name}")

    if not os.path.exists(DATA_FILE):
        print(f"Error: {DATA_FILE} not found")
        return

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Kategori bloğunu bul
    # 'akulu-aletler': { ... }
    pattern = rf"'{cat_slug}':\s*\{{(.*?)\n\s*\}},"
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print(f"Category {cat_slug} not found")
        return

    cat_body = match.group(1)
    
    # 2. subcategories dizisini bul
    sub_match = re.search(r"subcategories:\s*\[(.*?)\]", cat_body, re.DOTALL)
    if not sub_match:
        print(f"Categories {cat_slug} has no subcategories array")
        return
        
    sub_content = sub_match.group(1)
    # Parse subcategories into a simple structure
    # { name: '...', items: [...], icon: '...' }
    # Note: We'll use a simplified version because we'll regenerate the whole array
    
    items_matches = re.findall(r"\{\s*name:\s*'(.*?)',\s*items:\s*\[(.*?)\],\s*icon:\s*'(.*?)'\s*\}", sub_content, re.DOTALL)
    
    subcategories = []
    for name, items_str, icon in items_matches:
        items = [i.strip("' ") for i in items_str.split(",") if i.strip()]
        subcategories.append({"name": name, "items": items, "icon": icon})

    # 3. İşlemi gerçekleştir
    found_group = next((g for g in subcategories if g['name'] == group_name), None)

    if action == 'add':
        if not found_group:
            # Grup yoksa yeni grup oluştur
            subcategories.append({
                "name": group_name,
                "items": [sub_name] if sub_name else [],
                "icon": "fa-caret-right"
            })
        else:
            # Grup varsa ve sub_name verilmişse ekle
            if sub_name and sub_name not in found_group['items']:
                found_group['items'].append(sub_name)
    
    elif action == 'delete':
        if found_group:
            if not sub_name:
                # Alt kategori belirtilmemişse grubun tamamını sil
                subcategories.remove(found_group)
            else:
                # Alt kategoriyi sil
                if sub_name in found_group['items']:
                    found_group['items'].remove(sub_name)
                # Eğer grupta hiç eleman kalmadıysa grubu da silebiliriz (opsiyonel)
                # if not found_group['items']: subcategories.remove(found_group)

    # 4. Yeni içeriği oluştur
    new_sub_parts = []
    for g in subcategories:
        items_str = ", ".join([f"'{i}'" for i in g['items']])
        new_sub_parts.append(f"            {{ name: '{g['name']}', items: [{items_str}], icon: '{g['icon']}' }}")
    
    new_sub_content = ",\n".join(new_sub_parts)
    new_cat_body = cat_body.replace(sub_match.group(1), "\n" + new_sub_content + "\n        ")
    new_content = content.replace(cat_body, new_cat_body)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Successfully updated categories-data.js")

if __name__ == "__main__":
    main()
