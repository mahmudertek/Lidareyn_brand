"""
Yeni Gelenler sayfasındaki React kodunu basit JavaScript ile değiştir
"""

file_path = r"c:\Users\pc\Desktop\Lidareyn_brand\yeni-gelenler.html"

# Dosyayı oku
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# React script başlangıcını bul
react_start_marker = "<!-- React Integration -->"
react_start = content.find(react_start_marker)

# Footer başlangıcını bul
footer_marker = "<!-- Footer -->"
footer_start = content.find(footer_marker)

if react_start != -1 and footer_start != -1:
    # React kısmını kes
    before_react = content[:react_start]
    after_react = content[footer_start:]
    
    # Yeni basit JavaScript kodu
    new_script = """    <!-- Product Grid Styles -->
    <style>
        .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;
            margin: 40px 0;
            padding: 0 20px;
        }
        
        .product-card {
            background: #fff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            position: relative;
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        
        .product-image {
            width: 100%;
            height: 320px;
            object-fit: cover;
            background: #f5f5f5;
        }
        
        .product-info {
            padding: 20px;
        }
        
        .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111;
            margin-bottom: 12px;
            min-height: 52px;
            line-height: 1.4;
        }
        
        .product-price {
            font-size: 1.4rem;
            font-weight: 700;
            color: #ff6b35;
            margin-bottom: 16px;
        }
        
        .product-actions {
            display: flex;
            gap: 10px;
        }
        
        .btn-action {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 600;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-cart {
            background: linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%);
            color: white;
        }
        
        .btn-cart:hover {
            background: linear-gradient(135deg, #e55a2b 0%, #cc4d23 100%);
            transform: scale(1.02);
        }
        
        .btn-favorite {
            background: #f8f8f8;
            color: #666;
            border: 2px solid #e0e0e0;
        }
        
        .btn-favorite:hover {
            background: #fff;
            color: #ff6b35;
            border-color: #ff6b35;
        }
    </style>

    <!-- Products Data -->
    <script src="products-data.js"></script>

    <!-- Product Grid Script -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('products-container');
            const products = window.productsData || generateSampleProducts();
            
            // Create grid
            const grid = document.createElement('div');
            grid.className = 'products-grid';
            
            products.forEach(product => {
                const card = createProductCard(product);
                grid.appendChild(card);
            });
            
            container.appendChild(grid);
        });
        
        function createProductCard(product) {
            const card = document.createElement('a');
            card.href = `urun-detay.html?id=${product.id}`;
            card.className = 'product-card';
            
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price}</div>
                    <div class="product-actions">
                        <button class="btn-action btn-cart" onclick="handleAddToCart(event, ${product.id})">
                            <i class="fa-solid fa-cart-plus"></i>
                            <span>Sepete Ekle</span>
                        </button>
                        <button class="btn-action btn-favorite" onclick="handleToggleFavorite(event, ${product.id})">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            
            return card;
        }
        
        function handleAddToCart(event, productId) {
            event.preventDefault();
            event.stopPropagation();
            
            const products = window.productsData || [];
            const product = products.find(p => p.id === productId);
            
            if (product && typeof window.addToCart === 'function') {
                window.addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    variant: 'Standart'
                });
            }
        }
        
        function handleToggleFavorite(event, productId) {
            event.preventDefault();
            event.stopPropagation();
            
            const products = window.productsData || [];
            const product = products.find(p => p.id === productId);
            
            if (product && typeof window.toggleFavorite === 'function') {
                window.toggleFavorite({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    variant: 'Standart'
                });
            }
        }
        
        function generateSampleProducts() {
            const products = [];
            const categories = ['Elektrikli El Aletleri', 'Ölçme Aletleri', 'El Aletleri', 'Bağlantı Elemanları'];
            
            for (let i = 1; i <= 24; i++) {
                products.push({
                    id: i,
                    name: `${categories[i % categories.length]} - Ürün ${i}`,
                    price: `${(Math.random() * 500 + 100).toFixed(2)} TL`,
                    image: `https://via.placeholder.com/320x320/ff6b35/ffffff?text=Urun+${i}`,
                    variant: 'Standart'
                });
            }
            return products;
        }
    </script>

    """
    
    # Yeni içeriği birleştir
    new_content = before_react + new_script + after_react
    
    # Dosyayı kaydet
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("✓ Yeni Gelenler sayfası başarıyla güncellendi!")
    print("  - React kodu kaldırıldı")
    print("  - Basit JavaScript grid eklendi")
    print("  - Sıradan product kartlar uygulandı")
else:
    print("✗ Marker bulunamadı!")
    print(f"  React start: {react_start}")
    print(f"  Footer start: {footer_start}")
