const pdf = require('pdf-parse');
console.log('Type of export:', typeof pdf);
if (typeof pdf === 'object') {
    console.log('Keys:', Object.keys(pdf));
}
