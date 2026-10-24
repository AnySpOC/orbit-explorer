import argparse,collections,hashlib,json,pathlib,xml.etree.ElementTree as ET
p=argparse.ArgumentParser(description='Convert a user-supplied Space-Track unclassified OMM export to a fixed snapshot. No network requests.')
p.add_argument('xml');p.add_argument('--at',required=True);args=p.parse_args()
raw=pathlib.Path(args.xml).read_bytes()
if b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper(): raise ValueError('DTD/entity declarations are not supported')
root=ET.fromstring(raw); records=[];seen=set();types=collections.Counter();creations=[]
fields=['OBJECT_NAME','NORAD_CAT_ID','EPOCH','MEAN_MOTION','ECCENTRICITY','INCLINATION','RA_OF_ASC_NODE','ARG_OF_PERICENTER','MEAN_ANOMALY','BSTAR','MEAN_MOTION_DOT','MEAN_MOTION_DDOT','CENTER_NAME','REF_FRAME','TIME_SYSTEM','MEAN_ELEMENT_THEORY']
for n in root.iter('omm'):
 if n.findtext('.//CLASSIFICATION_TYPE')!='U': raise ValueError('Only unclassified basic OMM data may be imported')
 d={f:n.findtext('.//'+f) for f in fields}
 if d['NORAD_CAT_ID'] in seen: raise ValueError('Duplicate catalog ID')
 seen.add(d['NORAD_CAT_ID'])
 if d['CENTER_NAME']!='EARTH':raise ValueError('Earth-centered data required')
 for f in fields[3:12]:d[f]=float(d[f])
 d['OBJECT_TYPE']=n.findtext('.//USER_DEFINED[@parameter="OBJECT_TYPE"]') or 'UNKNOWN'
 d['CREATION_DATE']=n.findtext('.//CREATION_DATE');creations.append(d['CREATION_DATE']);types[d['OBJECT_TYPE']]+=1
 records.append(d)
epochs=[d['EPOCH'] for d in records]
meta={'referenceTime':args.at,'source':'Space-Track.org / USSPACECOM basic SSA OMM data','providedDate':'2026-10-24','sourceSha256':hashlib.sha256(raw).hexdigest(),'count':len(records),'types':dict(types),'epochRange':[min(epochs),max(epochs)],'creationRange':[min(creations),max(creations)],'citation':'Source: USSPACECOM, via Space-Track.org. OMM export supplied by the project owner on 2026-10-24. Positions calculated with satellite.js SGP4; not observations.','termsUrl':'https://www.space-track.org/documentation#/odr'}
out=pathlib.Path(__file__).resolve().parents[1]/'dist'/'data';out.mkdir(exist_ok=True)
(out/'snapshot.json').write_text(json.dumps({'metadata':meta,'objects':records},ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
print(json.dumps(meta,ensure_ascii=False,indent=2))
