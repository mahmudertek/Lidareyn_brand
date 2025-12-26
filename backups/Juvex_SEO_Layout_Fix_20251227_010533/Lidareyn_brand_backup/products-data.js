const galataProductsData = [];

function getProductById(id) {
    return galataProductsData.find(p => p.id === id);
}

function getAllProducts() {
    return galataProductsData;
}

function getProductsByCategory(category) {
    return galataProductsData.filter(p => p.category.includes(category));
}

// Expose to window for global access
window.galataProductsData = galataProductsData;
window.getProductById = getProductById;
window.getAllProducts = getAllProducts;
window.getProductsByCategory = getProductsByCategory;
