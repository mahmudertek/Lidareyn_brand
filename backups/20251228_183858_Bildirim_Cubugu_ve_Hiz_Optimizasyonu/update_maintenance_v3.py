import os
import re

def update_maintenance_tags():
    root_dir = os.getcwd()
    html_files = []
    
    # Root HTML files
    for f in os.listdir(root_dir):
        if f.endswith('.html') and f not in ['maintenance.html', 'bakimda.html', '404.html']:
            html_files.append(os.path.join(root_dir, f))
            
    # kategoriler HTML files
    kat_dir = os.path.join(root_dir, 'kategoriler')
    if os.path.exists(kat_dir):
        for f in os.listdir(kat_dir):
            if f.endswith('.html'):
                html_files.append(os.path.join(kat_dir, f))

    # Pattern to find any maintenance script and the blocking style
    pattern_tag = re.compile(r'<!-- Bakım Modu Sistemi .*? -->.*?<script src=".*?maintenance-check\.js.*?".*?></script>', re.DOTALL)
    pattern_style = re.compile(r'<style id="bakim-blocking-style">.*?</style>', re.DOTALL)
    
    # We will use relative paths
    for file_path in html_files:
        print(f"Updating {file_path}...")
        
        # Determine relative path to maintenance-check.js
        is_subfolder = 'kategoriler' in file_path
        script_src = '../maintenance-check.js?v=3.0' if is_subfolder else 'maintenance-check.js?v=3.0'
        
        new_tag = f'<!-- Bakım Modu Sistemi (Dinamik) -->\n    <script src="{script_src}"></script>'

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Remove old styles
        content = pattern_style.sub('', content)
        
        # 2. Check if tag exists, if so replace, if not inject
        if 'maintenance-check.js' in content:
            # Replace existing tag (complex regex might fail so using simpler string replace for safety)
            content = re.sub(r'<script src=".*?maintenance-check\.js.*?".*?></script>', f'<script src="{script_src}"></script>', content)
        else:
            # Inject after <head>
            content = content.replace('<head>', f'<head>\n    {new_tag}')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    update_maintenance_tags()
