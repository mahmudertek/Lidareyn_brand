import os
import re

def fix_footer_links():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Hedef dosyalar: Sadece HTML dosyaları
    files_to_process = []
    for root, dirs, files in os.walk(root_dir):
        if "backups" in root or ".gemini" in root or "node_modules" in root:
            continue
        for file in files:
            if file.endswith(".html"):
                files_to_process.append(os.path.join(root, file))

    replacement_map = {
        'href="sozlesmeler.html#kvkk"': 'href="kvkk.html"',
        'href="sozlesmeler.html#mesafeli-satis"': 'href="mesafeli-satis-sozlesmesi.html"',
        'href="sozlesmeler.html#iptal-iade"': 'href="iade-iptal.html"',
        'href="sozlesmeler.html#kargo"': 'href="iade-iptal.html"',
        'href="sozlesmeler.html"': 'href="mesafeli-satis-sozlesmesi.html"'
    }

    count = 0
    for file_path in files_to_process:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            for old_link, new_link in replacement_map.items():
                content = content.replace(old_link, new_link)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated footer links in: {os.path.basename(file_path)}")
                count += 1
                
        except Exception as e:
            print(f"Error processing {file_path}: {e}")

    print(f"Tamamlandi. Toplam {count} dosyada footer linki duzeltildi.")

if __name__ == "__main__":
    fix_footer_links()
