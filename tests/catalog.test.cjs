const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/catalog.js'),'utf8');
function setup(status=200){let calls=[];const sandbox={Date,Error,fetch:async(url)=>{calls.push(url);return {status,json:async()=>({metadata:{referenceTime:'2026-10-24T02:17:21Z',count:3},objects:[{OBJECT_TYPE:'PAYLOAD'},{OBJECT_TYPE:'DEBRIS'},{OBJECT_TYPE:'ROCKET BODY'}]})};}};vm.runInNewContext(source,sandbox);return {api:sandbox.OrbitCatalog,calls};}
test('catalog module does not fetch until requested',()=>assert.equal(setup().calls.length,0));
test('all groups and concurrent requests share one bundled download, never an external API',async()=>{const s=setup();const [all,debris]=await Promise.all([s.api.request('all'),s.api.request('debris')]);assert.equal(all.data.length,3);assert.equal(debris.data.length,1);assert.equal((await s.api.request('rocket')).data.length,1);assert.deepEqual(s.calls,['data/snapshot.json']);assert.equal(s.api.cached('all').data.length,3);});
test('a failed snapshot load is not retried automatically',async()=>{const s=setup(404);await assert.rejects(s.api.request('all'),/HTTP 404/);await assert.rejects(s.api.request('all'));assert.equal(s.calls.length,1);});
test('unsupported groups cannot issue a request',async()=>{const s=setup();await assert.rejects(s.api.request('active'));assert.equal(s.calls.length,0);});
test('startup is frozen at the snapshot date and reset restores that date',()=>{const app=fs.readFileSync(path.join(__dirname,'../dist/app.js'),'utf8');assert.match(app,/shouldAnimate:false/);assert.match(app,/await load\(\);\}catch/);assert.match(app,/JulianDate.fromDate\(referenceTime\)/);assert.doesNotMatch(app,/JulianDate.now\(/);const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');assert.match(html,/<option value="all" selected>/);assert.doesNotMatch(html,/celestrak/i);});
