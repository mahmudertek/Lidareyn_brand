# Kategori Accordion Güncelleyici
# Her kategori sayfasına CSS, JS ve accordion HTML ekler

$categories = @{
    "olcme-ve-kontrol-aletleri.html"           = @{
        "title"     = "Ölçme ve Kontrol Aletleri"
        "accordion" = @'
    <!-- Mobile: Category Accordion Navigation -->
    <div class="container">
        <div class="category-accordion">
            <button class="accordion-main-trigger">
                Alt Kategoriler
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Lazerli Ölçüm
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Lazerli Ölçüm Cihazları (Mesafe Ölçer)</a>
                        <a href="#" class="accordion-child-item">Lazer Hizalamalar (Çizgi, Nokta)</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Mekanik Ölçüm
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Şerit Metreler</a>
                        <a href="#" class="accordion-child-item">Çelik Metreler</a>
                        <a href="#" class="accordion-child-item">Kumpaslar (Dijital, Analog)</a>
                        <a href="#" class="accordion-child-item">Mikrometreler</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Terazi & Açı
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Su Terazileri (Dijital, Klasik)</a>
                        <a href="#" class="accordion-child-item">Açı Ölçerler</a>
                        <a href="#" class="accordion-child-item">Dijital Tartılar</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Görüntüleme
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Endoskoplar</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
'@
    }
    "hirdavat-el-aletleri.html"                = @{
        "title"     = "El Aletleri"
        "accordion" = @'
    <!-- Mobile: Category Accordion Navigation -->
    <div class="container">
        <div class="category-accordion">
            <button class="accordion-main-trigger">
                Alt Kategoriler
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Anahtarlar & Vidalama
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Anahtar Takımları (Lokma, Kombine, Alyen)</a>
                        <a href="#" class="accordion-child-item">Tornavidalar (Düz, Yıldız, Tork)</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Kesme & Şekillendirme
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Pense ve Yan Keski Çeşitleri</a>
                        <a href="#" class="accordion-child-item">Maket Bıçakları ve Yedekleri</a>
                        <a href="#" class="accordion-child-item">Testereler (El, Budama)</a>
                        <a href="#" class="accordion-child-item">Eğeler ve Raspalar</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Vurma & Sabitleme
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Çekiçler (Demirci, Lastik, Kaya)</a>
                        <a href="#" class="accordion-child-item">Keski ve Zımbalar</a>
                        <a href="#" class="accordion-child-item">Mengene ve Kelepçeler</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
'@
    }
    "nalbur-yapi-malzemeleri.html"             = @{
        "title"     = "Yapı ve İnşaat Malzemeleri"
        "accordion" = @'
    <!-- Mobile: Category Accordion Navigation -->
    <div class="container">
        <div class="category-accordion">
            <button class="accordion-main-trigger">
                Alt Kategoriler
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Kimyasal & Yapıştırıcı
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Silikon, Mastik ve Köpükler</a>
                        <a href="#" class="accordion-child-item">Yapıştırıcılar (Epoksi, Japon, Poliüretan)</a>
                        <a href="#" class="accordion-child-item">Harç ve Beton Malzemeleri</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Boya & İzolasyon
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Boyalar ve Boya Malzemeleri (Fırça, Rulo, Tiner)</a>
                        <a href="#" class="accordion-child-item">İzolasyon Malzemeleri</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Donanım
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Kilitler ve Menteşeler</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
'@
    }
    "asindirici-kesici.html"                   = @{
        "title"     = "Aşındırıcı ve Kesici Uçlar"
        "accordion" = @'
    <!-- Mobile: Category Accordion Navigation -->
    <div class="container">
        <div class="category-accordion">
            <button class="accordion-main-trigger">
                Alt Kategoriler
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Delici & Vidalama
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Matkap Uçları (Metal, Ahşap, Beton)</a>
                        <a href="#" class="accordion-child-item">Freze Uçları</a>
                        <a href="#" class="accordion-child-item">Karot Uçları</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Kesme & Taşlama
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Taşlama Diskleri</a>
                        <a href="#" class="accordion-child-item">Kesme Diskleri</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Aşındırma ve Zımpara
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Zımpara Kağıtları ve Bantları</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
'@
    }
    "yapi-kimyasallari.html"                   = @{
        "title"     = "Yapıştırıcı, Dolgu ve Kimyasallar"
        "accordion" = @'
    <!-- Mobile: Category Accordion Navigation -->
    <div class="container">
        <div class="category-accordion">
            <button class="accordion-main-trigger">
                Alt Kategoriler
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Yapıştırıcılar
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Silikon, Mastik ve Akrilikler</a>
                        <a href="#" class="accordion-child-item">Yapıştırıcı Çeşitleri (Epoksi, Japon, Ahşap)</a>
                        <a href="#" class="accordion-child-item">Poliüretan Köpükler</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Dolgu ve Harçlar
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Çimento Esaslı Harçlar</a>
                        <a href="#" class="accordion-child-item">Alçı ve Alçı Ürünleri</a>
                        <a href="#" class="accordion-child-item">Derz Dolgular</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Kimyasallar
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Tiner ve Çözücüler</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
'@
    }
    "kaynak-malzemeleri.html"                  = @{
        "title"     = "Kaynak Malzemeleri"
        "accordion" = @'
    <!-- Mobile: Category Accordion Navigation -->
    <div class="container">
        <div class="category-accordion">
            <button class="accordion-main-trigger">
                Alt Kategoriler
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Sarf Malzemeleri
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Elektrotlar (Rutil, Bazik)</a>
                        <a href="#" class="accordion-child-item">Kaynak Telleri (Gazaltı, Tig)</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Koruyucu Ekipman
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Kaynak Maskeleri ve Eldivenleri</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Makine ve Aksesuar
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Kaynak Makineleri ve Aksesuarları</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
'@
    }
    "is-guvenligi-ve-calisma-ekipmanlari.html" = @{
        "title"     = "İş Güvenliği ve Çalışma Ekipmanları"
        "accordion" = @'
    <!-- Mobile: Category Accordion Navigation -->
    <div class="container">
        <div class="category-accordion">
            <button class="accordion-main-trigger">
                Alt Kategoriler
                <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div class="accordion-content">
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Koruyucu Giyim
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">İş Elbiseleri, Eldiven</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Ayak & Baş Koruma
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Baret, Çelik Burunlu Ayakkabı</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Göz & Kulak Koruma
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">Göz ve Kulak Koruyucuları</a>
                    </div>
                </div>
                <div class="accordion-parent">
                    <button class="accordion-parent-trigger">
                        Çalışma Ekipmanları
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="accordion-children">
                        <a href="#" class="accordion-child-item">İş İskelesi ve Merdivenler</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
'@
    }
}

Write-Host "Kategori accordion şablonları hazır!"
Write-Host "Toplam: $($categories.Count) kategori"
