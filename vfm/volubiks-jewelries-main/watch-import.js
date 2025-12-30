#!/usr/bin/env node
// Watch the products file and import when it changes

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const fileToWatch = process.argv[2] || 'public/data/products.csv';
const root = process.cwd();
const watchedPath = path.join(root, fileToWatch);

console.log('Watching', watchedPath, 'for changes...');

fs.watch(watchedPath, (eventType, filename) => {
  if (eventType === 'change') {
    console.log('File changed, importing...');
    exec(`node scripts/import-products.js ${fileToWatch}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error importing:', error);
        return;
      }
      console.log('Import completed:', stdout);
    });
  }
});