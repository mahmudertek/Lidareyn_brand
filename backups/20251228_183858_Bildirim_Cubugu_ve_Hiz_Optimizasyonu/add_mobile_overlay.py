
import os

base_dir = r"c:\Users\pc\Desktop\Lidareyn_brand"
html_files = [
    'kategoriler/is-guvenligi-ve-calisma-ekipmanlari.html',
    'kategoriler/kaynak-malzemeleri.html',
    'kategoriler/yapi-kimyasallari.html',
    'kategoriler/nalbur-yapi-malzemeleri.html',
    'kategoriler/elektrikli-el-aletleri.html',
    'kategoriler/olcme-ve-kontrol-aletleri.html',
    'kategoriler/el-aletleri.html',
    'kategoriler/hirdavat-el-aletleri.html',
    'kategoriler/asindirici-kesici.html'
]

overlay_code = """
    <!-- Mobile Search Overlay -->
    <div id="mobile-search-overlay" class="mobile-search-overlay">
        <div class="mobile-search-content">
            <form action="../arama.html" method="GET" class="mobile-search-form">
                <input type="text" name="q" class="mobile-search-input" placeholder="Ürün, kategori veya marka ara..." autocomplete="off">
                <button type="submit" class="mobile-search-submit">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </button>
            </form>
            <button class="close-search-btn" aria-label="Kapat">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="mobile-search-results"></div>
        </div>
    </div>
    
    <script src="../mobile-menu.js"></script>
</body>
"""

for rel_path in html_files:
    file_path = os.path.join(base_dir, rel_path)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'mobile-search-overlay' in content:
            print(f"Skipping {rel_path}, overlay already exists.")
            continue
            
        # Replace </body> with overlay + script + </body>
        if '</body>' in content:
            new_content = content.replace('</body>', overlay_code)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {rel_path}")
        else:
            print(f"Error: </body> tag not found in {rel_path}")
    else:
        print(f"Error: File not found {rel_path}")
