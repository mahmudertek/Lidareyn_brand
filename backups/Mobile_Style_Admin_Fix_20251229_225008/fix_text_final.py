
import os

root_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'

# Define replacements (Target -> Replacement)
# Order matters! Fix specific long patterns first.
replacements = {
    'Galata ÇÇarşışı': 'Galata Çarşı',
    'Galata Çarşışı': 'Galata Çarşı',
    'ÇÇarşışı': 'Çarşı', 
    
    # HTML/CSS technical terms corruption
    'mobile-seÇarşıch-btn': 'mobile-search-btn',
    'seÇarşıch-container': 'search-container',
    'seÇarşıch-input': 'search-input',
    'seÇarşıch-btn': 'search-btn',
    'mobile-seÇarşıch': 'mobile-search',
    'seÇarşıch': 'search',
    'Çarşıia-label': 'aria-label',
    'Çarşıia-hidden': 'aria-hidden',
    'Çarşıia-expanded': 'aria-expanded',
    'Çarşıia-haspopup': 'aria-haspopup',
    'fa-bÇarşıs': 'fa-bars',
    'fa-heÇarşıt': 'fa-heart',
    'fa-cÇarşıt-shopping': 'fa-cart-shopping',
    'fa-regulÇarşı': 'fa-regular',
    'cÇarşıt-btn': 'cart-btn',
    'cÇarşıt-count': 'cart-count',
    'cÇarşıt-sidebÇarşı': 'cart-sidebar',
    'favorites-sidebÇarşı': 'favorites-sidebar',
    'sidebÇarşı': 'sidebar',
    'close-sidebÇarşı': 'close-sidebar',
    'brands-seÇarşıch': 'brands-search',
    'accordion-pÇarşıent': 'accordion-parent',
    'filter-bÇarşı': 'filter-bar',
    'placeholder-cÇarşıd': 'placeholder-card',
    'product-cÇarşıd': 'product-card',
    'cÇarşıd-actions': 'card-actions',
    'chevron-Çarşırow': 'chevron-arrow',
    'pagination-Çarşırow': 'pagination-arrow',
    'fa-xmÇarşık': 'fa-xmark',
    'btn-primÇarşıy': 'btn-primary',
    'btn-secondÇarşıy': 'btn-secondary',
    'transpÇarşıent': 'transparent',
    'mastercÇarşıd': 'mastercard',
    'MastercÇarşıd': 'Mastercard',
    'credit-cÇarşıd': 'credit-card',
    
    # Turkish content corruption (Çarşı -> ar)
    'mÇarşıkalÇarşı': 'markalar',
    'mÇarşıka': 'marka',
    'MÇarşıkalÇarşı': 'Markalar',
    'MÇarşıka': 'Marka',
    'fiyatlÇarşıla': 'fiyatlarla',
    'onÇarşıım': 'onarım',
    'ekipmanlÇarşıı': 'ekipmanları',
    'MatkaplÇarşı': 'Matkaplar',
    'DÇarşıbeli': 'Darbeli',
    'DÇarşıbesiz': 'Darbesiz',
    'VidalayıcılÇarşı': 'Vidalayıcılar',
    'KÇarşıot': 'Karot',
    'ZımpÇarşıalÇarşı': 'Zımparalar',
    'ZımpÇarşıa': 'Zımpara',
    'TabancalÇarşıı': 'Tabancaları',
    'TabancalÇarşı': 'Tabancaları',
    'AksesuÇarşı': 'Aksesuar',
    'AksesuÇarşılÇarşıı': 'Aksesuarları',
    'AnahtÇarşı': 'Anahtar',
    'AnahtÇarşılÇarşı': 'Anahtarlar',
    'TakımlÇarşıı': 'Takımları',
    'TornavidalÇarşı': 'Tornavidalar',
    'BıçaklÇarşıı': 'Bıçakları',
    'RaspalÇarşı': 'Raspalar',
    'ZımbalÇarşı': 'Zımbalar',
    'SÇarşıf': 'Sarf',
    'ElektrotlÇarşı': 'Elektrotlar',
    'DolgulÇarşı': 'Dolgular',
    'HÇarşıç': 'Harç',
    'HÇarşıçlÇarşı': 'Harçlar',
    'KimyasallÇarşı': 'Kimyasallar',
    'YapıştırıcılÇarşı': 'Yapıştırıcılar',
    'BoyalÇarşı': 'Boyalar',
    'UçlÇarşı': 'Uçlar',
    'UçlÇarşıı': 'Uçları',
    'KağıtlÇarşıı': 'Kağıtları',
    'BantlÇarşıı': 'Bantları',
    'CihazlÇarşıı': 'Cihazları',
    'HizalamalÇarşı': 'Hizalamalar',
    'KumpaslÇarşı': 'Kumpaslar',
    'TartılÇarşı': 'Tartılar',
    'TÇarşıtılÇarşı': 'Tartılar',
    'EndoskoplÇarşı': 'Endoskoplar',
    'SipÇarşıiş': 'Sipariş',
    'kÇarşıgo': 'kargo',
    'KÇarşıgo': 'Kargo',
    'Çarşıa': 'ara', # be careful: 'ara' vs 'Çarşı'
    'SorulÇarşı': 'Sorular',
    'KoşullÇarşıı': 'Koşulları',
    'magazalÇarşı': 'magazalar',
    'MağazalÇarşıımız': 'Mağazalarımız',
    'SatanlÇarşı': 'Satanlar',
    'PÇarşıça': 'Parça',
    'kÇarşımaşık': 'karmaşık',
    'tasÇarşıımı': 'tasarımı',
    'sonuçlÇarşıla': 'sonuçlarla',
    
    # Other Typos seen
    'Gazaltıı': 'Gazaltı',
    'Tabancalarıı': 'Tabancaları',
    'Girişş': 'Giriş',
    'ŞŞifremi': 'Şifremi',
    'ŞŞerit': 'Şerit',
    'ÇÇelik': 'Çelik',
    'Açıçı': 'Açı',
    'uÜyelik': 'Üyelik',
    'ÜÜye': 'Üye',
    'ÜÜyelik': 'Üyelik',
    
    'galatacÇarşısi': 'galatacarsi'
}

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return

    original_content = content
    for target, replacement in replacements.items():
        if target in content:
            content = content.replace(target, replacement)
            
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

# Walk all HTML files
for dirpath, dirnames, filenames in os.walk(root_dir):
    if 'node_modules' in dirnames: dirnames.remove('node_modules')
    if '.git' in dirnames: dirnames.remove('.git')
    for filename in filenames:
        if filename.endswith(".html") or filename.endswith(".css") or filename.endswith(".js"):
            fix_file(os.path.join(dirpath, filename))
