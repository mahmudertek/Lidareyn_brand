import os
import re

# Correct header HTML from index.html
CORRECT_HEADER = '''    <!-- Modern Premium Header (Solid White) -->
    <header class="main-header" role="banner">
        <div class="header-container">
            <!-- Navigation Menu (Left Side) -->
            <nav class="main-nav" role="navigation" aria-label="Ana navigasyon">
                <ul class="nav-menu" role="menubar">
                    <li class="nav-item-dropdown" role="none">
                        <a href="index.html#kategoriler" class="nav-link categories-link" role="menuitem"
                            aria-haspopup="true" aria-expanded="false">
                            <i class="fa-solid fa-bars" aria-hidden="true"></i>
                            Tüm Kategoriler
                        </a>
                    </li>
                    <li><a href="index.html#flowing-menu-root" class="nav-link">Tüm Markalar</a></li>
                    <li><a href="yeni-gelenler.html" class="nav-link">Yeni Gelenler</a></li>
                    <li><a href="populer.html" class="nav-link">Popüler Ürünler</a></li>
                </ul>
            </nav>

            <!-- Logo (Centered) -->
            <div class="logo">
                <a href="index.html">Galata Çarşı</a>
            </div>

            <!-- Header Icons (Right Side) -->
            <div class="header-icons">
                <div class="search-container" role="search">
                    <input type="text" id="header-search-input" class="search-input" placeholder="Ürün ara..."
                        aria-label="Ürün arama" autocomplete="off">
                    <button class="icon-btn search-btn" aria-label="Arama yap" type="button"><i
                            class="fa-solid fa-magnifying-glass" aria-hidden="true"></i></button>
                </div>
                <div class="user-menu-container">
                    <button class="icon-btn user-btn" aria-label="Hesabım">
                        <i class="fa-regular fa-user"></i>
                        <span class="icon-label" id="user-label">Giriş Yap</span>
                    </button>
                    <!-- User Dropdown -->
                    <div class="user-dropdown">
                        <a href="giris-yap.html" class="dropdown-item"><i class="fa-solid fa-right-to-bracket"></i>
                            Giriş Yap</a>
                        <a href="giris-yap.html?tab=register" class="dropdown-item"><i
                                class="fa-solid fa-user-plus"></i> Üye Ol</a>
                    </div>
                </div>
                <button class="icon-btn favorites-btn" aria-label="Favorilerim"
                    onclick="window.location.href='favoriler.html'">
                    <i class="fa-regular fa-heart"></i>
                    <span class="icon-label">Favorilerim</span>
                </button>
                <button class="icon-btn cart-btn" aria-label="Sepetim" onclick="window.location.href='sepet.html'">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="cart-count">0</span>
                    <span class="icon-label">Sepetim</span>
                </button>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" aria-label="Menü">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>
    </header>'''

# List of main HTML pages to update
pages_to_update = [
    'populer.html',
    'yeni-gelenler.html',
    'favoriler.html',
    'sepet.html',
    'profil.html',
    'markalar.html',
    'arama.html',
    'odeme.html',
    'giris-yap.html',
    'hakkimizda.html',
    'iletisim.html',
    'kvkk.html',
    'gizlilik-guvenlik.html',
    'mesafeli-satis-sozlesmesi.html',
    'iade-iptal.html',
    'siparis-takip.html',
    'siparis-detay.html',
    'urun-detay.html',
    'tum-siparislerim.html',
    'cok-satanlar.html',
    'sifremi-unuttum.html',
    'siparis-basarili.html'
]

updated_count = 0
skipped_count = 0

for page in pages_to_update:
    file_path = page
    if not os.path.exists(file_path):
        print(f"SKIP: {page} not found")
        skipped_count += 1
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if header exists
    if '<header' not in content:
        print(f"SKIP: {page} has no header tag")
        skipped_count += 1
        continue
    
    # Find and replace header
    # Pattern to match the entire header block
    pattern = r'<header[^>]*class="main-header"[^>]*>[\s\S]*?</header>'
    
    if re.search(pattern, content):
        new_content = re.sub(pattern, CORRECT_HEADER, content)
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"UPDATED: {page}")
            updated_count += 1
        else:
            print(f"NO CHANGE: {page}")
    else:
        # Try simpler pattern
        pattern2 = r'<header[\s\S]*?</header>'
        if re.search(pattern2, content):
            new_content = re.sub(pattern2, CORRECT_HEADER, content, count=1)
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"UPDATED (alt): {page}")
                updated_count += 1
            else:
                print(f"NO CHANGE: {page}")
        else:
            print(f"SKIP: {page} header pattern not matched")
            skipped_count += 1

print(f"\n=== SUMMARY ===")
print(f"Updated: {updated_count} pages")
print(f"Skipped: {skipped_count} pages")
