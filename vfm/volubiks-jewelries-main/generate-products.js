const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, 'public', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

if (products.length > 0) {
  const template = products[0];
  const newProducts = [];
  for (let i = 1; i <= 30; i++) {
    const product = { ...template };
    product.id = String(i);
    product.name = `${template.name} ${i}`;
    product.slug = `${template.slug}-${i}`;
    // Keep other fields the same
    newProducts.push(product);
  }
  fs.writeFileSync(productsPath, JSON.stringify(newProducts, null, 2));
  console.log('Updated products.json with 30 products based on the first one.');
}