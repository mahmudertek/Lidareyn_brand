import os

def fix_file(filepath):
    encodings = ['utf-8', 'windows-1254', 'iso-8859-9', 'ansi']
    content = None
    
    for enc in encodings:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                content = f.read()
            print(f"Read {filepath} with {enc}")
            break
        except Exception:
            continue
            
    if content:
        # Manually fix specific known corrupted strings if they remain
        # Populur -> Popüler
        # r² -> ü... etc. 
        # But usually reading with windows-1254/iso-8859-9 fixes it.
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved {filepath} as UTF-8")

files_to_fix = [
    'populer.html',
    'yeni-gelenler.html',
    'juwex.html',
    'juvex.html',
    'urun-detay.html',
    'markalar.html',
    'arama.html'
]

for f in files_to_fix:
    if os.path.exists(f):
        fix_file(f)
