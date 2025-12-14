import os
import glob
import re

def fix_oto_page():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler\oto-bakim-tamir.html'
    if not os.path.exists(path):
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix missing </section>
    # Find the end of subcategories-grid
    # It ends with </div>\n        </div>\n then empty line then <!-- Sidebar Overlay -->
    # We want to insert </section> before Sidebar Overlay
    
    if '</section>' not in content and 'subcategories-section' in content:
        print("Fixing missing </section> in oto-bakim-tamir.html")
        parts = content.split('<!-- Sidebar Overlay -->')
        if len(parts) > 1:
            pre = parts[0]
            post = parts[1]
            # Ensure we close the section properly
            # Check if container and grid div are closed.
            # We see: </div>\n        </div>\n     \n
            # So just append </section>
            new_content = pre + '    </section>\n\n    <!-- Sidebar Overlay -->' + post
            
            # Now add Footer if missing
            if '<footer class="main-footer">' not in new_content:
                print("Adding footer to oto-bakim-tamir.html")
                footer_html = '''
    <!-- Footer -->
    <footer class="main-footer">
        <div class="footer-container">
            <!-- Main Footer Grid (All Columns in Gray Box) -->
            <div class="footer-grid-wrapper">
                <div class="footer-grid">
                    <!-- Kurumsal Column -->
                    <div class="footer-column">
                        <h3 class="footer-title">Kurumsal</h3>
                        <ul class="footer-links">
                            <li><a href="../siparis-takip.html">Sipariş Takip</a></li>
                            <li><a href="../iletisim.html">İletişim</a></li>
                            <li><a href="../kvkk.html">KVKK / Gizlilik Politikası</a></li>
                            <li><a href="../mesafeli-satis.html">Mesafeli Satış Sözleşmesi</a></li>
                            <li><a href="../iade-degisim.html">İade & Değişim Koşulları</a></li>
                            <li><a href="../kargo-teslimat.html">Kargo & Teslimat</a></li>
                        </ul>
                    </div>

                    <!-- Sözleşmeler Column -->
                    <div class="footer-column">
                        <h3 class="footer-title">Sözleşmeler</h3>
                        <ul class="footer-links">
                            <li><a href="../mesafeli-satis-sozlesmesi.html">Mesafeli Satış Sözleşmesi</a></li>
                            <li><a href="../gizlilik-guvenlik.html">Gizlilik ve Güvenlik</a></li>
                            <li><a href="../odeme-teslimat.html">Ödeme ve Teslimat</a></li>
                            <li><a href="../garanti-sartlari.html">Garanti Şartları</a></li>
                            <li><a href="../iade-iptal.html">İade ve İptal Şartları</a></li>
                            <li><a href="../havale-bildirim.html">Havale Bildirim Formu</a></li>
                        </ul>
                    </div>

                    <!-- Yardım Column -->
                    <div class="footer-column">
                        <h3 class="footer-title">Yardım</h3>
                        <ul class="footer-links">
                            <li><a href="../siparis-takibi.html">Sipariş Takibi</a></li>
                            <li><a href="../yeni-uyelik.html">Yeni Üyelik</a></li>
                            <li><a href="../uye-giris.html">Üye Giriş</a></li>
                            <li><a href="../sifremi-unuttum.html">Şifremi Unuttum</a></li>
                            <li><a href="../sss.html">Sıkça Sorulan Sorular</a></li>
                            <li><a href="../sepet.html">Sepetiniz</a></li>
                        </ul>
                    </div>

                    <!-- Müşteri Hizmetleri Column -->
                    <div class="footer-column">
                        <h3 class="footer-title">Müşteri Hizmetleri</h3>
                        <ul class="footer-links">
                            <li>
                                <i class="fa-solid fa-envelope"></i>
                                <a href="mailto:destek@karakoytuccari.com">destek@karakoytuccari.com</a>
                            </li>
                            <li>
                                <i class="fa-brands fa-whatsapp"></i>
                                <a href="https://wa.me/905551234567">+90 555 123 45 67</a>
                            </li>
                            <li>
                                <i class="fa-solid fa-phone"></i>
                                <a href="tel:+905551234567">+90 555 123 45 67</a>
                            </li>
                            <li class="working-hours">
                                <i class="fa-solid fa-clock"></i>
                                <span>Çalışma Saatleri: Hafta içi 09:00 - 18:00</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Güvenli Ödeme Column -->
                    <div class="footer-column">
                        <h3 class="footer-title">Güvenli Ödeme</h3>
                        <div class="payment-logos">
                            <div class="payment-logo">
                                <i class="fa-brands fa-cc-visa"></i>
                                <span>Visa</span>
                            </div>
                            <div class="payment-logo">
                                <i class="fa-brands fa-cc-mastercard"></i>
                                <span>Mastercard</span>
                            </div>
                            <div class="payment-logo">
                                <i class="fa-solid fa-credit-card"></i>
                                <span>Troy</span>
                            </div>
                            <div class="payment-logo">
                                <i class="fa-brands fa-cc-amex"></i>
                                <span>Amex</span>
                            </div>
                        </div>
                        <p class="payment-note">Tüm ödemeleriniz SSL sertifikası ile güvence altındadır.</p>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div style="text-align: center; color: #666; padding-top: 20px;">
                    &copy; 2024 Karaköy Tüccarı. Tüm hakları saklıdır.
                </div>
            </div>
        </div>
    </footer>
'''
                # Replace scripts at end logic check?
                # The file ends with scripts. Insert footer before scripts?
                # current structure: ...Overlay--> ... Sidebars ... <script src="../script.js"></script>
                # Insert footer before <script src="../script.js">
                
                script_pattern = re.compile(r'(<script src="\.\./script\.js"></script>)')
                if script_pattern.search(new_content):
                    new_content = script_pattern.sub(footer_html + '\n\n    \\1', new_content)
                else:
                    # Append before body end?
                    new_content = new_content.replace('</body>', footer_html + '\n</body>')
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)

def update_categories_data():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'yapi-kimyasallari' in content:
        print("yapi-kimyasallari already in categories-data.js")
        return

    # Prepare new category block
    new_block = """    'yapi-kimyasallari': {
        title: 'Yapıştırıcı, Dolgu ve Kimyasallar',
        description: 'İnşaat ve tamirat işleriniz için profesyonel yapı kimyasalları.',
        icon: 'fa-flask',
        image: 'gorseller/mega_menu_yapi_market.png', // Placeholder
        subcategories: [
            { name: 'Yapıştırıcılar', items: ['Silikon, Mastik ve Akrilikler', 'Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)', 'Poliüretan Köpükler'], icon: 'fa-glue' }, // fa-glue doesn't exist, use fa-flask or similar? fa-droplet works. Let's use fa-fill-drip
            { name: 'Dolgu ve Harçlar', items: ['Çimento Esaslı Harçlar', 'Alçı ve Alçı Ürünleri', 'Derz Dolgular'], icon: 'fa-trowel' },
            { name: 'Kimyasallar', items: ['Tiner ve Çözücüler'], icon: 'fa-bottle-droplet' }
        ]
    },
"""
    # Insert before the closing brace of categoriesData
    # Find the last entry closing '},' and insertion point
    # Look for 'otomobil-motosiklet': { ... }
    # Insert after it.
    
    pattern = re.compile(r"(    'otomobil-motosiklet': \{.*?\n    \})\n", re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(r"\1,\n" + new_block, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated categories-data.js")
    else:
        print("Could not find insertion point in categories-data.js")

def update_index_html_mega_menu():
    path = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Prepare HTML LI block
    new_li = """                                <li>
                                    <a href="kategoriler/yapi-kimyasallari.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-flask"></i>
                                            <span>Yapıştırıcı, Dolgu ve Kimyasallar</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Yapıştırıcılar</h4>
                                            <ul>
                                                <li><a href="#">Silikon, Mastik ve Akrilikler</a></li>
                                                <li><a href="#">Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)</a></li>
                                                <li><a href="#">Poliüretan Köpükler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Dolgu ve Harçlar</h4>
                                            <ul>
                                                <li><a href="#">Çimento Esaslı Harçlar</a></li>
                                                <li><a href="#">Alçı ve Alçı Ürünleri</a></li>
                                                <li><a href="#">Derz Dolgular</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kimyasallar</h4>
                                            <ul>
                                                <li><a href="#">Tiner ve Çözücüler</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
"""
    # Insert after otomobil-motosiklet li block
    # Pattern: <a href="#"> ... <span>Otomobil & Motosiklet</span> ... </li>
    
    # We can match the closing </li> of Otomobil & Motosiklet
    # It seems to be the last one in the list.
    
    # Search for text "Otomobil & Motosiklet"
    # Find the PARENT li closing.
    # regex: (<li[^>]*>.*?<span>Otomobil & Motosiklet</span>.*?</li>)
    
    pattern = re.compile(r'(<li[^>]*>\s*<a href="#">\s*<div class="menu-item-left">\s*<i class="fa-solid fa-car"></i>\s*<span>Otomobil & Motosiklet</span>.*?</li>)', re.DOTALL)
    
    if pattern.search(content):
        print("Found Otomobil LI, inserting new category after it.")
        content = pattern.sub(r'\1\n' + new_li, content)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    else:
        print("Could not find Otomobil LI in index.html")
        return False

def sync_mega_menu():
    path_index = r'c:\Users\pc\Desktop\Lidareyn_brand\index.html'
    with open(path_index, 'r', encoding='utf-8') as f:
        source_content = f.read()
    
    mega_menu_match = re.search(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', source_content, re.DOTALL)
    
    if not mega_menu_match:
        print("Could not extract Mega Menu from index.html")
        return
        
    mega_menu_block = mega_menu_match.group(1)
    
    # List all HTML files
    base_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
    files = glob.glob(os.path.join(base_dir, '*.html')) + glob.glob(os.path.join(base_dir, 'kategoriler', '*.html'))
    
    count = 0
    for file_path in files:
        if os.path.abspath(file_path) == os.path.abspath(path_index):
            continue
        if 'backups' in file_path or 'admin' in file_path:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Target existing mega menu block to replace
        # We look for <li class="nav-item-dropdown" ... > ... </li>
        # This regex must be robust enough to match the MULTI-LINE massive block we inserted.
        
        target_pattern = re.compile(r'(<li[^>]*class=["\']nav-item-dropdown["\'][^>]*>.*?Tüm Kategoriler.*?<div class=["\']mega-menu["\']>.*?</ul>\s*</div>\s*</li>)', re.DOTALL)
        
        if target_pattern.search(content):
            # Prepare block
            block_to_insert = mega_menu_block
            
            is_subdir = 'kategoriler' in os.path.dirname(os.path.abspath(file_path))
            if is_subdir:
                # Fix paths
                # href="kategoriler/X" -> href="X"
                block_to_insert = block_to_insert.replace('href="kategoriler/', 'href="')
                # href="index.html" -> href="../index.html"
                block_to_insert = block_to_insert.replace('"index.html', '"../index.html')
                # Also fix image paths if any?
                # Images are usually ./assets/ or gorseller/
                # index.html has gorseller/... . subdir needs ../gorseller/
                block_to_insert = block_to_insert.replace('"gorseller/', '"../gorseller/')
                block_to_insert = block_to_insert.replace('"assets/', '"../assets/')
                
            new_content = target_pattern.sub(block_to_insert, content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
    
    print(f"Synced Mega Menu to {count} files.")

if __name__ == '__main__':
    fix_oto_page()
    update_categories_data()
    if update_index_html_mega_menu():
        sync_mega_menu()
