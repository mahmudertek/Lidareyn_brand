
const fs = require('fs');
const pdf = require('pdf-parse');

console.log('PDF keys:', Object.keys(pdf));
if (pdf.default) console.log('Type of pdf.default:', typeof pdf.default);
