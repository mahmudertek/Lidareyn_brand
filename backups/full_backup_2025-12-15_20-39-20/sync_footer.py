import os

def sync_footer():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(root_dir, 'index.html')
    
    target_files = [
        'mesafeli-satis-sozlesmesi.html',
        'kvkk.html',
        'iade-iptal.html',
        'gizlilik-guvenlik.html'
    ]

    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            index_content = f.read()
            
        # Footer başlangıç ve bitişini bul
        start_marker = '<footer class="main-footer">'
        end_marker = '</footer>'
        
        start_index = index_content.find(start_marker)
        
        # Footer kapanışını bulmak için start_marker'dan sonrasına bak
        # Ancak </footer> birden fazla olabilir, biz main-footer'ın kapanışını arıyoruz.
        # Basitçe son </footer>'ı değil, start_index'ten sonraki eşleşen kapanışı bulmalı.
        # Genelde footer en alttadır ama scriptler vardır. <div class="sidebar-overlay"> öncesi footer bitişidir.
        
        # Daha güvenli yöntem: <footer class="main-footer"> ile başlayan ve </footer> ile biten bloğu al.
        # index.html'de footer yapısı:
        # <footer class="main-footer">
        #    ...
        # </footer>
        
        # Basit string search
        if start_index == -1:
            print("Hata: Footer bulunamadı.")
            return

        # İç içe footer olma ihtimali düşük, ilk </footer> iş görür muhtemelen.
        end_index = index_content.find(end_marker, start_index)
        
        if end_index == -1:
             print("Hata: Footer kapanışı bulunamadı.")
             return
             
        end_index += len(end_marker)
        
        footer_content = index_content[start_index:end_index]
        print(f"Footer içeriği okundu ({len(footer_content)} karakter).")

    except Exception as e:
        print(f"index.html hatası: {e}")
        return

    for filename in target_files:
        filepath = os.path.join(root_dir, filename)
        if not os.path.exists(filepath):
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Hedefteki footer'ı bul ve değiştir
            target_start = content.find(start_marker)
            if target_start == -1:
                # Belki eski footer var (sadece <footer>)
                target_start = content.find('<footer>')
                if target_start != -1:
                     start_marker_alt = '<footer>'
                else:
                     print(f"{filename} içinde footer bulunamadı.")
                     continue
            
            # Footer kapanışını bul
            target_end = content.find(end_marker, target_start)
            if target_end != -1:
                target_end += len(end_marker)
                
                new_content = content[:target_start] + footer_content + content[target_end:]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Footer güncellendi: {filename}")
                
        except Exception as e:
            print(f"Hata {filename}: {e}")

if __name__ == "__main__":
    sync_footer()
