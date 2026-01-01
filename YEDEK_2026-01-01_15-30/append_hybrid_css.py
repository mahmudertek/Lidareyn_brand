
import os

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
STYLE_CSS_PATH = os.path.join(ROOT_DIR, "style.css")
NEW_STYLES_PATH = os.path.join(ROOT_DIR, "hybrid_category_styles.css")

def append_styles():
    try:
        with open(STYLE_CSS_PATH, 'r', encoding='utf-8') as f:
            css_content = f.read()
        
        with open(NEW_STYLES_PATH, 'r', encoding='utf-8') as f:
            new_content = f.read()
            
        # Append
        with open(STYLE_CSS_PATH, 'a', encoding='utf-8') as f:
            f.write("\n\n" + new_content)
            
        print("Styles appended to style.css")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    append_styles()
