/* Copyright (c) 2026 AnySpOC. MIT License; see licenses/ORBIT-MIT.txt. */
'use strict';
const $=id=>document.getElementById(id);
let viewer,objects=[],selected=null,orbit=null,lastTick=0,readSequence=0,referenceTime=new Date('2026-10-24T02:17:21Z');
const colors={normal:'#6ce6bf',debris:'#ee9573',selected:'#ffe099'};
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function state(message){$('status').textContent=message;}
function calculate(o,date){try{const pv=satellite.propagate(o.rec,date);if(!pv||!pv.position)return null;const gmst=satellite.gstime(date),ecf=satellite.eciToEcf(pv.position,gmst),gd=satellite.eciToGeodetic(pv.position,gmst);if(!Number.isFinite(gd.height)||gd.height<0)return null;return {pos:new Cesium.Cartesian3(ecf.x*1000,ecf.y*1000,ecf.z*1000),gd,pv};}catch{return null;}}
function home(){viewer.trackedEntity=undefined;viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO,8000000),{offset:new Cesium.HeadingPitchRange(0,-Math.PI/2,0),duration:1.4});}
function renderList(){const q=$('search').value.trim().toLowerCase();let visible=[];for(const o of objects){o.show=o.name.toLowerCase().includes(q)||o.id.includes(q);o.point.show=o.show&&!!o.valid;if(o.show)visible.push(o);}$('count').textContent=visible.filter(o=>o.valid).length.toLocaleString();$('results').textContent=visible.length.toLocaleString();$('list').innerHTML=visible.slice(0,150).map(o=>`<button class="object ${selected===o?'active':''}" data-id="${escapeHtml(o.id)}">${escapeHtml(o.name)}<span>${escapeHtml(o.id)}</span></button>`).join('')+(visible.length>150?'<p class="note" style="display:block">先頭150件。検索で絞り込めます。</p>':'');}
function selectObject(o){if(selected)selected.point.color=Cesium.Color.fromCssColorString(selected.debris?colors.debris:colors.normal);selected=o;o.point.color=Cesium.Color.fromCssColorString(colors.selected);$('detail').hidden=false;drawOrbit();renderList();updateDetail(Cesium.JulianDate.toDate(viewer.clock.currentTime));}
function drawOrbit(){if(orbit)viewer.entities.remove(orbit);if(!selected)return;const date=Cesium.JulianDate.toDate(viewer.clock.currentTime),period=86400000/Number(selected.data.MEAN_MOTION);const positions=[];for(let i=0;i<=180;i++){const c=calculate(selected,new Date(date.getTime()+period*i/180));if(c)positions.push(c.pos);}orbit=viewer.entities.add({polyline:{positions,width:1.5,material:Cesium.Color.fromCssColorString(colors.selected).withAlpha(.65)}});}
function updateDetail(date){if(!selected)return;const c=calculate(selected,date);if(!c){$('detail').textContent='この物体の位置は計算できません。';return;}const speed=c.pv.velocity?Math.hypot(c.pv.velocity.x,c.pv.velocity.y,c.pv.velocity.z):NaN;const age=(date.getTime()-Date.parse(selected.data.EPOCH+'Z'))/86400000;$('detail').innerHTML=`<div class="eyebrow">SELECTED OBJECT <button id="dismiss" style="float:right;width:auto;padding:0 6px;margin:0">×</button></div><h2>${escapeHtml(selected.name)}</h2><dl><dt>NORAD ID</dt><dd>${escapeHtml(selected.id)}</dd><dt>高度</dt><dd>${c.gd.height.toFixed(1)} km</dd><dt>速度</dt><dd>${speed.toFixed(2)} km/s</dd><dt>軌道傾斜角</dt><dd>${Number(selected.data.INCLINATION).toFixed(2)}°</dd><dt>軌道周期</dt><dd>${(1440/Number(selected.data.MEAN_MOTION)).toFixed(1)} min</dd><dt>表示時刻 − 要素日時</dt><dd>${Number.isFinite(age)?age.toFixed(1)+' 日':'—'}</dd></dl><button id="focus">↗ この物体に移動</button>`;$('dismiss').onclick=()=>{$('detail').hidden=true;};$('focus').onclick=()=>viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(c.pos,1500000),{duration:1.4});}
function ingest(data){
  const validated=OrbitValidation.catalog(data);
  const date=Cesium.JulianDate.toDate(viewer.clock.currentTime);
  const parsed=validated.map(d=>{
    const o={data:d,name:d.OBJECT_NAME,id:d.NORAD_CAT_ID,rec:satellite.json2satrec(d),debris:['DEBRIS','ROCKET BODY'].includes(d.OBJECT_TYPE)||/DEB|R\/B/.test(d.OBJECT_NAME)};
    const c=calculate(o,date);o.valid=!!c;o.initialPosition=c?c.pos:Cesium.Cartesian3.ZERO;return o;
  });
  if(!parsed.some(o=>o.valid))throw Error('表示時刻に位置を計算できる物体がありません');
  const collection=new Cesium.PointPrimitiveCollection();
  for(const o of parsed){
    o.point=collection.add({position:o.initialPosition,pixelSize:5,outlineColor:Cesium.Color.BLACK,outlineWidth:1,color:Cesium.Color.fromCssColorString(o.debris?colors.debris:colors.normal),show:o.valid});o.point.id=o;delete o.initialPosition;
  }
  if(window.points)viewer.scene.primitives.remove(window.points);
  window.points=viewer.scene.primitives.add(collection);objects=parsed;selected=null;$('detail').hidden=true;
  if(orbit){viewer.entities.remove(orbit);orbit=null;}
  renderList();state('取得 '+new Date().toLocaleTimeString('ja-JP')+' / '+parsed.length.toLocaleString()+' 件');
}
function useCatalogCache(){
  readSequence++;
  const cache=OrbitCatalog.cached($('group').value);
  if(cache?.data){try{ingest(cache.data);state('保存済みデータ：'+new Date(cache.time).toLocaleString('ja-JP')+'取得');}catch(error){state('保存済みデータを表示できません：'+error.message);}}
  else{
    if(window.points)viewer.scene.primitives.remove(window.points);
    window.points=undefined;objects=[];selected=null;
    if(orbit){viewer.entities.remove(orbit);orbit=null;}
    $('detail').hidden=true;renderList();state('「データ取得」またはJSON読込で開始');
  }
}
async function load(){
  const sequence=++readSequence,group=$('group').value;$('reload').disabled=true;state('同梱スナップショットを読み込み中…');
  try{
    const result=await OrbitCatalog.request(group);
    if(sequence!==readSequence||group!==$('group').value)return;
    referenceTime=new Date(result.metadata.referenceTime);
    viewer.clock.currentTime=Cesium.JulianDate.fromDate(referenceTime);viewer.clock.shouldAnimate=false;$('pause').textContent='▶ 再生';
    ingest(result.data);
    state('固定：'+referenceTime.toLocaleString('ja-JP')+' / '+result.data.length.toLocaleString()+'件');
  }catch(error){if(sequence===readSequence&&group===$('group').value)state(error.message);}
  finally{$('reload').disabled=false;}
}
async function init(){try{if(!window.Cesium||!window.satellite)throw Error('ライブラリの読み込みに失敗');Cesium.Ion.defaultAccessToken='';viewer=new Cesium.Viewer('globe',{skyBox:false,baseLayer:false,baseLayerPicker:false,geocoder:false,animation:false,timeline:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,fullscreenButton:false,infoBox:false,selectionIndicator:false,shouldAnimate:false});viewer.imageryLayers.addImageryProvider(await Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),{credit:'Made with Natural Earth'}));viewer.scene.globe.enableLighting=false;viewer.scene.backgroundColor=Cesium.Color.fromCssColorString('#060c14');home();viewer.clock.onTick.addEventListener(clock=>{const date=Cesium.JulianDate.toDate(clock.currentTime);$('mode').textContent=!clock.shouldAnimate?'SNAPSHOT':'SIMULATION';$('clock').textContent=date.toISOString().replace('T',' ').slice(0,19)+' UTC';if(!clock.shouldAnimate||performance.now()-lastTick<1000)return;lastTick=performance.now();for(const o of objects){const c=calculate(o,date);o.valid=!!c;o.point.show=o.show&&o.valid;if(c)o.point.position=c.pos;}if(selected&&!$('detail').hidden)updateDetail(date);$('count').textContent=objects.filter(o=>o.show&&o.valid).length.toLocaleString();});viewer.screenSpaceEventHandler.setInputAction(e=>{const picked=viewer.scene.pick(e.position);if(picked?.id?.rec)selectObject(picked.id);},Cesium.ScreenSpaceEventType.LEFT_CLICK);$('group').onchange=load;$('search').oninput=renderList;$('reload').onclick=load;$('list').onclick=e=>{const b=e.target.closest('[data-id]');if(b)selectObject(objects.find(o=>o.id===b.dataset.id));};$('home').onclick=home;$('pause').onclick=()=>{viewer.clock.shouldAnimate=!viewer.clock.shouldAnimate;$('pause').textContent=viewer.clock.shouldAnimate?'Ⅱ 一時停止':'▶ 再生';$('mode').textContent=viewer.clock.shouldAnimate?'SIMULATION':'SNAPSHOT';};$('now').onclick=()=>{viewer.clock.currentTime=Cesium.JulianDate.fromDate(referenceTime);viewer.clock.multiplier=1;viewer.clock.shouldAnimate=false;for(const o of objects){const c=calculate(o,referenceTime);o.valid=!!c;o.point.show=o.show&&o.valid;if(c)o.point.position=c.pos;}$('speed').value='1';$('mode').textContent='SNAPSHOT';$('pause').textContent='▶ 再生';renderList();if(selected)updateDetail(referenceTime);if(selected)drawOrbit();};$('speed').onchange=()=>{viewer.clock.multiplier=Number($('speed').value);$('mode').textContent=viewer.clock.shouldAnimate?'SIMULATION':'SNAPSHOT';};$('file').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  const sequence=++readSequence;
  try{
    if(file.size>OrbitValidation.MAX_FILE_BYTES)throw Error('JSONファイルは32 MiB以下にしてください');
    const data=JSON.parse(await file.text());if(sequence!==readSequence)return;
    ingest(data);state('手動ファイル：'+file.name);$('dialog').close();
  }catch(err){$('tokenstatus').textContent=err.message;}
  finally{e.target.value='';}
};await load();}catch(err){state(err.message+'。ネットワークと WebGL 対応を確認してください。');}}
$('settings').onclick=()=>$('dialog').showModal();init();
