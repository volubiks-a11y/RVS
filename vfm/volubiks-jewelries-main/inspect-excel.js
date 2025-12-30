const XLSX = require('xlsx');
const path = require('path');

const filePath = path.resolve('public/data/products.xlsx');
const wb = XLSX.readFile(filePath);
console.log('Sheet names:', wb.SheetNames);
wb.SheetNames.forEach(name => {
  const ws = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  console.log(`Sheet "${name}": ${rows.length} rows`);
  if (rows.length > 0) {
    console.log('First row:', rows[0]);
    console.log('Last row:', rows[rows.length - 1]);
  }
});