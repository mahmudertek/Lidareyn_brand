const fs = require('fs');
const XLSX = require('xlsx');

const dir = 'c:/Users/pc/Desktop';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

files.forEach(file => {
    try {
        const wb = XLSX.readFile(`${dir}/${file}`);
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`Checking ${file} (${data.length} rows)...`);
        const found = data.filter(i => JSON.stringify(i).includes('434'));
        if (found.length > 0) {
            console.log(`!!! FOUND 434 IN ${file} !!! Count: ${found.length}`);
        }
    } catch (e) { }
});
