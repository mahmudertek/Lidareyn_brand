
import os
import re

# Define the root directory for category pages
CATEGORIES_DIR = r"c:\Users\pc\Desktop\Lidareyn_brand\kategoriler"

# Template for the Hybrid View (Chips + Products)
# Note: Since we don't know the exact subcategories for every file,
# we will use a generic placeholder list for chips and products.
# In a real scenario, we would parse each file to extract its specific subcategories.
# For now, to "apply everywhere", we will inject a generic structure that the user can later customize.
# OR better, we will try to reuse the existing Hero Title to make it slightly dynamic.

HYBRID_TEMPLATE = """
    <section class="category-hero" style="padding: 2.5rem 0 1rem;">
        <div class="container">
            <div class="category-header">
                <div class="category-info">
                    <h1>{category_title}</h1>
                </div>
            </div>
        </div>
    </section>

    <!-- Hybrid: Subcategory Chips (Horizontal Scroll) -->
    <section class="subcategory-chips-section">
        <div class="container">
            <div class="subcategory-chips-wrapper">
                <a href="#" class="sub-chip"><i class="fa-solid fa-layer-group"></i> Alt Kategori 1</a>
                <a href="#" class="sub-chip"><i class="fa-solid fa-layer-group"></i> Alt Kategori 2</a>
                <a href="#" class="sub-chip"><i class="fa-solid fa-layer-group"></i> Alt Kategori 3</a>
                <a href="#" class="sub-chip"><i class="fa-solid fa-layer-group"></i> Alt Kategori 4</a>
                <a href="#" class="sub-chip"><i class="fa-solid fa-layer-group"></i> Alt Kategori 5</a>
            </div>
        </div>
    </section>

    <!-- Hybrid: Product Listing -->
    <section class="category-products-section" style="padding: 20px 0;">
        <div class="container">
            <!-- Simple Filter/Sort Bar -->
            <div class="listing-controls" style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: center;">
                <span class="product-count" style="font-size: 14px; color: #666;">Popüler Ürünler</span>
                <div class="sort-options">
                    <select style="border: 1px solid #ddd; padding: 8px; border-radius: 6px;">
                        <option>Önerilen Sıralama</option>
                        <option>En Düşük Fiyat</option>
                        <option>En Yüksek Fiyat</option>
                    </select>
                </div>
            </div>

            <div class="products-grid">
                <!-- Product Card 1 -->
                <div class="product-card">
                    <div class="product-image">
                        <span class="badge new">Yeni</span>
                        <img src="https://placehold.co/300x300/f5f5f5/333?text=Boya+1" alt="Ürün 1">
                        <div class="card-actions">
                            <button class="action-btn" aria-label="Favori"><i class="fa-regular fa-heart"></i></button>
                            <button class="action-btn" aria-label="Sepet"><i class="fa-solid fa-cart-shopping"></i></button>
                        </div>
                    </div>
                    <div class="product-info">
                        <span class="brand">Marka A</span>
                        <h3 class="title">Örnek Ürün Başlığı 1</h3>
                        <div class="price-wrapper">
                            <span class="price">1,250.00 TL</span>
                        </div>
                    </div>
                </div>

                <!-- Product Card 2 -->
                <div class="product-card">
                    <div class="product-image">
                        <img src="https://placehold.co/300x300/f5f5f5/333?text=Boya+2" alt="Ürün 2">
                        <div class="card-actions">
                            <button class="action-btn" aria-label="Favori"><i class="fa-regular fa-heart"></i></button>
                            <button class="action-btn" aria-label="Sepet"><i class="fa-solid fa-cart-shopping"></i></button>
                        </div>
                    </div>
                    <div class="product-info">
                        <span class="brand">Marka B</span>
                        <h3 class="title">Örnek Ürün Başlığı 2</h3>
                        <div class="price-wrapper">
                            <span class="price">450.00 TL</span>
                        </div>
                    </div>
                </div>

                 <!-- Product Card 3 -->
                 <div class="product-card">
                    <div class="product-image">
                        <img src="https://placehold.co/300x300/f5f5f5/333?text=Boya+3" alt="Ürün 3">
                        <div class="card-actions">
                            <button class="action-btn" aria-label="Favori"><i class="fa-regular fa-heart"></i></button>
                            <button class="action-btn" aria-label="Sepet"><i class="fa-solid fa-cart-shopping"></i></button>
                        </div>
                    </div>
                    <div class="product-info">
                        <span class="brand">Marka C</span>
                        <h3 class="title">Örnek Ürün Başlığı 3</h3>
                        <div class="price-wrapper">
                            <span class="price">890.00 TL</span>
                        </div>
                    </div>
                </div>

                 <!-- Product Card 4 -->
                 <div class="product-card">
                    <div class="product-image">
                        <span class="badge sale">%20</span>
                        <img src="https://placehold.co/300x300/f5f5f5/333?text=Boya+4" alt="Ürün 4">
                        <div class="card-actions">
                            <button class="action-btn" aria-label="Favori"><i class="fa-regular fa-heart"></i></button>
                            <button class="action-btn" aria-label="Sepet"><i class="fa-solid fa-cart-shopping"></i></button>
                        </div>
                    </div>
                    <div class="product-info">
                        <span class="brand">Marka D</span>
                        <h3 class="title">Örnek Ürün Başlığı 4</h3>
                        <div class="price-wrapper">
                            <span class="old-price">1,200.00 TL</span>
                            <span class="price">960.00 TL</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
"""

# Regex pattern to match the content between <div class="breadcrumb">...</div> 
# and the end of the content area (before footer or similar, but simplified: 
# we replace category-hero and subcategories-section).
# We look for <section class="category-hero">...</section> AND <section class="subcategories-section">...</section>
# and replace them with our new template.

def process_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract Title if possible
        title_match = re.search(r'<h1>(.*?)<\/h1>', content)
        category_title = title_match.group(1) if title_match else "Kategori"

        # Construct new content
        new_section_content = HYBRID_TEMPLATE.format(category_title=category_title)

        # Regex to find the block to replace.
        # It usually starts with <section class="category-hero"> and ends after <section class="subcategories-section">... </section>
        # We need to be careful not to delete too much.
        # Strategy: Find the start of category-hero and the end of subcategories-section.
        
        start_marker = '<section class="category-hero"'
        end_marker = '</section>' # This is risky. 
        
        # Safer regex: Match the Hero section fully, then the Subcategories section fully.
        pattern = r'(<section class="category-hero".*?<\/section>).*?(<section class="subcategories-section">.*?<\/section>)'
        
        # Check if the file actually has these sections
        if '<section class="subcategories-section">' not in content:
            print(f"Skipping {file_path}: No subcategories-section found.")
            return

        # Perform replacement
        # We replace the entire block (hero + optional generated space + subcategories) with our new template
        # We use re.DOTALL to match across newlines
        
        new_content = re.sub(
            r'<section class="category-hero".*?<\/section>\s*<section class="subcategories-section">.*?<\/section>', 
            new_section_content, 
            content, 
            flags=re.DOTALL
        )
        
        # If the regex didn't change anything (maybe whitespace issues), try a slightly looser approach or manual check
        if content == new_content:
             # Fallback: maybe there is extra content between them?
             # Let's try to match purely from start of hero to end of subcategories
             pass

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print(f"Updated: {file_path}")

    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    if not os.path.exists(CATEGORIES_DIR):
        print("Categories directory not found.")
        return

    for filename in os.listdir(CATEGORIES_DIR):
        if filename.endswith(".html"):
            # Skip the one we already did manually if we want, or overwrite it to be consistent (hirdavat-el-aletleri.html)
            # Actually, hirdavat-el-aletleri.html already has the NEW structure, so the regex won't match "subcategories-section"
            # because we removed it! So it will safely skip itself.
            process_file(os.path.join(CATEGORIES_DIR, filename))

if __name__ == "__main__":
    main()
