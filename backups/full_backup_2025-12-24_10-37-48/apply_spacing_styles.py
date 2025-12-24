
import os

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
MOBILE_CSS_PATH = os.path.join(ROOT_DIR, "mobile.css")
APPEND_CSS_PATH = os.path.join(ROOT_DIR, "mobile_spacing_append.css")

def update_mobile_css():
    try:
        with open(MOBILE_CSS_PATH, 'r', encoding='utf-8') as f:
            css_content = f.read().strip()
        
        with open(APPEND_CSS_PATH, 'r', encoding='utf-8') as f:
            append_content = f.read()
        
        # Remove the last closing brace
        if css_content.endswith('}'):
            css_content = css_content[:-1]
        
        # Merge
        new_css_content = css_content + "\n" + append_content + "\n}"
        
        with open(MOBILE_CSS_PATH, 'w', encoding='utf-8') as f:
            f.write(new_css_content)
            
        print("Updated mobile.css with spacing styles")
        
    except Exception as e:
        print(f"Error updating mobile.css: {e}")

if __name__ == "__main__":
    update_mobile_css()
