
import os
import re
import time

root_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
new_version = str(int(time.time())) # Current timestamp as version

def bump_versions(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return

    # Regex to find .css?v=...
    # We replace ?v=... with ?v=TIMESTAMP
    
    # Pattern: .css?v=123" or .css"
    # match .css followed by optional ?v=digits then a quote
    
    # 1. Replace existing versions: href="style.css?v=5" -> href="style.css?v=17123..."
    content = re.sub(r'(\.css\?v=)[0-9]+', fr'\g<1>{new_version}', content)
    
    # 2. Add version if missing: href="style.css" -> href="style.css?v=17123..."
    # This is trickier to not double add, so we iterate specific files known to be problematic
    css_files = ['style.css', 'mobile.css', 'category-accordion.css', 'category-brands-dropdown.css', 'mega_menu_styles.css']
    
    for css in css_files:
        # If it has .css" (no version), add it
        # We use a negative lookbehind/lookahead or just simple replacement if not already versioned
        # easier: specific replace
        pattern = f'href="../{css}"'
        replacement = f'href="../{css}?v={new_version}"'
        content = content.replace(pattern, replacement)
        
        pattern_root = f'href="{css}"'
        replacement_root = f'href="{css}?v={new_version}"'
        content = content.replace(pattern_root, replacement_root)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Bumped version in {filepath}")

for dirpath, dirnames, filenames in os.walk(root_dir):
    if 'node_modules' in dirnames: dirnames.remove('node_modules')
    if '.git' in dirnames: dirnames.remove('.git')
    for filename in filenames:
        if filename.endswith(".html"):
            bump_versions(os.path.join(dirpath, filename))
