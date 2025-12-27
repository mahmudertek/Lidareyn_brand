
const https = require('https');
const fs = require('fs');

const url = 'https://galatacarsi-backend-api.onrender.com/api/products';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('debug_products.json', data);
        console.log('Saved product data to debug_products.json');

        // Also analyze it immediately
        try {
            const products = JSON.parse(data);
            const betaProducts = products.filter(p => p.brand && p.brand.toLowerCase().includes('beta'));
            console.log("Total Products:", products.length);
            console.log("Beta Products Found:", betaProducts.length);
            betaProducts.forEach(p => console.log(`ID: ${p._id}, Name: ${p.name}, Brand: ${p.brand}`));
        } catch (e) { console.error("Invalid JSON"); }
    });
}).on('error', err => console.error(err));
