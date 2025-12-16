
import os
import re

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
INDEX_FILE = os.path.join(ROOT_DIR, "index.html")

def get_master_header():
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract header content
    match = re.search(r'(<header class="main-header" role="banner">.*?</header>)', content, re.DOTALL)
    if match:
        return match.group(1)
    else:
        raise Exception("Could not find header in index.html")

def update_file_header(filepath, new_header_content, is_subdirectory=False):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Determine strict replacement content
        header_to_write = new_header_content

        if is_subdirectory:
            # Adjust links for subdirectory
            # 1. Remove 'kategoriler/' prefix from links since we are inside it
            header_to_write = header_to_write.replace('href="kategoriler/', 'href="')
            
            # 2. Add '../' to root filenames
            root_files = [
                "index.html", "arama.html", "yeni-gelenler.html", 
                "populer.html", "favoriler.html", "sepet.html", 
                "giris-yap.html", "urun-detay.html", "profil.html"
            ]
            for rf in root_files:
                # careful not to double replace if we have complex lookups, but simple replace "rf" -> "../rf" works 
                # if we ensure we match the quote to avoid partial matches on filenames
                header_to_write = header_to_write.replace(f'href="{rf}"', f'href="../{rf}"')
                header_to_write = header_to_write.replace(f'href="{rf}', f'href="../{rf}') # catch cases with params
            
            # 3. Fix hash links for index (e.g. index.html#kategoriler)
            # The loop above handles 'href="index.html' -> 'href="../index.html' so 'index.html#foo' becomes '../index.html#foo' automatically
            
        # Replace the existing header in the target file
        # Using a regex that is flexible about whitespace in the tag attributes
        updated_content = re.sub(r'<header class="main-header".*?</header>', header_to_write, content, flags=re.DOTALL)
        
        # If no replacement happened (maybe different attributes?), try a simpler tag match
        if updated_content == content:
             updated_content = re.sub(r'<header.*?</header>', header_to_write, content, flags=re.DOTALL)

        if updated_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"Updated: {os.path.basename(filepath)}")
        else:
            print(f"No changes needed or header not found: {os.path.basename(filepath)}")

    except Exception as e:
        print(f"Error updating {filepath}: {e}")

def main():
    print("Extracting master header from index.html...")
    master_header = get_master_header()
    
    # Update Root Files
    print("\nUpdating Root Files...")
    for filename in os.listdir(ROOT_DIR):
        if filename.endswith(".html") and filename != "index.html":
            update_file_header(os.path.join(ROOT_DIR, filename), master_header, is_subdirectory=False)

    # Update Category Files
    categories_dir = os.path.join(ROOT_DIR, "kategoriler")
    if os.path.exists(categories_dir):
        print("\nUpdating Category Files...")
        for filename in os.listdir(categories_dir):
            if filename.endswith(".html"):
                update_file_header(os.path.join(categories_dir, filename), master_header, is_subdirectory=True)

if __name__ == "__main__":
    main()
