
import os
import re

# Bakım Modu Scripti (En Tepede)
BAKIM_SCRIPT = """    <!-- Bakım Modu Sistemi (En Tepede) -->
    <style id="bakim-blocking-style">html { display: none !important; }</style>
    <script src="../bakim-ayari.js?v=4"></script>
    <script>
        (function () {
            const isAuthorized = localStorage.getItem('admin_session') ||
                localStorage.getItem('adminToken') ||
                localStorage.getItem('token');
            const urlParams = new URLSearchParams(window.location.search);
            const hasBypass = urlParams.has('lidareyn_ozel_girisKask12121O');

            if (hasBypass) {
                localStorage.setItem('admin_session', 'active_' + Date.now());
                // Alt klasörde olduğumuz için yönlendirme biraz farklı olabilir ama index.html'e parametresiz gitmek en iyisi
                window.location.href = '../index.html';
                return;
            }

            if (window.BAKIM_MODU_AKTIF === true && !isAuthorized) {
                window.location.href = '../bakimda.html';
                return;
            }

            document.getElementById('bakim-blocking-style').remove();
        })();
    </script>
"""

# Base header (same as root)
BASE_HEADER = """    <header class="main-header" role="banner">
        <div class="header-container">
            <!-- Mobile Categories Button -->
            <a href="index.html#kategoriler" class="mobile-categories-btn">
                <i class="fa-solid fa-bars"></i>
                <span class="mobile-cat-text">Tüm Kategoriler</span>
            </a>
            <!-- Navigation Menu (Left Side) -->
            <nav class="main-nav" role="navigation" aria-label="Ana navigasyon">
                <ul class="nav-menu" role="menubar">
                    <li class="nav-item-dropdown" role="none">
                        <a href="index.html#kategoriler" class="nav-link categories-link" role="menuitem"
                            aria-haspopup="true" aria-expanded="false">
                            <i class="fa-solid fa-bars" aria-hidden="true"></i>
                            Tüm Kategoriler
                        </a>
                        <div class="mega-menu">
                            <ul class="mega-menu-list">
                                <li class="default-active">
                                    <a href="kategoriler/elektrikli-el-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-plug"></i>
                                            <span>Elektrikli El Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="kategoriler/olcme-ve-kontrol-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-ruler-combined"></i>
                                            <span>Ölçme & Kontrol Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="kategoriler/hirdavat-el-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-screwdriver-wrench"></i>
                                            <span>El Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="kategoriler/yapi-kimyasallari.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-flask"></i>
                                            <span>Yapı Kimyasalları</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>
                    <li><a href="yeni-gelenler.html" class="nav-link">Yeni Gelenler</a></li>
                    <li><a href="populer.html" class="nav-link">Popüler</a></li>
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
                </div>
                <button class="icon-btn favorites-btn" aria-label="Favorilerim"
                    onclick="window.location.href='favoriler.html'">
                    <i class="fa-regular fa-heart"></i>
                </button>
                <button class="icon-btn cart-btn" aria-label="Sepetim" onclick="window.location.href='sepet.html'">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <span class="cart-count">0</span>
                </button>
            </div>

            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" aria-label="Menü">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>
    </header>"""

# Adjust links for subdirectory usage
CATEGORIES_HEADER = BASE_HEADER.replace('href="index.html', 'href="../index.html')
CATEGORIES_HEADER = CATEGORIES_HEADER.replace('href="kategoriler/', 'href="')
CATEGORIES_HEADER = CATEGORIES_HEADER.replace('href="yeni-gelenler.html"', 'href="../yeni-gelenler.html"')
CATEGORIES_HEADER = CATEGORIES_HEADER.replace('href="populer.html"', 'href="../populer.html"')
CATEGORIES_HEADER = CATEGORIES_HEADER.replace("window.location.href='favoriler.html'", "window.location.href='../favoriler.html'")
CATEGORIES_HEADER = CATEGORIES_HEADER.replace("window.location.href='sepet.html'", "window.location.href='../sepet.html'")

CATEGORIES_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

for filename in os.listdir(CATEGORIES_DIR):
    if not filename.endswith(".html"):
        continue

    filepath = os.path.join(CATEGORIES_DIR, filename)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Bakım Scriptini en tepeye ekle (eğer yoksa)
        if 'bakim-blocking-style' not in content:
            new_content = content.replace('<head>', '<head>\n' + BAKIM_SCRIPT)
        else:
            # Varsa güncelle
            pattern_bakim = re.compile(r'<!-- Bakım Modu Sistemi.*?\(function \(\) \{.*?\}\)\(\);.*?</script>', re.DOTALL)
            new_content = pattern_bakim.sub(BAKIM_SCRIPT.strip(), content)
            print(f"Bakım script updated in {filename}")

        # 2. Header'ı Değiştir
        pattern_header = re.compile(r'<header class="main-header".*?>.*?</header>', re.DOTALL)
        if pattern_header.search(new_content):
            new_content = pattern_header.sub(CATEGORIES_HEADER, new_content)
            print(f"Header replaced in {filename}")
        else:
            print(f"WARNING: Header not found in {filename}")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

    except Exception as e:
        print(f"Error processing {filename}: {e}")

print("Batch update completed.")
