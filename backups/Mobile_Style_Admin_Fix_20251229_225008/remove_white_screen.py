import os
import re

def remove_blocking_styles():
    root_dir = os.getcwd()
    html_files = []
    
    for f in os.listdir(root_dir):
        if f.endswith('.html'):
            html_files.append(os.path.join(root_dir, f))
            
    kat_dir = os.path.join(root_dir, 'kategoriler')
    if os.path.exists(kat_dir):
        for f in os.listdir(kat_dir):
            if f.endswith('.html'):
                html_files.append(os.path.join(kat_dir, f))

    # Beyaz perdeyi (blocking style) tamamen silen regex
    pattern_style = re.compile(r'<style id="bakim-blocking-style">.*?</style>', re.DOTALL)

    for file_path in html_files:
        print(f"Cleaning {file_path}...")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = pattern_style.sub('', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

if __name__ == "__main__":
    remove_blocking_styles()
