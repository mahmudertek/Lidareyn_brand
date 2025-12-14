import os
import glob
import re

def fix_oto_page():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler\oto-bakim-tamir.html'
    if not os.path.exists(path):
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if section is closed
    if '</section>' not in content.split('<section class="subcategories-section">')[1]:
        print(f"Fixing missing </section> in {path}")
        # Insert before Sidebar Overlay or after container div
        # We know the pattern from viewing: </div>\s*</div>\s*<!-- Sidebar Overlay -->
        # We want: </div>\n</div>\n</section>\n<!-- Sidebar Overlay -->
        
        # Regex to match the end of the grid/container before sidebar overlay
        # Pattern: (</div>\s*</div>)(\s*<!-- Sidebar Overlay -->)
        pattern = re.compile(r'(</div>\s*</div>)(\s*<!-- Sidebar Overlay -->)')
        if pattern.search(content):
            content = pattern.sub(r'\1\n    </section>\2', content)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
        else:
            print("  Could not find insertion point via regex.")

def scan_for_issues():
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
    files = glob.glob(os.path.join(base_dir, '*.html')) + glob.glob(os.path.join(base_dir, 'kategoriler', '*.html'))
    
    for file_path in files:
        if 'backups' in file_path or 'admin' in file_path:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Check for garbage text specific signatures
        if 'ml....html' in content:
            print(f"SUSPICIOUS: 'ml....html' found in {os.path.basename(file_path)}")
            
        # Check for broken tags in navigation
        # Look for text between </li> and <li> inside main-nav? Hard to parse with regex.
        
        # Check for multiple mega menus
        count = content.count('class="mega-menu"')
        if count > 1:
            print(f"ISSUE: Multiple mega-menu classes found in {os.path.basename(file_path)} ({count})")
            
        # Check header structure
        if 'class="main-header"' in content:
            # Check if "Tüm Kategoriler" text appears twice nearby?
            pass

if __name__ == '__main__':
    fix_oto_page()
    scan_for_issues()
