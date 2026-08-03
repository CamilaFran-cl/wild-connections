const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, 'src', 'js');

function migrateJs() {
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js') && f !== 'supabase-client.js');
  
  for (const file of files) {
    const filePath = path.join(jsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let needsImport = false;
    
    if (content.includes('window.supabaseClient')) {
      content = content.replace(/window\.supabaseClient/g, 'supabase');
      needsImport = true;
    }

    if (content.includes('window.checkAuthSession')) {
      content = content.replace(/window\.checkAuthSession/g, 'checkAuthSession');
      needsImport = true;
    }

    if (needsImport) {
      // Add import to the top
      content = `import { supabase, checkAuthSession } from './supabase-client.js';\n\n` + content;
      fs.writeFileSync(filePath, content);
      console.log(`Migrated ${file}`);
    }
  }
}

migrateJs();
