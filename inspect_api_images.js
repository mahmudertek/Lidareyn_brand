
const API_URL = 'https://galatacarsi-backend-api.onrender.com/api';

async function testFetch() {
    try {
        const response = await fetch(`${API_URL}/products?limit=10`);
        const result = await response.json();
        if (result.success && result.data) {
            result.data.forEach(p => {
                console.log(`Product: ${p.name}`);
                console.log(`Image: ${p.mainImage || p.image}`);
                console.log('---');
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testFetch();
