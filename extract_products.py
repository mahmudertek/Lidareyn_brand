#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GP_ENG_2025.pdf'den ürün bilgilerini ve PriceList_2025_GBP.pdf'den fiyatları çıkarır
"""

import pdfplumber
import re
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# İngilizce-Türkçe çeviri sözlüğü
translations = {
    "spare tip for automatic centre punch": "Otomatik zımba yedek uç",
    "flat chisels, ribbed type": "Düz keskiler, nervürlü tip",
    "cape chisel, ribbed type": "Sivri uçlu keskiler, nervürlü tip",
    "with hand guard": "el korumalı",
    "letter punches": "Harf zımbaları",
    "number punches": "Rakam zımbaları",
    "spare hand guard": "Yedek el koruması",
    "spare hand guards": "Yedek el korumaları",
    "cape chisels": "Sivri uçlu keskiler",
    "combination wrenches": "Kombinasyon anahtarları",
    "open and offset ring ends": "Açık ve ofset halka uçlu",
    "bright chrome-plated": "Parlak krom kaplı",
    "long series": "Uzun seri",
    "heavy series": "Ağır seri",
    "single open end wrenches": "Tek açık uçlu anahtarlar",
    "double open end wrenches": "Çift açık uçlu anahtarlar",
    "open end slogging wrenches": "Açık uçlu balyoz anahtarları",
    "ring slogging wrenches": "Halka balyoz anahtarları",
    "double swivel end socket wrenches": "Çift mafsallı lokma anahtarları",
    "half-moon ring wrenches": "Yarım ay halka anahtarları",
    "double ended deep offset ring wrenches": "Çift uçlu derin ofset halka anahtarları",
    "double ended flat ring wrenches": "Çift uçlu düz halka anahtarları",
    "extra-long series": "Ekstra uzun seri",
    "heavy duty offset ring wrenches": "Ağır hizmet ofset halka anahtarları",
    "flare nut open ring wrenches": "Fren borusu anahtarları",
    "double-ended straight wrenches": "Çift uçlu düz anahtarlar",
    "for Torx head screws": "Torx başlı vidalar için",
    "offset hexagon key wrenches": "Ofset altıgen anahtar",
    "chrome-plated": "Krom kaplı",
    "burnished": "Parlatılmış",
    "ball head": "Bilyalı uç",
    "with high torque handles": "Yüksek torklu saplar ile",
    "hook wrenches with square noses": "Kare uçlu kanca anahtarlar",
    "hook wrenches with round noses": "Yuvarlak uçlu kanca anahtarlar",
    "for ring nuts": "Segman somunları için",
    "round pin wrench": "Yuvarlak pimli anahtar",
    "spare pins": "Yedek pimler",
    "adjustable wrenches with scales": "Ölçekli ayarlanabilir anahtarlar",
    "wide opening": "Geniş açıklık",
    "short series": "Kısa seri",
    "reversible jaw": "Çevrilebilir çene",
    "ratchet opening single ended": "Cırcırlı tek uçlu",
    "bi-hex wrenches": "Çift altıgen anahtarlar",
    "bit holder adaptor": "Uç tutucu adaptör",
    "quick release adaptor": "Hızlı çıkarma adaptörü",
    "ratcheting combination wrenches": "Cırcırlı kombinasyon anahtarları",
    "straight series": "Düz seri",
    "small double open end wrenches": "Küçük çift açık uçlu anahtarlar",
    "tubes": "Borular",
    "double-ended offset ring wrench": "Çift uçlu ofset halka anahtar",
    "for scaffolding bolts": "İskele cıvataları için",
    "ratcheting double-ended offset ring wrenches": "Cırcırlı çift uçlu ofset halka anahtarlar",
    "with screw holding system": "Vida tutma sistemi ile",
    "extra-long model": "Ekstra uzun model",
    "coloured": "Renkli",
    "for Tamper Resistant Torx head screws": "Güvenlikli Torx başlı vidalar için",
    "offset key wrenches with handles": "Saplı ofset anahtarlar",
    "with XZN profile": "XZN profilli",
    "spare nose": "Yedek uç",
    "adapters for ratchet wrenches": "Cırcır anahtarları için adaptörler",
    "set of": "Takım",
    "wrenches": "anahtarlar",
    "wrench": "anahtar",
    "screwdrivers": "tornavidalar",
    "screwdriver": "tornavida",
    "pliers": "pense",
    "hammers": "çekiçler",
    "hammer": "çekiç",
    "chisels": "keskiler",
    "chisel": "keski",
    "bits": "uçlar",
    "bit": "uç",
    "sockets": "lokmalar",
    "socket": "lokma",
    "extensions": "uzatmalar",
    "extension": "uzatma",
    "ratchets": "cırcırlar",
    "ratchet": "cırcır",
    "torque": "tork",
    "impact": "darbe",
    "insulated": "yalıtımlı",
    "magnetic": "manyetik",
    "universal": "üniversal",
    "professional": "profesyonel",
    "precision": "hassas",
    "standard": "standart",
    "compact": "kompakt",
    "support": "destek",
}

def translate_name(english_name):
    """İngilizce ürün ismini Türkçeye çevir"""
    result = english_name
    # Önce uzun ifadeleri çevir
    sorted_translations = sorted(translations.items(), key=lambda x: len(x[0]), reverse=True)
    for eng, tr in sorted_translations:
        result = re.sub(re.escape(eng), tr, result, flags=re.IGNORECASE)
    return result

def extract_products_from_pricelist(pdf_path, max_pages=75):
    """PriceList PDF'den ürün kodları ve fiyatları çıkar"""
    products = {}
    
    with pdfplumber.open(pdf_path) as pdf:
        for i in range(9, min(max_pages, len(pdf.pages))):
            page = pdf.pages[i]
            text = page.extract_text()
            if not text:
                continue
            
            # SKU ve fiyat pattern'leri
            # Format: fiyat adet SKU (örn: 8.30 5 000421005)
            pattern = r'(\d+\.?\d*)\s+(\d+)\s+(0\d{8})'
            matches = re.findall(pattern, text)
            
            for match in matches:
                price_gbp = float(match[0])
                quantity = int(match[1])
                sku = match[2]
                
                # Fiyatı 41 ile çarp (GBP -> TRY)
                price_try = round(price_gbp * 41, 2)
                
                products[sku] = {
                    'sku': sku,
                    'price_gbp': price_gbp,
                    'price_try': price_try,
                    'quantity': quantity
                }
    
    return products

def extract_product_names_from_gp(pdf_path, max_pages=75):
    """GP_ENG PDF'den ürün isimlerini çıkar"""
    product_names = {}
    current_product_name = ""
    
    with pdfplumber.open(pdf_path) as pdf:
        for i in range(9, min(max_pages, len(pdf.pages))):
            page = pdf.pages[i]
            text = page.extract_text()
            if not text:
                continue
            
            lines = text.split('\n')
            
            for line in lines:
                # Ürün başlığı pattern'i (|* ile başlayan satırlar)
                if '|*' in line:
                    # Ürün kodunu çıkar
                    code_match = re.search(r'\|?\*?\s*(\d+[A-Z]*/?[A-Z0-9]*)', line)
                    if code_match:
                        current_product_code = code_match.group(1)
                
                # SKU pattern'i
                sku_match = re.search(r'(0\d{8})', line)
                if sku_match:
                    sku = sku_match.group(1)
                    # Satırdan boyut/varyant bilgisi çıkar
                    size_match = re.search(r'(\d+(?:x\d+)?(?:,\d+)?)\s+', line)
                    size = size_match.group(1) if size_match else ""
                    
                    if sku not in product_names:
                        product_names[sku] = {
                            'size': size,
                            'line': line
                        }
    
    return product_names

# Ana çalıştırma
if __name__ == "__main__":
    pricelist_path = "/mnt/uploads/ses_3b3d28946ffe2yh5rSr2HGXvow/PriceList_2025_GBP.pdf"
    gp_path = "/mnt/workspace/258iT5oxNEFM9USsyJp4GKR9LsRrdMyu63pcuFxepD6i7PR/GP_ENG_2025.pdf"
    
    print("Fiyat listesi çıkarılıyor...")
    products = extract_products_from_pricelist(pricelist_path, 75)
    print(f"Toplam {len(products)} ürün bulundu")
    
    # İlk 10 ürünü göster
    for i, (sku, data) in enumerate(list(products.items())[:10]):
        print(f"{sku}: {data['price_gbp']} GBP -> {data['price_try']} TRY")
