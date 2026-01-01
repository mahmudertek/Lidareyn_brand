# -*- coding: utf-8 -*-
"""
Tüm kategori sayfalarındaki mega menüleri index.html'deki güncel 
mega menü ile senkronize eder.
"""
import os
import re

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
KATEGORILER_DIR = os.path.join(ROOT_DIR, "kategoriler")

# Güncel mega menü HTML'i (kategoriler/ klasöründen kullanılacak formatı)
UPDATED_MEGA_MENU = '''<div class="mega-menu">
                            <ul class="mega-menu-list">
                                <li>
                                    <a href="akulu-aletler.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-battery-full"></i>
                                            <span>Akülü Aletler</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Akülü Matkap &amp; Vidalama</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Akülü Matkap">Akülü Matkap</a></li>
                                                <li><a href="../arama.html?q=Akülü Vidalama">Akülü Vidalama</a></li>
                                                <li><a href="../arama.html?q=Akülü Darbeli Matkap">Akülü Darbeli Matkap</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Akülü Kesme &amp; Taşlama</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Akülü Avuç Taşlama">Akülü Avuç Taşlama</a></li>
                                                <li><a href="../arama.html?q=Akülü Testere">Akülü Testere</a></li>
                                                <li><a href="../arama.html?q=Akülü Dekupaj">Akülü Dekupaj</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Batarya &amp; Şarj Cihazları</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Lityum Batarya">Lityum Batarya</a></li>
                                                <li><a href="../arama.html?q=Hızlı Şarj Cihazı">Hızlı Şarj Cihazı</a></li>
                                                <li><a href="../arama.html?q=Çoklu Şarj İstasyonu">Çoklu Şarj İstasyonu</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="jeneratorler.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-bolt"></i>
                                            <span>Jeneratörler</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Benzinli Jeneratörler</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Taşınabilir Jeneratör">Taşınabilir Jeneratör</a></li>
                                                <li><a href="../arama.html?q=Ev Tipi Jeneratör">Ev Tipi Jeneratör</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>İnverter Jeneratörler</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Sessiz İnverter">Sessiz İnverter</a></li>
                                                <li><a href="../arama.html?q=Çift Yakıtlı İnverter">Çift Yakıtlı İnverter</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Endüstriyel Jeneratörler</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Dizel Jeneratör">Dizel Jeneratör</a></li>
                                                <li><a href="../arama.html?q=Yüksek Güç Jeneratör">Yüksek Güç Jeneratör</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="hobi-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                                            <span>Hobi Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Elektrikli Hobi Aletleri</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Mini Taşlama Dremel">Mini Taşlama (Dremel)</a></li>
                                                <li><a href="../arama.html?q=Elektrikli Gravür">Elektrikli Gravür</a></li>
                                                <li><a href="../arama.html?q=Mini Zımpara">Mini Zımpara</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Akülü Hobi Aletleri</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Akülü Mini Matkap">Akülü Mini Matkap</a></li>
                                                <li><a href="../arama.html?q=Şarjlı Tornavida">Şarjlı Tornavida</a></li>
                                                <li><a href="../arama.html?q=Mini Testere">Mini Testere</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Hobi Aksesuarları</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Gravür Uçları">Gravür Uçları</a></li>
                                                <li><a href="../arama.html?q=Kesme Diskleri">Kesme Diskleri</a></li>
                                                <li><a href="../arama.html?q=Parlatma Uçları">Parlatma Uçları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="aksesuarlar.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-gears"></i>
                                            <span>Aksesuarlar</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Testere Uçları</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Elmas Testereler">Elmas Testereler</a></li>
                                                <li><a href="../arama.html?q=Dairesel Testere Uçları">Dairesel Testere Uçları</a></li>
                                                <li><a href="../arama.html?q=Dekupaj Testere Uçları">Dekupaj Testere Uçları</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Delik Delme</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Delik Testerleri">Delik Testerleri</a></li>
                                                <li><a href="../arama.html?q=Karot Uçları">Karot Uçları</a></li>
                                                <li><a href="../arama.html?q=Panç Uçları">Panç Uçları</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Matkap &amp; Vidalama Uçları</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Metal Matkap Uçları">Metal Matkap Uçları</a></li>
                                                <li><a href="../arama.html?q=Beton Matkap Uçları">Beton Matkap Uçları</a></li>
                                                <li><a href="../arama.html?q=Vidalama Uçları Seti">Vidalama Uçları Seti</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="elektrikli-el-aletleri.html">
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
                                                <li><a href="../arama.html?q=Matkaplar">Matkaplar (Darbeli, Darbesiz)</a></li>
                                                <li><a href="../arama.html?q=Vidalayıcılar">Vidalayıcılar (Akülü, Elektrikli)</a></li>
                                                <li><a href="../arama.html?q=Kırıcı-Deliciler">Kırıcı-Deliciler (SDS Max, SDS Plus)</a></li>
                                                <li><a href="../arama.html?q=Karot Makineleri">Karot Makineleri</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kesme & Taşlama</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Avuç Taşlama">Taşlama ve Kesme Makineleri</a></li>
                                                <li><a href="../arama.html?q=Dekupaj Testereler">Dekupaj Testereler</a></li>
                                                <li><a href="../arama.html?q=Daire Testereler">Daire Testereler</a></li>
                                                <li><a href="../arama.html?q=Gönye Kesmeler">Gönye Kesmeler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Yüzey İşleme</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Zımparalar">Zımparalar</a></li>
                                                <li><a href="../arama.html?q=Planyalar">Planyalar</a></li>
                                                <li><a href="../arama.html?q=Frezeler">Frezeler</a></li>
                                                <li><a href="../arama.html?q=Sıcak Hava Tabancaları">Sıcak Hava Tabancaları</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Diğer Makineler</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Kaynak Makineleri">Kaynak Makineleri</a></li>
                                                <li><a href="../arama.html?q=Akülü Alet Setleri">Akülü Alet Setleri</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="olcme-ve-kontrol-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-ruler-combined"></i>
                                            <span>Ölçme ve Kontrol Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Lazerli Ölçüm</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Lazerli Mesafe Ölçer">Lazerli Ölçüm Cihazları</a></li>
                                                <li><a href="../arama.html?q=Lazer Hizalama">Lazer Hizalamalar</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Mekanik Ölçüm</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Şerit Metreler">Şerit Metreler</a></li>
                                                <li><a href="../arama.html?q=Çelik Metreler">Çelik Metreler</a></li>
                                                <li><a href="../arama.html?q=Kumpaslar">Kumpaslar (Dijital, Analog)</a></li>
                                                <li><a href="../arama.html?q=Mikrometreler">Mikrometreler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Terazi & Açı</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Su Terazisi">Su Terazileri</a></li>
                                                <li><a href="../arama.html?q=Açı Ölçerler">Açı Ölçerler</a></li>
                                                <li><a href="../arama.html?q=Dijital Tartı">Dijital Tartılar</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Görüntüleme</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Endoskoplar">Endoskoplar</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="asindirici-kesici.html">
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
                                                <li><a href="../arama.html?q=Matkap Uçları">Matkap Uçları</a></li>
                                                <li><a href="../arama.html?q=Freze Uçları">Freze Uçları</a></li>
                                                <li><a href="../arama.html?q=Karot Uçları">Karot Uçları</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kesme & Taşlama</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Taşlama Diskleri">Taşlama Diskleri</a></li>
                                                <li><a href="../arama.html?q=Kesme Diskleri">Kesme Diskleri</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Aşındırma ve Zımpara</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Zımpara Kağıtları">Zımpara Kağıtları ve Bantları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="yapi-kimyasallari.html">
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
                                                <li><a href="../arama.html?q=Silikon Mastik">Silikon, Mastik ve Akrilikler</a></li>
                                                <li><a href="../arama.html?q=Yapıştırıcı Epoksi">Yapıştırıcı Çeşitleri</a></li>
                                                <li><a href="../arama.html?q=Poliüretan Köpük">Poliüretan Köpükler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Dolgu ve Harçlar</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Çimento Harç">Çimento Esaslı Harçlar</a></li>
                                                <li><a href="../arama.html?q=Alçı">Alçı ve Alçı Ürünleri</a></li>
                                                <li><a href="../arama.html?q=Derz Dolgu">Derz Dolgular</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kimyasallar</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Tiner Çözücü">Tiner ve Çözücüler</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="kaynak-malzemeleri.html">
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
                                                <li><a href="../arama.html?q=Elektrot">Elektrotlar (Rutil, Bazik)</a></li>
                                                <li><a href="../arama.html?q=Kaynak Teli">Kaynak Telleri (Gazaltı, Tig)</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Koruyucu Ekipman</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Kaynak Maskesi">Kaynak Maskeleri ve Eldivenleri</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Makine ve Aksesuar</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Kaynak Makinesi">Kaynak Makineleri ve Aksesuarları</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="hirdavat-el-aletleri.html">
                                        <div class="menu-item-left">
                                            <i class="fa-solid fa-screwdriver-wrench"></i>
                                            <span>Hırdavat ve El Aletleri</span>
                                        </div>
                                        <i class="fa-solid fa-chevron-right"></i>
                                    </a>
                                    <div class="sub-menu">
                                        <div class="sub-menu-column">
                                            <h4>Anahtarlar &amp; Vidalama</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Anahtar Takımı">Anahtar Takımları (Lokma, Kombine)</a></li>
                                                <li><a href="../arama.html?q=İngiliz Anahtarı">İngiliz Anahtarı</a></li>
                                                <li><a href="../arama.html?q=Tornavida">Tornavidalar (Düz, Yıldız, Tork)</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Kesme &amp; Şekillendirme</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Pense">Pense ve Yan Keski Çeşitleri</a></li>
                                                <li><a href="../arama.html?q=Maket Bıçağı">Maket Bıçakları</a></li>
                                                <li><a href="../arama.html?q=Testere El">Testereler (El, Budama)</a></li>
                                                <li><a href="../arama.html?q=Eğe Raspa">Eğeler ve Raspalar</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Vurma &amp; Sabitleme</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Çekiç">Çekiçler (Demirci, Lastik)</a></li>
                                                <li><a href="../arama.html?q=Balta">Balta</a></li>
                                                <li><a href="../arama.html?q=Keski Zımba">Keski ve Zımbalar</a></li>
                                                <li><a href="../arama.html?q=Mengene Kelepçe">Mengene ve Kelepçeler</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Ölçü Aletleri</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Metre">Metre</a></li>
                                                <li><a href="../arama.html?q=Su Terazisi">Su Terazisi</a></li>
                                                <li><a href="../arama.html?q=Gönye">Gönye</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <a href="is-guvenligi-ve-calisma-ekipmanlari.html">
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
                                                <li><a href="../arama.html?q=İş Elbisesi Eldiven">İş Elbiseleri, Eldiven</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Ayak &amp; Baş Koruma</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Baret Çelik Burunlu">Baret, Çelik Burunlu Ayakkabı</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Göz &amp; Kulak Koruma</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=Göz Kulak Koruyucu">Göz ve Kulak Koruyucuları</a></li>
                                            </ul>
                                        </div>
                                        <div class="sub-menu-column">
                                            <h4>Çalışma Ekipmanları</h4>
                                            <ul>
                                                <li><a href="../arama.html?q=İskele Merdiven">İş İskelesi ve Merdivenler</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>'''


def replace_mega_menu_in_file(filepath):
    """Dosyadaki mega menüyü günceller."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Mega menü bloğunu bul ve değiştir
        # Pattern: <div class="mega-menu"> ... </div> (nav-item-dropdown içinde)
        pattern = r'<div class="mega-menu">[\s\S]*?</ul>\s*</div>\s*</li>\s*<li><a href="[^"]*yeni-gelenler'
        
        if '<div class="mega-menu">' in content:
            # Daha basit yaklaşım: mega-menu bloğunu bul
            start_marker = '<div class="mega-menu">'
            end_section = '</ul>\n                        </div>'
            
            start_idx = content.find(start_marker)
            if start_idx != -1:
                # mega-menu'nun kapanışını bul
                # </ul> ve </div>'ın peş peşe geldiği yeri bul
                search_start = start_idx
                end_idx = -1
                
                # mega-menu-list'in kapanışını bul
                depth = 0
                in_mega_menu = False
                for i, char in enumerate(content[start_idx:], start_idx):
                    if content[i:i+18] == '<div class="mega-':
                        in_mega_menu = True
                    if in_mega_menu:
                        if content[i:i+4] == '<ul ' or content[i:i+3] == '<ul>':
                            depth += 1
                        elif content[i:i+5] == '</ul>':
                            depth -= 1
                            if depth == 0:
                                # mega-menu-list kapandı, şimdi </div> bul
                                remaining = content[i+5:i+100]
                                div_close = remaining.find('</div>')
                                if div_close != -1:
                                    end_idx = i + 5 + div_close + 6
                                    break
                
                if end_idx != -1:
                    # Eski mega menu'yu yenisiyle değiştir
                    new_content = content[:start_idx] + UPDATED_MEGA_MENU + content[end_idx:]
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    return True
        return False
    except Exception as e:
        print(f"Hata ({filepath}): {e}")
        return False


def main():
    """Ana fonksiyon."""
    print("=" * 60)
    print("MEGA MENÜ SENKRONİZASYONU")
    print("=" * 60)
    
    # Kategoriler klasöründeki tüm HTML dosyalarını işle
    updated_count = 0
    failed_count = 0
    
    for filename in os.listdir(KATEGORILER_DIR):
        if filename.endswith('.html'):
            filepath = os.path.join(KATEGORILER_DIR, filename)
            print(f"İşleniyor: {filename}...", end=" ")
            
            if replace_mega_menu_in_file(filepath):
                print("✓ Güncellendi")
                updated_count += 1
            else:
                print("✗ Başarısız")
                failed_count += 1
    
    print("=" * 60)
    print(f"Tamamlandı: {updated_count} güncellendi, {failed_count} başarısız")
    print("=" * 60)


if __name__ == "__main__":
    main()
