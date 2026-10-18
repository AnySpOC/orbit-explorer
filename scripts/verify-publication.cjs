const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const normalize=s=>s.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim()+'\n';
const lock=JSON.parse(read('licenses.lock.json'));
for(const item of lock.thirdParty){
  const digest=crypto.createHash('sha256').update(normalize(read(item.file))).digest('hex');
  assert.equal(digest,item.normalizedSha256,item.name+' license notice changed; review against upstream before publishing');
}
assert.equal(normalize(read('LICENSE')),normalize(read('dist/licenses/ORBIT-MIT.txt')));
assert.match(read('dist/app.js'),/skyBox:false/);
assert.doesNotMatch(read('dist/app.js'),/IonImageryProvider|fromAssetId|fromWorldTerrain/);
assert.match(read('dist/credits.html'),/licenses\/CesiumJS-LICENSE\.txt/);
assert.match(read('dist/credits.html'),/licenses\/satellite-js-LICENSE\.txt/);
assert.match(read('dist/credits.html'),/licenses\/ORBIT-MIT\.txt/);
const html=read('dist/index.html');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const url=match[1];if(/^(https?:|data:)/.test(url))continue;
  assert.ok(!url.startsWith('/'),'Use project-relative URLs for GitHub Pages');
  assert.ok(fs.existsSync(path.join(root,'dist',url)),'Missing linked resource: '+url);
}
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);assert.ok(!entry.isSymbolicLink(),'Do not ship symbolic links');
  if(entry.isDirectory())walk(file);else files.push(file);
}}
walk(path.join(root,'dist'));
const secretPatterns=[/-----BEGIN [A-Z ]*PRIVATE KEY-----/,/gh[pousr]_[A-Za-z0-9]{20,}/,/art_v2_[A-Za-z0-9_]+/];
for(const file of files){
  assert.ok(!/\.json$/i.test(file),'Do not bundle orbital data JSON in the public app');
  assert.ok(!secretPatterns.some(re=>re.test(fs.readFileSync(file,'utf8'))),'Potential secret in public artifact');
}
assert.ok(!fs.existsSync(path.join(root,'dist','.openai')));
assert.ok(!fs.existsSync(path.join(root,'dist','.git')));
console.log('Publication verification passed: '+files.length+' static files; license hashes, relative links, and exclusions checked.');
