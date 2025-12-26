import os
import re

# Değiştirilecek kelimeler
replacements = {
    'Galata Çarşı': 'Galata Çarşı',
    'galatacarsi': 'galatacarsi',
    'galata_carsi': 'galata_carsi',
    'galata-carsi': 'galata-carsi',
    'GalataCarsi': 'GalataCarsi',
    'Galata-Carsi': 'Galata-Carsi',
    'galata_admin': 'galata_admin',
    'Galata': 'Galata',
    'galata': 'galata'
}

# Hariç tutulacak klasörler
exclude_dirs = ['backups', 'node_modules', '.git', '__pycache__']

# İşlenecek dosya uzantıları
file_extensions = ['.html', '.js', '.css', '.md', '.json', '.txt', '.py']

# Değişiklik sayacı
total_changes = 0
files_changed = 0

def should_process_file(filepath):
    """Dosyanın işlenip işlenmeyeceğini kontrol et"""
    # Hariç tutulan klasörlerde mi?
    for exclude_dir in exclude_dirs:
        if exclude_dir in filepath:
            return False
    
    # Desteklenen uzantıda mı?
    _, ext = os.path.splitext(filepath)
    return ext in file_extensions

def replace_in_file(filepath):
    """Dosyadaki tüm eşleşmeleri değiştir"""
    global total_changes, files_changed
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        file_changes = 0
        
        # Tüm değişiklikleri uygula
        for old, new in replacements.items():
            count = content.count(old)
            if count > 0:
                content = content.replace(old, new)
                file_changes += count
        
        # Eğer değişiklik varsa dosyayı yaz
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            total_changes += file_changes
            files_changed += 1
            print(f"✅ {filepath}: {file_changes} değişiklik")
            
    except Exception as e:
        print(f"❌ Hata ({filepath}): {e}")

def main():
    """Ana fonksiyon"""
    root_dir = r'C:\Users\pc\Desktop\Lidareyn_brand'
    
    print("🔄 'Galata Çarşı' → 'Galata Çarşı' değiştirme başlıyor...\n")
    
    # Tüm dosyaları tara
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Hariç tutulan klasörleri atla
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            
            if should_process_file(filepath):
                replace_in_file(filepath)
    
    print(f"\n✨ Tamamlandı!")
    print(f"📊 Toplam {files_changed} dosyada {total_changes} değişiklik yapıldı.")

if __name__ == '__main__':
    main()
