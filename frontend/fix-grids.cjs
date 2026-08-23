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
        console.log('Updated grids in', fullPath);
      }
    }
  }
}
// Replace grid-cols-2 or grid-cols-3 that don't have md:
replaceInFiles('src', /className="([^"]*)grid grid-cols-2([^"]*)"/g, 'className="$1grid grid-cols-1 md:grid-cols-2$2"');
replaceInFiles('src', /className="([^"]*)grid grid-cols-3([^"]*)"/g, 'className="$1grid grid-cols-1 md:grid-cols-3$2"');
