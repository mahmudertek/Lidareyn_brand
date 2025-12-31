# DEPLOY SONRASI TEST PLANI
# Backend deploy tamamlandıktan sonra yapılacak testler

## 1. Backend Schema Testi
Write-Host "=== BACKEND SCHEMA TEST ===`n"

$resp = Invoke-RestMethod -Uri "https://galatacarsi-backend-api.onrender.com/api/products/695273e2d484d4ebc96de197"

Write-Host "Ürün: $($resp.data.name)"
Write-Host "Barcode alanı: $(if($resp.data.PSObject.Properties.Name -contains 'barcode'){'✅ VAR'}else{'❌ YOK'})"
Write-Host "SalePrice alanı: $(if($resp.data.PSObject.Properties.Name -contains 'salePrice'){'✅ VAR'}else{'❌ YOK'})"
Write-Host "BrandShowcase alanı: $(if($resp.data.PSObject.Properties.Name -contains 'brandShowcase'){'✅ VAR'}else{'❌ YOK'})"

## 2. Admin Panel Testi
Write-Host "`n=== ADMIN PANEL TEST ===`n"
Write-Host "1. Admin panelini aç: http://localhost/admin/products.html"
Write-Host "2. Ctrl + F5 ile yenile (cache temizle)"
Write-Host "3. Bir ürünü düzenle"
Write-Host "4. 'El Aletleri' kategorisini seç"
Write-Host "5. Alt kategori dropdown'ının dolduğunu gör ✅"
Write-Host "6. Barkod gir: 00112233"
Write-Host "7. İndirimli fiyat gir: 500"
Write-Host "8. Kaydet butonuna bas"
Write-Host "9. F12 console'da 400 hatası OLMAMALI ✅"
Write-Host "10. Console'da şunu göreceksin:"
Write-Host "    💾 Kaydedilecek Veri (DETAYLI): { barcode: '00112233', salePrice: 500, ... }"

## 3. Canlı Site Testi
Write-Host "`n=== CANLI SITE TEST ===`n"
Write-Host "1. Kaydettiğin ürünün ID'sini al"
Write-Host "2. Canlı sitede ürün detay sayfasına git"
Write-Host "3. Barkod numarasının göründüğünü kontrol et ✅"
Write-Host "4. İndirimli fiyatın göründüğünü kontrol et ✅"
Write-Host "5. Eski fiyatın üzeri çizili olmalı ✅"

Write-Host "`n=== TEST TAMAMLANDI ===`n"
