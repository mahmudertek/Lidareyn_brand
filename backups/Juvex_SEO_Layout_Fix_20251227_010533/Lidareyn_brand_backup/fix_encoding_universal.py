
import os
import glob

# Recursive search for ALL HTML files
root_dir = r'c:\Users\pc\Desktop\Lidareyn_brand'
files_to_check = []

# Walk through all directories
for dirpath, dirnames, filenames in os.walk(root_dir):
    # Exclude node_modules, .git, .agent if they exist
    if 'node_modules' in dirnames: dirnames.remove('node_modules')
    if '.git' in dirnames: dirnames.remove('.git')
    if '.agent' in dirnames: dirnames.remove('.agent')
    
    for filename in filenames:
        if filename.endswith('.html'):
            files_to_check.append(os.path.join(dirpath, filename))

# Add specific JS/CSS files that might be affected
files_to_check.append(r'c:\Users\pc\Desktop\Lidareyn_brand\script.js')
# Add specific CSS files if needed, but usually class names are safe there unless content: "..." changed
# Actually, let's check basic CSS files too just in case content property has garbled text
files_to_check.append(r'c:\Users\pc\Desktop\Lidareyn_brand\category-accordion.css')
files_to_check.append(r'c:\Users\pc\Desktop\Lidareyn_brand\category-brands-dropdown.css')

replacements = {
    'populÇarşı': 'popular',
    'MÇarşıkalÇarşı': 'Markalar',
    'MÇarşıka': 'Marka',
    'sidebÇarşı': 'sidebar',
    'cÇarşıt': 'cart',
    'transpÇarşıent': 'transparent',
    'CÇarşıt': 'Cart',
    'madeniyat-product-cÇarşıd': 'madeniyat-product-card',
    'product-cÇarşıd': 'product-card', # Added specific one
    'cÇarşıd-actions': 'card-actions', # Added specific one
    'placeholder-cÇarşıd': 'placeholder-card',
    'Çarşırow-right': 'arrow-right',
    'Çarşırow-left': 'arrow-left',
    'Çarşırow-down': 'arrow-down',
    'chevron-Çarşırow': 'chevron-arrow', # unlikely but possible
    'mÇarşıkalÇarşı': 'markalar',
    'seÇarşıch': 'search',
    'Çarşıama': 'arama',
    'xmÇarşık': 'xmark',
    'primÇarşıy': 'primary',
    'secondÇarşıy': 'secondary',
    'SipÇarşıiş': 'Sipariş',
    'uÜyelik': 'Üyelik',
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
    'Çarşıia-hidden': 'aria-hidden',
    'Çarşıia-expanded': 'aria-expanded',
    'Çarşıia-haspopup': 'aria-haspopup',
    'kÇarşıbosan': 'karbosan',
    'kÇarşımaşık': 'karmaşık',
    'tasÇarşıımı': 'tasarımı',
    'sonuçlÇarşıla': 'sonuçlarla',
    'KÇarşıbosan': 'Karbosan',
    'cloudflÇarşıe': 'cloudflare',
    'regulÇarşı': 'regular',
    'heÇarşıt': 'heart',
    'bÇarşıs': 'bars',
    'pÇarşıent': 'parent',
    'ZmpÇarşıalÇarşı': 'Zımparalar',
    'Scak': 'Sıcak',
    'TabancalÇarşı': 'Tabancaları',
    'SatanlÇarşı': 'Satanlar',
    'VidalayclÇarşı': 'Vidalayıcılar', # Fix specialized typo
    'Akl': 'Akülü',
    'Krc-Deliciler': 'Kırıcı-Deliciler',
    'Gazalt': 'Gazaltı',
    'Avu i': 'Avuç İçi',
    'filter-bÇarşı': 'filter-bar' # Critical for "3 box" structure
}

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
         try:
            with open(filepath, 'r', encoding='mbcs') as f:
                content = f.read()
         except:
            print(f"Skipping {filepath} (read error)")
            return

    original_content = content
    
    # Apply replacements
    for bad, good in replacements.items():
        content = content.replace(bad, good)
        
    # Catch-all: "Çarşı" -> "ar" ONLY inside English words/class names
    # This is risky, so we do it selectively for common known patterns if they were missed
    # Like 'bÇarşı' -> 'bar' in 'navbar', 'sidebar'
    if 'bÇarşı' in content:
        content = content.replace('bÇarşı', 'bar') 
    
    # Check for remaining 'Çarşı' inside HTML tags (attributes)
    # This is hard to regex perfectly without breaking 'Galata Çarşı', but let's try specific suffixes
    # '...Çarşıd' -> '...card'
    content = content.replace('cÇarşıd', 'card')
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")
    else:
        pass # print(f"Clean: {filepath}")

print(f"Scanning {len(files_to_check)} files...")
for f in files_to_check:
    if os.path.exists(f):
        fix_file(f)
