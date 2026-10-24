/* Application request policy; third-party orbital data is never bundled. */
(function(root){
  'use strict';
  const memory=new Map();
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return memory.get(key)||null;}}
  function write(key,value){memory.set(key,value);localStorage.setItem(key,JSON.stringify(value));}
  function interval(group){return (group==='gps-ops'?24:2)*60*60*1000;}
  function cached(group){return read('orbit-'+group);}
  async function request(group){
    if(!['active','stations','starlink','gps-ops','geo','cosmos-2251-debris','iridium-33-debris'].includes(group))throw Error('未対応のカタログ');
    const run=async()=>{
      const key='orbit-'+group,cache=cached(group),now=Date.now();
      if(cache?.data&&now-cache.time<interval(group))return {...cache,cached:true};
      if(read('orbit-provider-block'))throw Error('前回の通信エラーにより取得を停止中です。利用方針を確認し、手動ファイル読込をご利用ください');
      const last=read(key+'-attempt');
      if(last&&now-last.time<interval(group))throw Error('取得間隔の制限中です。'+new Date(last.time+interval(group)).toLocaleString('ja-JP')+' 以降に取得できます');
      // If persistent storage is unavailable, stop before issuing a request.
      write(key+'-attempt',{time:now});
      try{
        const response=await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP='+encodeURIComponent(group)+'&FORMAT=JSON',{signal:AbortSignal.timeout(20000),redirect:'error'});
        if(response.status!==200)throw Error('HTTP '+response.status);
        const data=await response.json();
        if(!Array.isArray(data)||!data.length)throw Error('有効な OMM JSON がありません');
        const result={time:Date.now(),data};
        // Large catalogs may exceed localStorage quota; the persisted attempt still limits requests.
        try{write(key,result);}catch{}
        return result;
      }catch(error){
        try{write('orbit-provider-block',{time:Date.now(),reason:error.message});}catch{}
        throw error;
      }
    };
    // Serialize requests across tabs sharing this origin.
    return navigator.locks?navigator.locks.request('orbit-celestrak',run):run();
  }
  root.OrbitCatalog={cached,request,interval};
})(globalThis);
