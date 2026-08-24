const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  const regex = /(<(?:motion\.)?div[^>]*?className=(['"])[^>]*?bg-white[^>]*?max-w-[^>]*?\2[^>]*?)>/g;
  
  content = content.replace(regex, (match, p1) => {
    if (match.includes('role="dialog"')) return match;
    return p1 + ' role="dialog" aria-modal="true">';
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Added aria roles to', file);
    updatedCount++;
  }
});
console.log('Total files updated: ' + updatedCount);
