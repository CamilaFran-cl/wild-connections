const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function migrateHtml() {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove Supabase CDN link
    content = content.replace(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>\n?\s*/g, '');

    // Add type="module" to all local js scripts
    // First remove cache busters ?v=2 if they exist
    content = content.replace(/src="js\/([^"]+)\?v=2"/g, 'src="/js/$1"');
    
    // Replace script src="js/..." with script type="module" src="/js/..."
    content = content.replace(/<script src="js\//g, '<script type="module" src="/js/');

    // Because we use absolute paths in Vite (e.g. /js/main.js), when Vite builds, it will resolve from root (which is src/).

    fs.writeFileSync(filePath, content);
    console.log(`Migrated ${file}`);
  }
}

migrateHtml();
