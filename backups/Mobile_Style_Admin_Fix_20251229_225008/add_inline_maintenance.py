import os
import re

INLINE_SCRIPT = '''    <!-- BAKIM MODU KONTROLU (INLINE - V6) -->
    <script>
    (function(){
        if(location.pathname.includes('maintenance.html') || location.pathname.includes('/admin/')) return;
        if(localStorage.getItem('adminToken')) return;
        fetch('https://galatacarsi-backend-api.onrender.com/api/settings?t='+Date.now())
        .then(r=>r.json())
        .then(d=>{if(d.data&&d.data.isMaintenanceMode)location.href='/maintenance.html';})
        .catch(()=>{});
    })();
    </script>
'''

def add_inline_script():
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

    # Remove old maintenance script tags and add inline
    for file_path in html_files:
        print(f"Processing {file_path}...")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove old external script references
        content = re.sub(r'<!-- Bakım Modu Sistemi.*?-->\s*', '', content, flags=re.DOTALL)
        content = re.sub(r'<script src="[^"]*maintenance-check\.js[^"]*"></script>\s*', '', content)
        
        # Remove any existing inline maintenance script
        content = re.sub(r'<!-- BAKIM MODU KONTROLU.*?</script>\s*', '', content, flags=re.DOTALL)

        # Add inline script after <head>
        if '<head>' in content and INLINE_SCRIPT not in content:
            content = content.replace('<head>', '<head>\n' + INLINE_SCRIPT)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

if __name__ == "__main__":
    add_inline_script()
    print("Done!")
