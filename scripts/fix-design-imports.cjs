const fs = require('fs');
const path = require('path');
const root = path.resolve('src/report-external');
const exts = new Set(['.ts','.tsx','.js','.jsx']);
const files = [];
(function walk(p){ for(const f of fs.readdirSync(p)){ const fp = path.join(p,f); const st = fs.statSync(fp); if(st.isDirectory()) walk(fp); else if(exts.has(path.extname(f))) files.push(fp); } })(root);
let rewrites = 0;
for (const f of files){ let s = fs.readFileSync(f,'utf8');
  const before = s;
  s = s.replace(/(from\s+['"])([^'"\n]+?)@\d[^'"\n]*(['"])/g, '$1$2$3');
  s = s.replace(/(import\s+[^'"\n]+?from\s+['"])([^'"\n]+?)@\d[^'"\n]*(['"])/g, '$1$2$3');
  s = s.replace(/(require\(\s*['"])([^'"\n]+?)@\d[^'"\n]*(['"]\s*\))/g, '$1$2$3');
  if (s !== before){ fs.writeFileSync(f,s); rewrites++; }
}
console.log('Rewrote files:', rewrites, 'of', files.length);
