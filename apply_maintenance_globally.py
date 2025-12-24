import os
import re

def apply_maintenance():
    # Root directory
    root_dir = os.getcwd()
    
    # Files to process
    html_files = []
    
    # 1. Root HTML files
    for f in os.listdir(root_dir):
        if f.endswith('.html') and f not in ['maintenance.html', 'bakimda.html', '404.html']:
            html_files.append(os.path.join(root_dir, f))
            
    # 2. kategoriler HTML files
    kat_dir = os.path.join(root_dir, 'kategoriler')
    if os.path.exists(kat_dir):
        for f in os.listdir(kat_dir):
            if f.endswith('.html'):
                html_files.append(os.path.join(kat_dir, f))

    maintenance_block = """    <!-- Bakım Modu Sistemi (Dinamik) -->
    <style id="bakim-blocking-style">html { display: none !important; }</style>
    <script src="/maintenance-check.js?v=Global_1.1"></script>"""

    # Old blocks to replace
    # We look for <style id="bakim-blocking-style">...</style> followed by some scripts
    
    pattern_style = re.compile(r'<style id="bakim-blocking-style">.*?</style>', re.DOTALL)
    pattern_script_old = re.compile(r'<script src=".*?bakim-ayari\.js.*?"></script>', re.DOTALL)
    pattern_anon_func = re.compile(r'<script>\s*\(function\s*\(\)\s*\{.*?\}\)\(\);\s*</script>', re.DOTALL | re.MULTILINE)

    for file_path in html_files:
        print(f"Processing {file_path}...")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Clean up old maintenance blocks
        new_content = pattern_style.sub('', content)
        new_content = pattern_script_old.sub('', new_content)
        
        # Remove the previous maintenance-check.js if it exists (to unify it)
        new_content = re.sub(r'<script src=".*?maintenance-check\.js.*?"></script>', '', new_content)

        # Remove the specific (function() { ... })() block if it contains maintenance logic
        # We'll be careful here to only remove it if it looks like maintenance logic
        if "BAKIM_MODU_AKTIF" in new_content or "bakimda.html" in new_content:
             new_content = pattern_anon_func.sub('', new_content)

        # Inject new block after <head> or <meta charset="UTF-8">
        if '<head>' in new_content:
            new_content = new_content.replace('<head>', f'<head>\n{maintenance_block}')
        elif '<meta charset="UTF-8">' in new_content:
            new_content = new_content.replace('<meta charset="UTF-8">', f'{maintenance_block}\n    <meta charset="UTF-8">')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

if __name__ == "__main__":
    apply_maintenance()
