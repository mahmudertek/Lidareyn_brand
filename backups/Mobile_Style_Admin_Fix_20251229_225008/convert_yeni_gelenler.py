"""
Yeni Gelenler sayfasını tilted kartlardan sıradan kartlara çevir
"""

import re

file_path = r"c:\Users\pc\Desktop\Lidareyn_brand\yeni-gelenler.html"

# Dosyayı oku
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Eski React tilted card kodunu bul ve sil
# <script> ile </script> arasındaki React kodunu bul
react_start = content.find("<script crossorigin")
react_end = content.find("</script>", react_start)

if react_start != -1 and react_end != -1:
    # Bir sonraki script tag'ini de bul (tilted card logic)
    next_script_start = content.find("<script>", react_end)
    next_script_end = content.find("</script>", next_script_start)
    
    # Her iki script'i de kaldır
    before_react = content[:react_start]
    after_second_script = content[next_script_end + len("</script>"):]
    
    # Yeni basit HTML yapısı
    new_content_section = """
    <!-- Yeni Gelenler Ürünler -->
    <main class="main-content">
        <div class="container">
            <div class="page-header">
                <h1>Yeni Gelenler</h1>
                <p>En yeni ürünlerimizi keşfedin</p>
            </div>
            
            <div id="products-grid" class="products-grid">
                <!-- Ürünler JavaScript ile yüklenecek -->
            </div>
        </div>
    </main>

    <style>
        .page-header {
            text-align: center;
            margin: 40px 0;
        }
        
        .page-header h1 {
            font-size: 2.5rem;
            color: #111;
            margin-bottom: 10px;
        }
        
        .page-header p {
            font-size: 1.1rem;
            color: #666;
        }
        
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }
        
        .product-card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
            position: relative;
        }
        
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .product-card img {
            width: 100%;
            height: 300px;
            object-fit: cover;
        }
        
        .product-info {
            padding: 20px;
        }
        
        .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111;
            margin-bottom: 10px;
            min-height: 50px;
        }
        
        .product-price {
            font-size: 1.3rem;
            font-weight: 700;
            color: #ff6b35;
            margin-bottom: 15px;
        }
        
        .product-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-add-cart, .btn-favorite {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s;
        }
        
        .btn-add-cart {
            background: #ff6b35;
            color: white;
        }
        
        .btn-add-cart:hover {
            background: #e55a2b;
        }
        
        .btn-favorite {
            background: #f0f0f0;
            color: #666;
        }
        
        .btn-favorite:hover {
            background: #e0e0e0;
            color: #ff6b35;
        }
    </style>

    <script>
        // Ürünleri yükle
        document.addEventListener('DOMContentLoaded', () => {
            const grid = document.getElementById('products-grid');
            const products = window.productsData || [];
            
            // Eğer ürün yoksa örnek ürünler oluştur
            const displayProducts = products.length > 0 ? products : generateSampleProducts();
            
            displayProducts.forEach(product => {
                const card = createProductCard(product);
                grid.appendChild(card);
            });
        });
        
        function createProductCard(product) {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            card.innerHTML = `
                <a href="urun-detay.html?id=${product.id}" style="text-decoration: none; color: inherit;">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">${product.price}</div>
                        <div class="product-actions">
                            <button class="btn-add-cart" onclick="event.preventDefault(); event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                <i class="fa-solid fa-cart-plus"></i> Sepete Ekle
                            </button>
                            <button class="btn-favorite" onclick="event.preventDefault(); event.stopPropagation(); toggleFavorite(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                <i class="fa-regular fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </a>
            `;
            
            return card;
        }
        
        function generateSampleProducts() {
            const products = [];
            for (let i = 1; i <= 24; i++) {
                products.push({
                    id: i,
                    name: `Yeni Ürün ${i}`,
                    price: `${(Math.random() * 500 + 100).toFixed(2)} TL`,
                    image: `https://via.placeholder.com/300x300?text=Ürün+${i}`,
                    variant: 'Standart'
                });
            }
            return products;
        }
    </script>
    """
    
    # Yeni içeriği birleştir
    new_content = before_react + new_content_section + after_second_script
    
    # Dosyayı kaydet
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("✓ Yeni Gelenler sayfası başarıyla güncellendi!")
    print("  - Tilted kartlar kaldırıldı")
    print("  - Sıradan product kartlar eklendi")
    print("  - Responsive grid layout uygulandı")
else:
    print("✗ React script bulunamadı!")
