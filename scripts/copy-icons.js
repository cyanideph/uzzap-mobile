const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '../../themes/default');
const targetDir = path.join(__dirname, '../assets/icons');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy all PNG files
fs.readdirSync(sourceDir).forEach(file => {
  if (file.endsWith('.png')) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${file} to ${targetPath}`);
  }
});

console.log('Icon copy completed!'); 