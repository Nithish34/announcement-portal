const fs = require('fs');
const path = require('path');

const srcNew = path.join(__dirname, 'frontend_next/src');

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = getFiles(srcNew);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    // replace `from '../context/...` with `from '@/context/...`
    // replace `from '../../context/...` with `from '@/context/...`
    // etc
    let updated = content.replace(/from\s+['"]\.\.\/(?:.*\/)?(context|components|pages)\/(.*?)['"]/g, "from '@/$1/$2'");
    updated = updated.replace(/from\s+['"]\.\.\/\.\.\/(?:.*\/)?(context|components|pages)\/(.*?)['"]/g, "from '@/$1/$2'");
    if (content !== updated) {
        fs.writeFileSync(file, updated);
        console.log("Updated imports in", file);
    }
}
