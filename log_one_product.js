
const API_URL = 'https://galatacarsi-backend-api.onrender.com/api';

async function testFetch() {
    try {
        const response = await fetch(`${API_URL}/products?limit=1`);
        const result = await response.json();
        if (result.success && result.data && result.data[0]) {
            const p = result.data[0];
            const img = p.mainImage || p.image;
            console.log('NAME: ' + p.name);
            console.log('IMAGE_LENGTH: ' + (img ? img.length : 0));
            console.log('IMAGE_START: ' + (img ? img.substring(0, 100) : 'null'));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testFetch();
