import re
import os

files = [
    r"c:\Users\pc\Desktop\Lidareyn_brand\index.html",
    r"c:\Users\pc\Desktop\Lidareyn_brand\categories-data.js"
]

target_image_path = "'gorseller/bebek_special_v2.jpg'"

for file_path in files:
    if os.path.exists(file_path):
        print(f"Processing {file_path}...")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Regex to find the base64 string pattern and replace it
            # We look for 'data:image/jpeg;base64,.....'
            # The base64 string can be very long and contain alphanumeric, +, /, and =
            
            # For data:image...
            # We'll match 'data:image/jpeg;base64,[^']+'
            
            new_content = re.sub(r"'data:image/jpeg;base64,[^']+'", target_image_path, content)
            
            if content != new_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"  Replaced base64 string in {file_path}")
            else:
                print(f"  No base64 string found in {file_path}")
                
        except Exception as e:
            print(f"  Error processing {file_path}: {e}")
    else:
        print(f"File not found: {file_path}")
