const fs = require('fs');
const path = require('path');

const srcOld = path.join(__dirname, 'frontend/src');
const srcNew = path.join(__dirname, 'frontend_next/src');

// Map Vite pages to Next.js pages
const routes = {
    'Login.tsx': 'app/login/page.tsx',
    'Timer.tsx': 'app/timer/page.tsx',
    'Results.tsx': 'app/results/page.tsx',
    'Eval2.tsx': 'app/eval-2/page.tsx',
    'BetterLuck.tsx': 'app/better-luck/page.tsx',
};

function ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function processComponent(content) {
    let newContent = content;

    // Add use client if not present and if the component uses hooks or framer-motion
    if (!newContent.startsWith('"use client";') && !newContent.startsWith("'use client';")) {
        newContent = '"use client";\n\n' + newContent;
    }

    // Replace react-router-dom
    newContent = newContent.replace(/import\s+{([^}]*?)}\s+from\s+['"]react-router-dom['"];?/g, (match, imports) => {
        let nextImports = [];
        if (imports.includes('useNavigate')) {
            nextImports.push('useRouter');
        }
        return `import { ${nextImports.join(', ')} } from 'next/navigation';`;
    });

    // Replace useNavigate -> useRouter
    newContent = newContent.replace(/const\s+navigate\s*=\s*useNavigate\(\);/g, 'const router = useRouter();');

    // Replace navigate('/path') -> router.push('/path')
    newContent = newContent.replace(/navigate\((["'].*?["'])\)/g, 'router.push($1)');

    return newContent;
}

// 1. Copy Pages
for (const [oldName, newPath] of Object.entries(routes)) {
    const oldFile = path.join(srcOld, 'pages', oldName);
    const newFile = path.join(srcNew, newPath);
    ensureDir(newFile);

    let content = fs.readFileSync(oldFile, 'utf8');
    content = processComponent(content);
    fs.writeFileSync(newFile, content);
    console.log(`Migrated ${oldName}`);
}

// 2. Copy Context
const oldContext = path.join(srcOld, 'context/AuthContext.tsx');
const newContext = path.join(srcNew, 'context/AuthContext.tsx');
ensureDir(newContext);
let contextContent = fs.readFileSync(oldContext, 'utf8');
contextContent = processComponent(contextContent);
fs.writeFileSync(newContext, contextContent);

// 3. Copy Components
const componentsToCopy = ['TransitionLoader.tsx', 'ProtectedRoute.tsx'];
for (const comp of componentsToCopy) {
    const oldComp = path.join(srcOld, 'components', comp);
    const newComp = path.join(srcNew, 'components', comp);
    ensureDir(newComp);
    let compContent = fs.readFileSync(oldComp, 'utf8');
    compContent = processComponent(compContent);
    fs.writeFileSync(newComp, compContent);
}

// 4. Copy CSS
const oldCss = path.join(srcOld, 'index.css');
const newCss = path.join(srcNew, 'app/globals.css'); // Next.js standard
let cssContent = fs.readFileSync(oldCss, 'utf8');
const currentNextCss = fs.readFileSync(newCss, 'utf8');
fs.writeFileSync(newCss, currentNextCss + '\n' + cssContent);

// 5. Update layout.tsx
const layoutPath = path.join(srcNew, 'app/layout.tsx');
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
if (!layoutContent.includes('AuthProvider')) {
    // Add AuthProvider
    layoutContent = `import { AuthProvider } from '../context/AuthContext';\n` + layoutContent;
    layoutContent = layoutContent.replace('{children}', '<AuthProvider>{children}</AuthProvider>');
    fs.writeFileSync(layoutPath, layoutContent);
}

// 6. Update main page (redirect to login)
const pagePath = path.join(srcNew, 'app/page.tsx');
fs.writeFileSync(pagePath, `import { redirect } from "next/navigation";\n\nexport default function Home() {\n  redirect("/login");\n}`);

console.log("Migration script complete");
