
import os
import time

root_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
timestamp = int(time.time())

# Template for the maintenance block
# formatting placeholders: {rel_path_to_root}
maintenance_block_template = """
    <!-- Bakım Modu Sistemi (En Tepede) -->
    <style id="bakim-blocking-style">
        html {{
            display: none !important;
        }}
    </style>
    <script src="{rel_path_to_root}bakim-ayari.js?v={ts}"></script>
    <script>
        (function () {{
            // Bakım sayfası ise kontrol etme
            if (window.location.pathname.includes('bakimda.html')) return;

            const isAuthorized = localStorage.getItem('admin_session') ||
                localStorage.getItem('adminToken') ||
                localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const hasBypass = urlParams.has('lidareyn_ozel_girisKask12121O');

            if (hasBypass) {{
                localStorage.setItem('admin_session', 'active_' + Date.now());
                const cleanUrl = window.location.pathname; 
                window.history.replaceState(null, '', cleanUrl); // URL'i temizle
                document.getElementById('bakim-blocking-style').remove();
                return;
            }}

            if (window.BAKIM_MODU_AKTIF === true && !isAuthorized) {{
                window.location.href = '{rel_path_to_root}bakimda.html';
                return;
            }}

            // Eğer bakımda değilse veya yetkiliyse sayfayı göster
            const style = document.getElementById('bakim-blocking-style');
            if (style) style.remove();
            console.log('🔧 Bakım Modu: Erişim onaylandı.');
        }})();
    </script>
"""

def update_html_file(filepath):
    filename = os.path.basename(filepath)
    if filename == 'bakimda.html':
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    # Calculate relative path to root
    # e.g. c:\Users\pc\Desktop\Lidareyn_brand\index.html -> rel_path = ""
    # e.g. c:\Users\pc\Desktop\Lidareyn_brand\kategoriler\a.html -> rel_path = "../"
    
    rel_path = os.path.relpath(root_dir, os.path.dirname(filepath))
    if rel_path == '.':
        rel_path_str = ""
    else:
        rel_path_str = rel_path + "/"
        # Ensure forward slashes for URL
        rel_path_str = rel_path_str.replace("\\", "/")

    # Build the block
    new_block = maintenance_block_template.format(rel_path_to_root=rel_path_str, ts=timestamp)

    # Remove existing maintenance blocks (various versions might exist)
    # We'll look for start/end markers or just the script src="bakim-ayari.js"
    
    # Strategy: 
    # 1. Remove old block if exists (regex or simple find)
    # 2. Insert new block after <head>
    
    # Simple cleanup of previous known versions
    if 'bakim-ayari.js' in content:
        # Heuristic removal: remove from <!-- Bakım Modu Sistemi --> to end of script
        # This is risky with regex on full file. 
        # Better: Since we want it at the top of HEAD, we can try to strip old ones if they are identifiable.
        # But user says "some pages" have it. 
        # Let's try to remove lines containing 'bakim-ayari.js' and surrounding lines if possible.
        # For safety, let's just REPLACE existing <script src="...bakim-ayari.js..."></script> and associated style.
        pass

    # New Strategy: Read file lines, filter out old maintenance lines, insert new block after <head>
    lines = content.splitlines()
    new_lines = []
    in_head = False
    head_processed = False
    
    # Markers to identify old block lines to skip
    skip_markers = [
        'bakim-ayari.js', 
        'bakim-blocking-style', 
        'BAKIM_MODU_AKTIF', 
        'lidareyn_ozel_girisKask12121O',
        '<!-- Bakım Modu Sistemi'
    ]
    
    # We need a robust way to delete key block. 
    # Since the block is contiguous, we can detect start of block and skip until end of script.
    # But previous blocks might vary.
    # Simplest safe approach: Filter out any line that looks like part of the maintenance system.
    
    cleaned_lines = []
    for line in lines:
        if any(marker in line for marker in skip_markers):
            continue
        cleaned_lines.append(line)
        
    # Reassemble and inject
    cleaned_content = "\n".join(cleaned_lines)
    
    # Inject after <head>
    if '<head>' in cleaned_content:
        final_content = cleaned_content.replace('<head>', f'<head>{new_block}', 1)
    elif '<head ' in cleaned_content: # attributes
        # Find the closing > of <head ...>
        import re
        final_content = re.sub(r'(<head[^>]*>)', fr'\1{new_block}', cleaned_content, count=1)
    else:
        print(f"No <head> found in {filepath}")
        return

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print(f"Updated {filepath}")

for dirpath, dirnames, filenames in os.walk(root_dir):
    if 'node_modules' in dirnames: dirnames.remove('node_modules')
    if '.git' in dirnames: dirnames.remove('.git')
    for filename in filenames:
        if filename.endswith(".html"):
            update_html_file(os.path.join(dirpath, filename))
