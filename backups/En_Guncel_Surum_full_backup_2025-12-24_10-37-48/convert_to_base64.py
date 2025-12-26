import base64
import os

image_path = r"c:\Users\pc\Desktop\Lidareyn_brand\gorseller\bebek_v2.jpg"
output_path = r"c:\Users\pc\Desktop\Lidareyn_brand\bebek_base64.txt"

try:
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
    with open(output_path, "w") as text_file:
        text_file.write(f"data:image/jpeg;base64,{encoded_string}")
        
    print("Base64 string successfully written to", output_path)
except Exception as e:
    print("Error:", e)
