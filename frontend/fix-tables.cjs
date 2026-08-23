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
      if (content.includes(match)) {
        content = content.replaceAll(match, replace);
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}
replaceInFiles('src', '<table className="w-full', '<table className="w-full min-w-[800px]');
replaceInFiles('src', 'grid-cols-2 lg:grid-cols-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4');
replaceInFiles('src', 'grid-cols-3 lg:grid-cols-4', 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4');
replaceInFiles('src', 'w-[400px]', 'w-full max-w-[400px]');
replaceInFiles('src', 'w-[500px]', 'w-full max-w-[500px]');
replaceInFiles('src', 'w-[600px]', 'w-full max-w-[600px]');
replaceInFiles('src', 'w-[800px]', 'w-full max-w-[800px]');
