const fs = require('fs');
const path = require('path');

const srcNew = path.join(__dirname, 'frontend_next/src');

const pages = [
    'app/login/page.tsx',
    'app/timer/page.tsx',
    'app/results/page.tsx',
    'app/eval-2/page.tsx',
    'app/better-luck/page.tsx',
];

for (const page of pages) {
    const file = path.join(srcNew, page);
    let content = fs.readFileSync(file, 'utf8');

    // change `export function Name()` to `export default function Name()`
    content = content.replace(/export\s+function\s+([A-Za-z0-9_]+)\s*\(/g, 'export default function $1(');

    // also replace any lingering react-router-dom Link if any.
    content = content.replace(/import\s+{([^}]*?Link[^}]*?)}\s+from\s+['"]react-router-dom['"];?/g, "import Link from 'next/link';");

    fs.writeFileSync(file, content);
    console.log(`Updated default export on ${page}`);
}
