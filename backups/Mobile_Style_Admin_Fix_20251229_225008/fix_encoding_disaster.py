
import os

files_to_check = [
    r'c:\Users\pc\Desktop\Lidareyn_brand\index.html',
    r'c:\Users\pc\Desktop\Lidareyn_brand\populer.html',
    r'c:\Users\pc\Desktop\Lidareyn_brand\yeni-gelenler.html'
]

replacements = {
    'populÇarşı': 'popular',
    'MÇarşıkalÇarşı': 'Markalar',
    'MÇarşıka': 'Marka',
    'sidebÇarşı': 'sidebar',
    'cÇarşıt': 'cart',
    'transpÇarşıent': 'transparent',
    'CÇarşıt': 'Cart',
    'madeniyat-product-cÇarşıd': 'madeniyat-product-card',
    'placeholder-cÇarşıd': 'placeholder-card',
    'Çarşırow-right': 'arrow-right',
    'mÇarşıkalÇarşı': 'markalar',
    'seÇarşıch': 'search',
    'Çarşıama': 'arama',
    'xmÇarşık': 'xmark',
    'primÇarşıy': 'primary',
    'secondÇarşıy': 'secondary',
    'SipÇarşıiş': 'Sipariş',
    'uÜyelik': 'Üyelik', # Fix double Ü
    'ÜÜyelik': 'Üyelik',
    'ÜÜye': 'Üye',
    'Girişş': 'Giriş',
    'ŞŞifremi': 'Şifremi',
    'SorulÇarşı': 'Sorular',
    'galatacÇarşısi': 'galatacarsi',
    'mastercÇarşıd': 'mastercard',
    'MastercÇarşıd': 'Mastercard',
    'credit-cÇarşıd': 'credit-card',
    'Çarşıia-label': 'aria-label',
    'kÇarşıbosan': 'karbosan', # Brand
    'kÇarşımaşık': 'karmaşık',
    'tasÇarşıımı': 'tasarımı',
    'sonuçlÇarşıla': 'sonuçlarla',
    'kÇarşı': 'kar', # careful with this
    'KÇarşıbosan': 'Karbosan',
    'cloudflÇarşıe': 'cloudflare',
    'Çarşı': 'ar' # Catch-all for remaining corrupted strings, do this LAST and carefully? No, might break valid Turkish 'Çarşı' (Bazaar).
}

# Specific 'Çarşı' -> 'ar' fixes for known English attributes/classes
# using a more targeted approach for the catch-all
# We cannot blindly replace 'Çarşı' with 'ar' because 'Galata Çarşı' is correct.

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        print(f"Error reading {filepath}")
        return

    # Apply specific replacements first
    for bad, good in replacements.items():
        if bad == 'Çarşı': continue # Skip catch-all for now
        content = content.replace(bad, good)
    
    # Fix 'ar' in English words specifically
    # Example: 'populÇarşı' -> 'popular' handled above
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed encoding in {filepath}")

for f in files_to_check:
    if os.path.exists(f):
        fix_file(f)
