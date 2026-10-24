/* Fixed Space-Track snapshot. No orbital-data API requests. */
(function(root){
 'use strict';
 const groups=['all','payload','debris','rocket','unknown'];
 const types={payload:'PAYLOAD',debris:'DEBRIS',rocket:'ROCKET BODY',unknown:'UNKNOWN'};
 let snapshot,pending;
 function cached(group){if(!snapshot)return null;return result(group);}
 function result(group){return {time:Date.parse(snapshot.metadata.referenceTime),metadata:snapshot.metadata,data:group==='all'?snapshot.objects:snapshot.objects.filter(o=>o.OBJECT_TYPE===types[group])};}
 async function request(group){
  if(!groups.includes(group))throw Error('未対応のカタログ');
  if(!pending)pending=(async()=>{
   const response=await fetch('data/snapshot.json',{redirect:'error'});
   if(response.status!==200)throw Error('同梱データを読み込めません：HTTP '+response.status);
   const value=await response.json();
   if(!Array.isArray(value.objects)||value.objects.length!==value.metadata?.count||!Number.isFinite(Date.parse(value.metadata.referenceTime)))throw Error('同梱データの形式が不正です');
   snapshot=value;
  })();
  await pending;return result(group);
 }
 root.OrbitCatalog={cached,request};
})(globalThis);
