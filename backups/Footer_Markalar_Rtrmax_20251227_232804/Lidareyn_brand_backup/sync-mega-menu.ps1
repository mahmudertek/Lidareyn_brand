# 9 kategori sayfasının mega menüsünü index.html ile senkronize et

$indexContent = Get-Content "C:\Users\pc\Desktop\Lidareyn_brand\index.html" -Raw -Encoding UTF8

# index.html'den mega menü bölümünü al (satır 105-434)
$lines = Get-Content "C:\Users\pc\Desktop\Lidareyn_brand\index.html" -Encoding UTF8
$megaMenuLines = $lines[104..434] -join "`r`n"

# Kategori sayfaları için path'leri düzelt
$megaMenuForCategories = $megaMenuLines -replace 'href="kategoriler/', 'href="'
$megaMenuForCategories = $megaMenuForCategories -replace 'href="index.html', 'href="../index.html'
$megaMenuForCategories = $megaMenuForCategories -replace 'href="yeni-gelenler.html', 'href="../yeni-gelenler.html'
$megaMenuForCategories = $megaMenuForCategories -replace 'href="populer.html', 'href="../populer.html'

# 9 kategori listesi
$categories = @(
    "elektrikli-el-aletleri.html",
    "olcme-ve-kontrol-aletleri.html",
    "el-aletleri.html",
    "nalbur-yapi-malzemeleri.html",
    "asindirici-kesici.html",
    "yapi-kimyasallari.html",
    "kaynak-malzemeleri.html",
    "hirdavat-el-aletleri.html",
    "is-guvenligi-ve-calisma-ekipmanlari.html"
)

foreach ($cat in $categories) {
    $filePath = "C:\Users\pc\Desktop\Lidareyn_brand\kategoriler\$cat"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Mevcut mega menüyü bul ve değiştir
        # Pattern: <div class="mega-menu">...</ul></div> (ilk eşleşen)
        $pattern = '(?s)<div class="mega-menu">.*?</ul>\s*</div>'
        
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $megaMenuForCategories
            $content | Out-File $filePath -Encoding UTF8 -NoNewline
            Write-Host "Updated: $cat"
        } else {
            Write-Host "Pattern not found in: $cat"
        }
    } else {
        Write-Host "File not found: $cat"
    }
}

Write-Host "`nDone! 9 category pages updated."
