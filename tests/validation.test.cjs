const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'../dist/');
const source=fs.readFileSync(base+'validation.js','utf8');
// Synthetic elements for input-boundary tests, not measured satellite data.
const fixture=()=>({OBJECT_NAME:'SYNTHETIC TEST OBJECT',NORAD_CAT_ID:123456,EPOCH:'2026-10-17T00:00:00.000',MEAN_MOTION:15,ECCENTRICITY:0.001,INCLINATION:51,RA_OF_ASC_NODE:20,ARG_OF_PERICENTER:30,MEAN_ANOMALY:40});
function validation(){const context={};vm.runInNewContext(source,context);return context.OrbitValidation;}
test('normalizes six-digit IDs, optional UTC suffix, and numeric fields',()=>{
  const result=validation().catalog([{...fixture(),EPOCH:'2026-10-17T00:00:00Z',MEAN_MOTION:'15'}])[0];
  assert.equal(result.NORAD_CAT_ID,'123456');assert.equal(result.EPOCH,'2026-10-17T00:00:00');assert.equal(result.BSTAR,0);
});
for(const id of ['25544"><img src=x onerror=alert(1)>','<b>1</b>',0,-1,'1e4','1.5','1234567890'])test('rejects invalid or markup NORAD ID: '+id,()=>{
  assert.throws(()=>validation().catalog([{...fixture(),NORAD_CAT_ID:id}]),/NORAD ID/);
});
for(const fields of [{MEAN_MOTION:0},{ECCENTRICITY:1},{INCLINATION:181},{EPOCH:'2026-02-30T00:00:00'},{MEAN_ANOMALY:Infinity},{REF_FRAME:'ITRF'},{TIME_SYSTEM:'TAI'},{MEAN_MOTION:''}])test('rejects invalid orbital fields '+JSON.stringify(fields),()=>{
  assert.throws(()=>validation().catalog([{...fixture(),...fields}]));
});
test('rejects duplicate IDs, empty input, and oversized catalogs',()=>{
  const api=validation();assert.throws(()=>api.catalog([fixture(),fixture()]),/重複/);
  assert.throws(()=>api.catalog([]));assert.throws(()=>api.catalog(new Array(api.MAX_OBJECTS+1).fill(fixture())));
});
function appHarness(){
  const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',hidden:true});return nodes.get(id);};
  class Vec{constructor(x,y,z){Object.assign(this,{x,y,z});}}Vec.ZERO=new Vec(0,0,0);
  const color={withAlpha(){return this;}};let removed=0;
  const context={console,Date,Math,Number,String,Map,document:{getElementById:node},window:{},
    satellite:{json2satrec:d=>d,propagate:()=>({position:{x:1,y:2,z:3},velocity:{x:1,y:2,z:3}}),gstime:()=>0,eciToEcf:p=>p,eciToGeodetic:()=>({height:500})},
    Cesium:{NearFarScalar:class{constructor(near,nearValue,far,farValue){Object.assign(this,{near,nearValue,far,farValue});}},Cartesian3:Vec,PointPrimitiveCollection:class{add(o){return o;}},Color:{BLACK:color,fromCssColorString:()=>color},JulianDate:{toDate:d=>d}},
    testViewer:{scene:{primitives:{remove(){removed++;},add:c=>c}},entities:{remove(){}},clock:{currentTime:new Date()}},
    OrbitCatalog:{},testFixture:fixture()};
  vm.createContext(context);vm.runInContext(source,context);
  vm.runInContext(fs.readFileSync(base+'app.js','utf8').replace(/init\(\);\s*$/,''),context);
  vm.runInContext('viewer=testViewer;',context);
  return {context,node,removed:()=>removed};
}
test('malicious imported ID is rejected before replacing the visible catalog',()=>{
  const h=appHarness();vm.runInContext('ingest([testFixture]);',h.context);
  const before=h.node('list').innerHTML;
  assert.throws(()=>vm.runInContext('ingest([{...testFixture,NORAD_CAT_ID:\'25544"><img src=x onerror=alert(1)>\'}]);',h.context),/NORAD ID/);
  assert.equal(h.node('list').innerHTML,before);assert.equal(h.removed(),0);
});
test('list and detail escape markup in names and IDs',()=>{
  const h=appHarness();vm.runInContext('ingest([{...testFixture,OBJECT_NAME:"<img src=x onerror=alert(1)>"}]);objects[0].id="<img src=x>";renderList();selected=objects[0];updateDetail(new Date());',h.context);
  for(const id of ['list','detail']){assert.doesNotMatch(h.node(id).innerHTML,/<img/);assert.match(h.node(id).innerHTML,/&lt;img/);}
});
test('standard sky assets are disabled and application license is distributed',()=>{
  assert.match(fs.readFileSync(base+'app.js','utf8'),/skyBox:false/);
  assert.equal(fs.readFileSync(base+'licenses/ORBIT-MIT.txt','utf8'),fs.readFileSync(path.join(__dirname,'../LICENSE'),'utf8'));
});
