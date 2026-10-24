const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/catalog.js'),'utf8');
function setup(status=200,storageFails=false){
  const values=new Map();let calls=0;
  const sandbox={Map,Date,JSON,Error,navigator:{},AbortSignal:{timeout:()=>undefined},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>{if(storageFails)throw Error('Storage unavailable');values.set(k,v);}},fetch:async()=>{calls++;return {status,json:async()=>[{OBJECT_NAME:'fixture'}]};}};
  vm.runInNewContext(source,sandbox);
  return {api:sandbox.OrbitCatalog,values,calls:()=>calls};
}
test('loading the module never requests orbital data',()=>{assert.equal(setup().calls(),0);});
test('manual requests reuse the cached update and cannot force another request',async()=>{
  const s=setup();await s.api.request('stations');await s.api.request('stations');
  assert.equal(s.calls(),1);
});
test('GP and GPS use conservative update intervals',()=>{
  const s=setup();assert.equal(s.api.interval('stations'),7200000);assert.equal(s.api.interval('gps-ops'),86400000);
});
for(const status of [301,403,404,429,500,503])test('HTTP '+status+' stops all subsequent provider requests',async()=>{
  const s=setup(status);await assert.rejects(s.api.request('stations'),new RegExp('HTTP '+status));
  await assert.rejects(s.api.request('geo'),/取得を停止中/);assert.equal(s.calls(),1);
});
test('persistent storage failure prevents an unthrottled request',async()=>{
  const s=setup(200,true);await assert.rejects(s.api.request('stations'),/Storage unavailable/);assert.equal(s.calls(),0);
});
test('a recent attempt prevents another request even without cached payload',async()=>{
  const s=setup();s.values.set('orbit-stations-attempt',JSON.stringify({time:Date.now()}));
  await assert.rejects(s.api.request('stations'),/取得間隔/);assert.equal(s.calls(),0);
});
test('distribution keeps notices and removes ion image/key controls',()=>{
  const dir=require('node:path').join(__dirname,'../dist/');
  const html=fs.readFileSync(dir+'index.html','utf8'),app=fs.readFileSync(dir+'app.js','utf8');
  assert.doesNotMatch(html,/ACCESS TOKEN|ion\.cesium\.com|id="apply"|id="token"/);
  assert.doesNotMatch(app,/IonImageryProvider|fromAssetId|load\(true\)/);
  assert.match(html,/credits\.html/);assert.match(app,/useCatalogCache\(\);\}catch/);
  assert.match(fs.readFileSync(dir+'licenses/CesiumJS-LICENSE.txt','utf8'),/Apache License/);
  assert.match(fs.readFileSync(dir+'licenses/satellite-js-LICENSE.txt','utf8'),/MIT License/);
});
