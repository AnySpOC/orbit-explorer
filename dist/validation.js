/* Copyright (c) 2026 AnySpOC. MIT License; see licenses/ORBIT-MIT.txt. */
(function(root){
  'use strict';
  const MAX_OBJECTS=50000,MAX_FILE_BYTES=32*1024*1024;
  function number(value,name,min,max,maxExclusive=false){
    if((typeof value!=='number'&&typeof value!=='string')||String(value).trim()==='')throw Error(name+' が不正です');
    const n=Number(value);
    if(!Number.isFinite(n)||n<min||(maxExclusive?n>=max:n>max))throw Error(name+' が範囲外です');
    return n;
  }
  function record(d){
    if(!d||typeof d!=='object'||Array.isArray(d))throw Error('物体の形式が不正です');
    const id=String(d.NORAD_CAT_ID??'').trim();
    if(!/^[1-9]\d{0,8}$/.test(id))throw Error('NORAD ID は1〜9桁の正の整数にしてください');
    if(typeof d.OBJECT_NAME!=='string'||!d.OBJECT_NAME.trim()||d.OBJECT_NAME.length>160)throw Error('物体名が不正です');
    const epoch=String(d.EPOCH??'');
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z?$/.test(epoch))throw Error('EPOCH はUTCの日時にしてください');
    const utc=epoch.endsWith('Z')?epoch:epoch+'Z',time=Date.parse(utc);
    if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,19)!==epoch.slice(0,19))throw Error('EPOCH が不正です');
    for(const [field,expected] of [['TIME_SYSTEM','UTC'],['REF_FRAME','TEME'],['MEAN_ELEMENT_THEORY','SGP4']]){
      if(d[field]!==undefined&&d[field]!==expected)throw Error(field+' は '+expected+' のみ対応しています');
    }
    const result={OBJECT_TYPE:['PAYLOAD','DEBRIS','ROCKET BODY','UNKNOWN'].includes(d.OBJECT_TYPE)?d.OBJECT_TYPE:'UNKNOWN',OBJECT_NAME:d.OBJECT_NAME.trim(),NORAD_CAT_ID:id,EPOCH:utc.slice(0,-1)};
    result.MEAN_MOTION=number(d.MEAN_MOTION,'平均運動',Number.MIN_VALUE,30);
    result.ECCENTRICITY=number(d.ECCENTRICITY,'離心率',0,1,true);
    result.INCLINATION=number(d.INCLINATION,'軌道傾斜角',0,180);
    for(const key of ['RA_OF_ASC_NODE','ARG_OF_PERICENTER','MEAN_ANOMALY'])result[key]=number(d[key],key,0,360);
    for(const key of ['BSTAR','MEAN_MOTION_DOT','MEAN_MOTION_DDOT'])result[key]=number(d[key]??0,key,-1e6,1e6);
    return result;
  }
  function catalog(data){
    if(!Array.isArray(data)||!data.length||data.length>MAX_OBJECTS)throw Error('1〜'+MAX_OBJECTS.toLocaleString()+'件のOMM JSON配列が必要です');
    const seen=new Set();
    return data.map((d,i)=>{
      try{const result=record(d);if(seen.has(result.NORAD_CAT_ID))throw Error('NORAD ID が重複しています');seen.add(result.NORAD_CAT_ID);return result;}
      catch(error){throw Error((i+1)+'件目：'+error.message);}
    });
  }
  root.OrbitValidation={catalog,MAX_OBJECTS,MAX_FILE_BYTES};
})(globalThis);
