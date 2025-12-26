
import os

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
MOBILE_CSS_PATH = os.path.join(ROOT_DIR, "mobile.css")
APPEND_CSS_PATH = os.path.join(ROOT_DIR, "mobile_css_append.css")
SCRIPT_TAG = '<script src="mobile-menu.js"></script>'
SUBDIR_SCRIPT_TAG = '<script src="../mobile-menu.js"></script>'

def update_mobile_css():
    try:
        with open(MOBILE_CSS_PATH, 'r', encoding='utf-8') as f:
            css_content = f.read().strip()
        
        with open(APPEND_CSS_PATH, 'r', encoding='utf-8') as f:
            append_content = f.read()
            
        # Check if already updated (basic check)
        if "body.mobile-menu-active" in css_content:
            print("mobile.css already contains the mobile menu styles.")
            return

        # Remove the last closing brace
        if css_content.endswith('}'):
            css_content = css_content[:-1]
        
        # Merge
        new_css_content = css_content + "\n" + append_content + "\n}"
        
        with open(MOBILE_CSS_PATH, 'w', encoding='utf-8') as f:
            f.write(new_css_content)
            
        print("Updated mobile.css")
        
    except Exception as e:
        print(f"Error updating mobile.css: {e}")

def inject_script(filepath, is_subdirectory=False):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        tag_to_add = SUBDIR_SCRIPT_TAG if is_subdirectory else SCRIPT_TAG
        
        if tag_to_add in content:
            print(f"Script already in {os.path.basename(filepath)}")
            return
            
        # Insert before </body>
        if "</body>" in content:
            new_content = content.replace("</body>", f"    {tag_to_add}\n</body>")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Injected script into {os.path.basename(filepath)}")
        else:
            print(f"Could not find </body> in {os.path.basename(filepath)}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    # 1. Update CSS
    update_mobile_css()
    
    # 2. Inject Script
    print("\nInjecting JS...")
    for filename in os.listdir(ROOT_DIR):
        if filename.endswith(".html"):
            inject_script(os.path.join(ROOT_DIR, filename), is_subdirectory=False)
            
    categories_dir = os.path.join(ROOT_DIR, "kategoriler")
    if os.path.exists(categories_dir):
        for filename in os.listdir(categories_dir):
            if filename.endswith(".html"):
                inject_script(os.path.join(categories_dir, filename), is_subdirectory=True)

if __name__ == "__main__":
    main()
