import os

base64_file_path = r"c:\Users\pc\Desktop\Lidareyn_brand\bebek_base64.txt"
index_file_path = r"c:\Users\pc\Desktop\Lidareyn_brand\index.html"
categories_data_path = r"c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js"

try:
    with open(base64_file_path, "r") as f:
        base64_string = f.read().strip()

    # Update index.html
    with open(index_file_path, "r", encoding="utf-8") as f:
        index_content = f.read()
    
    new_index_content = index_content.replace("'gorseller/bebek_v2.jpg'", f"'{base64_string}'")
    # Also replace possibly older version just in case
    new_index_content = new_index_content.replace("'gorseller/bebek_nursery.jpg'", f"'{base64_string}'")

    with open(index_file_path, "w", encoding="utf-8") as f:
        f.write(new_index_content)
    print(f"Updated {index_file_path}")

    # Update categories-data.js
    with open(categories_data_path, "r", encoding="utf-8") as f:
        categories_content = f.read()

    new_categories_content = categories_content.replace("'gorseller/bebek_v2.jpg'", f"'{base64_string}'")
    # Also replace possibly older version just in case
    new_categories_content = new_categories_content.replace("'gorseller/bebek_nursery.jpg'", f"'{base64_string}'")

    with open(categories_data_path, "w", encoding="utf-8") as f:
        f.write(new_categories_content)
    print(f"Updated {categories_data_path}")

except Exception as e:
    print(f"Error: {e}")
