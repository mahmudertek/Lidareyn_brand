
const https = require('https');

const url = 'https://galatacarsi-backend-api.onrender.com/api/products';

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            console.log(`Total Products Fetched: ${products.length}`);

            const betaProducts = products.filter(p => p.brand && p.brand.toLowerCase().includes('beta'));

            console.log(`\nProducts matching 'Beta': ${betaProducts.length}`);
            if (betaProducts.length > 0) {
                betaProducts.forEach(p => {
                    console.log(`- Found: [${p.brand}] ${p.name} (ID: ${p._id})`);
                });
            } else {
                console.log("No products found with brand 'Beta'.");

                console.log("\nAvailable Brands in DB:");
                const brands = [...new Set(products.map(p => p.brand))];
                console.log(brands.join(", "));
            }
        } catch (e) {
            console.error(e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
