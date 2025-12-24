import re

# Read current index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define clean mega menu HTML with proper structure
clean_mega_menu = '''                            <ul class="mega-menu-list">
                                <li>
                                    <a href="kategoriler/elektrikli-el-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-plug"></i>
                                            <span>Elektrikli El Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Delme & Vidalama</h4>
                                            <ul>
                                                <li><a href="#">Akülü Vidalama</a></li>
                                                <li><a href="#">Darbeli Matkap</a></li>
                                                <li><a href="#">Kırıcı Delici</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kesme & Taşlama</h4>
                                            <ul>
                                                <li><a href="#">Avuç Taşlama</a></li>
                                                <li><a href="#">Dekupaj Testere</a></li>
                                                <li><a href="#">Daire Testere</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Zımpara & Polisaj</h4>
                                            <ul>
                                                <li><a href="#">Eksantrik Zımpara</a></li>
                                                <li><a href="#">Tank Zımpara</a></li>
                                                <li><a href="#">Polisaj Makinesi</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/olcme-ve-kontrol-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-ruler-combined"></i>
                                            <span>Ölçme & Kontrol Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Lazerli Ölçüm</h4>
                                            <ul>
                                                <li><a href="#">Lazerli Ölçüm Cihazları</a></li>
                                                <li><a href="#">Lazer Hizalamalar</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Mekanik Ölçüm</h4>
                                            <ul>
                                                <li><a href="#">Şerit Metreler</a></li>
                                                <li><a href="#">Kumpaslar</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/hirdavat-el-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-screwdriver-wrench"></i>
                                            <span>Hırdavat ve El Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Ölçü Aletleri</h4>
                                            <ul>
                                                <li><a href="#">Metre, Su Terazisi, Gönye</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kesici & Delici</h4>
                                            <ul>
                                                <li><a href="#">Testere, Matkap Uçları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/oto-bakim-tamir.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-wrench"></i>
                                            <span>Oto Bakım ve Tamir Malzemeleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Kaldırma ve Taşıma</h4>
                                            <ul>
                                                <li><a href="#">Kriko ve Sehpalar</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/nalbur-yapi-malzemeleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-trowel-bricks"></i>
                                            <span>Yapı ve İnşaat Malzemeleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Kimyasal & Yapıştırıcı</h4>
                                            <ul>
                                                <li><a href="#">Silikon, Mastik ve Köpükler</a></li>
                                                <li><a href="#">Yapıştırıcılar</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/asindirici-kesici.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-compact-disc"></i>
                                            <span>Aşındırıcı ve Kesici Uçlar</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Delici & Vidalama</h4>
                                            <ul>
                                                <li><a href="#">Matkap Uçları</a></li>
                                                <li><a href="#">Freze Uçları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
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
                                                <li><a href="#">Silikon, Mastik</a></li>
                                                <li><a href="#">Epoksi Yapıştırıcılar</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/kaynak-malzemeleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-fire-burner"></i>
                                            <span>Kaynak Malzemeleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Sarf Malzemeleri</h4>
                                            <ul>
                                                <li><a href="#">Elektrotlar</a></li>
                                                <li><a href="#">Kaynak Telleri</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/tesisat-malzemeleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-faucet-drip"></i>
                                            <span>Tesisat Malzemeleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Su Tesisatı</h4>
                                            <ul>
                                                <li><a href="#">Boru ve Ek Parçaları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kategoriler/is-guvenligi-ve-calisma-ekipmanlari.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-helmet-safety"></i>
                                            <span>İş Güvenliği ve Çalışma Ekipmanları</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Koruyucu Giyim</h4>
                                            <ul>
                                                <li><a href="#">İş Elbisesi, Eldiven</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>'''

# Pattern to find the mega-menu-list
pattern = r'<ul class="mega-menu-list">[\s\S]*?</ul>\s*(?=\s*</div>\s*</li>\s*<li><a href="#flowing-menu-root")'

new_content = re.sub(pattern, clean_mega_menu, content)

# If pattern didn't match, try a simpler approach
if new_content == content:
    # Find and replace the broken mega menu
    start_marker = '<ul class="mega-menu-list">'
    # Find the start
    start_idx = content.find(start_marker)
    if start_idx != -1:
        # Find the closing </div> for mega-menu
        end_marker = '</div>\n                    </li>\n                    <li><a href="#flowing-menu-root"'
        end_idx = content.find(end_marker, start_idx)
        if end_idx != -1:
            # Replace everything from start to end
            new_content = content[:start_idx] + clean_mega_menu + '\n                        ' + content[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Mega menu fixed with proper HTML structure.")
