# -*- coding: utf-8 -*-
"""
Tüm kategori sayfalarındaki mega menüleri index.html'deki güncel 
mega menü ile senkronize eder.
"""
import os

ROOT_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand"
KATEGORILER_DIR = os.path.join(ROOT_DIR, "kategoriler")

def main():
    print("=" * 60)
    print("MEGA MENU SENKRONIZASYONU BASLIYOR")
    print("=" * 60)
    
    # index.html'den mega menu'yu al
    with open(os.path.join(ROOT_DIR, "index.html"), 'r', encoding='utf-8') as f:
        index_content = f.read()
    
    # Mega menu bloğunu bul
    start = index_content.find('<div class="mega-menu">')
    if start < 0:
        print("HATA: index.html'de mega menu bulunamadi!")
        return
    
    # mega-menu'nun kapanışını bul
    depth = 0
    end = -1
    in_mega = False
    for i in range(start, len(index_content)):
        chunk5 = index_content[i:i+5]
        chunk4 = index_content[i:i+4]
        
        if '<ul ' in chunk4 or index_content[i:i+23] == '<ul class="mega-menu-':
            depth += 1
            in_mega = True
        elif chunk5 == '</ul>':
            depth -= 1
            if in_mega and depth == 0:
                # mega-menu-list kapandı, şimdi </div> bul
                remaining = index_content[i+5:i+60]
                div_close = remaining.find('</div>')
                if div_close != -1:
                    end = i + 5 + div_close + 6
                    break
    
    if end <= start:
        print("HATA: Mega menu sonu bulunamadi!")
        return
    
    index_mega_menu = index_content[start:end]
    print(f"index.html mega menu: {len(index_mega_menu)} karakter")
    
    # Kategori sayfaları için ayarla
    category_mega_menu = index_mega_menu
    category_mega_menu = category_mega_menu.replace('kategoriler/', '')
    category_mega_menu = category_mega_menu.replace('href="arama.html', 'href="../arama.html')
    
    print(f"Kategori sayfalari icin hazir: {len(category_mega_menu)} karakter")
    
    # Kategoriler klasöründeki tüm HTML dosyalarını güncelle
    updated = 0
    for filename in os.listdir(KATEGORILER_DIR):
        if not filename.endswith('.html'):
            continue
            
        filepath = os.path.join(KATEGORILER_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Eski mega menu'yu bul
        old_start = content.find('<div class="mega-menu">')
        if old_start < 0:
            print(f"  {filename}: mega menu yok, atlaniyor")
            continue
        
        # Eski mega menu sonunu bul
        depth = 0
        old_end = -1
        in_mega = False
        for i in range(old_start, len(content)):
            chunk5 = content[i:i+5]
            chunk4 = content[i:i+4]
            
            if '<ul ' in chunk4 or content[i:i+23] == '<ul class="mega-menu-':
                depth += 1
                in_mega = True
            elif chunk5 == '</ul>':
                depth -= 1
                if in_mega and depth == 0:
                    remaining = content[i+5:i+60]
                    div_close = remaining.find('</div>')
                    if div_close != -1:
                        old_end = i + 5 + div_close + 6
                        break
        
        if old_end <= old_start:
            print(f"  {filename}: mega menu sonu bulunamadi")
            continue
        
        # Yeni içerik oluştur
        new_content = content[:old_start] + category_mega_menu + content[old_end:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        updated += 1
        print(f"  {filename}: Guncellendi")
    
    print("=" * 60)
    print(f"TAMAMLANDI: {updated} dosya guncellendi")
    print("=" * 60)

if __name__ == "__main__":
    main()
