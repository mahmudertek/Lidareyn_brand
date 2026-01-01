import os
import re

def sync_mega_menu():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(root_dir, 'index.html')
    
    target_files = [
        'mesafeli-satis-sozlesmesi.html',
        'kvkk.html',
        'iade-iptal.html',
        'gizlilik-guvenlik.html'
    ]

    # 1. index.html'den Mega Menü'yü oku
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            index_content = f.read()
            
        # Regex ile mega menü bloğunu yakala
        # <div class="mega-menu"> ile başlar, </div> kapanışını yakalamak zordur ama 
        # class="nav-item-dropdown" <li> içindedir ve mega-menu onun child'ıdır.
        # "Tüm Kategoriler" linkinden sonra gelen ve </li> ile biten kısmı almayı deneyelim.
        
        # Daha güvenli yol: String işlemleriyle bloğu bulmak.
        start_marker = '<div class="mega-menu">'
        
        start_index = index_content.find(start_marker)
        if start_index == -1:
            print("Hata: index.html içinde mega-menu bulunamadı.")
            return

        # Bulduğumuz div'in kapanışını bulmak için basit bir sayaç kullanalım
        div_count = 0
        end_index = -1
        
        for i in range(start_index, len(index_content)):
            if index_content[i:].startswith('<div'):
                div_count += 1
            elif index_content[i:].startswith('</div'):
                div_count -= 1
                
            if div_count == 0:
                end_index = i + 6 # </div> uzunluğu
                break
        
        if end_index == -1:
            print("Hata: Mega menü kapanış tag'i bulunamadı.")
            return

        mega_menu_content = index_content[start_index:end_index]
        print(f"Mega menü içeriği okundu ({len(mega_menu_content)} karakter).")

    except Exception as e:
        print(f"index.html okunurken hata: {e}")
        return

    # 2. Hedef dosyalara yaz
    for filename in target_files:
        filepath = os.path.join(root_dir, filename)
        if not os.path.exists(filepath):
            print(f"Uyarı: {filename} bulunamadı, atlanıyor.")
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Hedef dosyadaki mega menüyü bul ve değiştir
            target_start = content.find(start_marker)
            if target_start == -1:
                print(f"{filename} içinde mega-menu bulunamadı, değiştirilemedi.")
                continue

            # Hedefteki kapanışı bul
            div_count = 0
            target_end = -1
            for i in range(target_start, len(content)):
                if content[i:].startswith('<div'):
                    div_count += 1
                elif content[i:].startswith('</div'):
                    div_count -= 1
                
                if div_count == 0:
                    target_end = i + 6
                    break
            
            if target_end != -1:
                new_content = content[:target_start] + mega_menu_content + content[target_end:]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Güncellendi: {filename}")
            else:
                print(f"Hata: {filename} içindeki mega-menu kapanışı bulunamadı.")

        except Exception as e:
            print(f"Hata {filename} işlenirken: {e}")

if __name__ == "__main__":
    sync_mega_menu()
