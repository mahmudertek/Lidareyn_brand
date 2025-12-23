
import os
import re

# Bakım Modu Scripti (Root için)
BAKIM_SCRIPT = """    <!-- Bakım Modu Sistemi (En Tepede) -->
    <style id="bakim-blocking-style">html { display: none !important; }</style>
    <script src="bakim-ayari.js?v=4"></script>
    <script>
        (function () {
            const isAuthorized = localStorage.getItem('admin_session') ||
                localStorage.getItem('adminToken') ||
                localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const hasBypass = urlParams.has('lidareyn_ozel_girisKask12121O');

            if (hasBypass) {
                localStorage.setItem('admin_session', 'active_' + Date.now());
                window.location.href = window.location.pathname;
                return;
            }

            if (window.BAKIM_MODU_AKTIF === true && !isAuthorized) {
                window.location.href = 'bakimda.html';
                return;
            }

            document.getElementById('bakim-blocking-style').remove();
        })();
    </script>
"""

# Simplified Nav Section (Target to replace inside header)
# We want to find <nav class="main-nav">...</nav> and replace its <ul> content or the whole nav.
# But more specifically, the USER wants only "Yeni Gelenler" and "Popüler" links.

TARGET_NAV_UL = """                <ul class="nav-menu" role="menubar">
                    <li class="nav-item-dropdown" role="none">
                        <a href="index.html#kategoriler" class="nav-link categories-link" role="menuitem"
                            aria-haspopup="true" aria-expanded="false">
                            <i class="fa-solid fa-bars" aria-hidden="true"></i>
                            Tüm Kategoriler
                        </a>
                        <div class="mega-menu">
                            <!-- Mega menu content can stay as is or be simplified/standardized if needed -->
                        </div>
                    </li>
                    <li><a href="yeni-gelenler.html" class="nav-link">Yeni Gelenler</a></li>
                    <li><a href="populer.html" class="nav-link">Popüler</a></li>
                </ul>"""

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
EXCLUDE_FILES = ['index.html', 'bakimda.html', '404.html', 'maintenance.html']

for filename in os.listdir(ROOT_DIR):
    if not filename.endswith(".html") or filename in EXCLUDE_FILES or filename.startswith('test-'):
        continue

    filepath = os.path.join(ROOT_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Bakım Scriptini en tepeye ekle
        if 'bakim-blocking-style' not in content:
            new_content = content.replace('<head>', '<head>\n' + BAKIM_SCRIPT)
            print(f"Added maintenance script to {filename}")
        else:
            # Update existing
            pattern_bakim = re.compile(r'<!-- Bakım Modu Sistemi.*?\(function \(\) \{.*?\}\)\(\);.*?</script>', re.DOTALL)
            new_content = pattern_bakim.sub(BAKIM_SCRIPT.strip(), content)
            print(f"Updated maintenance script in {filename}")

        # 2. Nav Menu'yü temizle
        # Find the nav menu and only keep the desired links.
        # This is trickier because we want to preserve the mega menu if possible or use a standard one.
        # For simplicity, let's just remove "Tüm Markalar" and any direct category links.
        
        # Remove "Tüm Markalar" links
        new_content = re.sub(r'<li><a href="[^"]*flowing-menu-root"[^>]*>.*?</a></li>', '', new_content)
        
        # Consistent naming for "Popüler"
        new_content = new_content.replace('Popüler Ürünler</a>', 'Popüler</a>')

        # Also remove specific category links if they exists in root nav
        # Like Nalbur & Yapı, etc.
        # But we already did most of them manually. Let's do a regex for common ones.
        new_content = re.sub(r'<li><a href="kategoriler/[^"]+"[^>]*>.*?</a></li>', '', new_content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Root pages batch update completed.")
