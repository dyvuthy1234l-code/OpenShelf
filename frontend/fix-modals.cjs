const fs = require('fs');
const path = require('path');
function replaceInFiles(dir, match, replace) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath, match, replace);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.match(match)) {
        content = content.replace(new RegExp(match, 'g'), replace);
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}
replaceInFiles('src', /className="w-full max-w-([^"]+) bg-white/g, 'className="w-[calc(100vw-24px)] md:w-full max-w-$1 max-h-[90vh] overflow-y-auto bg-white');
