
const API_URL = 'https://galatacarsi-backend-api.onrender.com/api';

async function verify() {
    try {
        const response = await fetch(`${API_URL}/products?limit=1`);
        const result = await response.json();
        if (result.success && result.data && result.data[0]) {
            const img = result.data[0].mainImage || result.data[0].image;
            if (img) {
                console.log('Full Start: ' + img.substring(0, 50));
                console.log('Has Data Prefix: ' + img.startsWith('data:'));
                console.log('Is likely Base64: ' + /^[A-Za-z0-9+/=]+$/.test(img.substring(0, 100)));
            }
        }
    } catch (e) {
        console.error(e);
    }
}
verify();
