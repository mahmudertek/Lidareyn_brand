
import os

directory = r'c:\Users\pc\Desktop\Lidareyn_brand\kategoriler'
count = 0

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Typo correction
        new_content = content.replace('tm markalar', 'tüm markalar')
        new_content = new_content.replace('Tm markalar', 'Tüm markalar')
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            count += 1
            print(f"Fixed typo in: {filename}")

print(f"Total files fixed: {count}")
