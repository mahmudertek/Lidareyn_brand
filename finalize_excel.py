import pandas as pd
import json
import os
import re

# Dosya yolları (Kendi bilgisayarınıza göre güncelleyebilirsiniz)
INPUT_EXCEL = 'C:/Users/pc/Desktop/Beta_Katalog_FINAI_CLEANED.xlsx'
OUTPUT_EXCEL = 'C:/Users/pc/Desktop/Beta_Katalog_FINAL_FIXED.xlsx'
MAPPING_JSON = 'c:/Users/pc/Desktop/Lidareyn_brand/image_mapping.json'

def fix_excel():
    print("?? Excel dosyası okunuyor...")
    if not os.path.exists(INPUT_EXCEL):
        print(f"?? Hata: {INPUT_EXCEL} bulunamadı!")
        return

    # Excel'i oku
    df = pd.read_excel(INPUT_EXCEL)
    
    # Mapping'i oku
    print("?? Resim eşleştirmeleri yükleniyor...")
    with open(MAPPING_JSON, 'r', encoding='utf-8') as f:
        mapping = json.load(f)
    
    # Mapping'i daha hızlı arama için sözlüğe çevir (SKU -> Image)
    sku_to_img = {str(m['sku']).strip().lower(): m['img'] for m in mapping}
    
    print(f"?? {len(df)} ürün işleniyor...")

    def process_image(row):
        sku = str(row.get('StokKodu', '')).strip().lower()
        current_url = str(row.get('GorselURL', ''))
        
        # Eğer resim "Çok Büyük" uyarısıysa veya base64 ise değiştirelim
        is_bad_url = "[Görsel Verisi" in current_url or "data:image" in current_url or current_url == 'nan' or len(current_url) < 3
        
        if is_bad_url:
            # Önce mapping'den ara
            if sku in sku_to_img:
                img_name = sku_to_img[sku]
                return f"/gorseller/beta/{img_name}"
            
            # Eğer mapping'de yoksa ama model numarası ise (Örn: 32/5)
            # Sadece dosya ismi tahmin et
            clean_sku = re.sub(r'[^a-zA-Z0-9]', '_', sku)
            return f"/gorseller/beta/beta_{clean_sku}.jpg"
            
        return current_url

    # Görsel sütununu güncelle
    df['GorselURL'] = df.apply(process_image, axis=1)
    
    # Açıklamaları ve İsimleri de biraz düzeltebiliriz
    def clean_text(text):
        if pd.isna(text): return ""
        return " ".join(str(text).split())

    df['UrunAdi'] = df['UrunAdi'].apply(clean_text)
    df['Aciklama'] = df['Aciklama'].apply(clean_text)

    # Ölçü bilgisini isme ekle (Eğer yoksa)
    def fix_name(row):
        name = str(row['UrunAdi'])
        olcu = str(row.get('Olcu', ''))
        if olcu != 'nan' and olcu and olcu not in name:
            return f"{name} - {olcu}"
        return name

    df['UrunAdi'] = df.apply(fix_name, axis=1)

    print(f"?? Temizlenmiş dosya kaydediliyor: {OUTPUT_EXCEL}")
    df.to_excel(OUTPUT_EXCEL, index=False)
    print("? İŞLEM TAMAMLANDI! Artık bu yeni dosyayı Admin panelinden yükleyebilirsiniz.")

if __name__ == "__main__":
    fix_excel()
