# Test script to update a product with barcode and salePrice
$token = $env:ADMIN_TOKEN
if (-not $token) {
    Write-Host "ADMIN_TOKEN environment variable not set. Please set it first."
    Write-Host "Example: `$env:ADMIN_TOKEN = 'your-token-here'"
    exit 1
}

$productId = "695273e2d484d4ebc96de197" # First product ID from API

$body = @{
    barcode     = "TEST123456"
    salePrice   = 999
    price       = 1950
    name        = "Beta Tools Test Product"
    brand       = "Beta"
    category    = "El Aletleri"
    description = "Test ürün - barkod ve indirimli fiyat testi"
    stock       = 100
    mainImage   = "https://placehold.co/400x400"
} | ConvertTo-Json

Write-Host "Sending update request..."
Write-Host "Product ID: $productId"
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "https://galatacarsi-backend-api.onrender.com/api/products/$productId" `
        -Method PUT `
        -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type"  = "application/json"
    } `
        -Body $body
    
    Write-Host "`nResponse:"
    $response | ConvertTo-Json -Depth 5
    
    Write-Host "`nChecking if barcode and salePrice were saved..."
    $check = Invoke-RestMethod -Uri "https://galatacarsi-backend-api.onrender.com/api/products/$productId"
    Write-Host "Barcode: $($check.data.barcode)"
    Write-Host "SalePrice: $($check.data.salePrice)"
    Write-Host "Price: $($check.data.price)"
}
catch {
    Write-Host "Error: $_"
    Write-Host $_.Exception.Message
}
