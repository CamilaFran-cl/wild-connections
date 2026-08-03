const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function migrateHtml() {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure all script src="/js/..." have type="module"
    content = content.replace(/<script src="\/js\//g, '<script type="module" src="/js/');
    // Just in case any are still src="js/"
    content = content.replace(/<script src="js\//g, '<script type="module" src="/js/');
    // If it added type="module" twice
    content = content.replace(/<script type="module" type="module"/g, '<script type="module"');

    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
}

migrateHtml();
