const fs = require('fs');
const path = require('path');
const rootPkgPath = path.resolve('package.json');
const refPkgPath = path.resolve('design-ref/report-page/package.json');
const root = JSON.parse(fs.readFileSync(rootPkgPath,'utf8'));
const ref = JSON.parse(fs.readFileSync(refPkgPath,'utf8'));
root.dependencies ||= {};
for (const [name, ver] of Object.entries(ref.dependencies || {})){
  if (!root.dependencies[name]){
    root.dependencies[name] = ver;
  }
}
fs.writeFileSync(rootPkgPath, JSON.stringify(root, null, 2));
console.log('Merged missing dependencies from design-ref into root package.json');
