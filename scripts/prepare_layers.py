"""Build city-clipped constituency outlines, OSM points and ward metrics.
Requires shapely. Usage: python scripts/prepare_layers.py OVERPASS_JSON
The saved query is scripts/amenities.overpass; request it with out center.
"""
import json, sys, collections, datetime
from pathlib import Path
from shapely.geometry import shape, mapping, Point
from shapely.ops import unary_union
from shapely import make_valid
from shapely.strtree import STRtree
root=Path(__file__).resolve().parents[1]
wards=json.loads((root/'data/wards-bengaluru-gba.geojson').read_text())['features']
geoms=[make_valid(shape(f['geometry'])) for f in wards]
city=unary_union(geoms)
groups=collections.defaultdict(list)
for f,g in zip(wards,geoms):groups[(str(f['properties']['ac_no']),f['properties']['ac'])].append(g)
assemblies={'type':'FeatureCollection','features':[{'type':'Feature','properties':{'number':n,'name':name,'scope':'Derived from wards; clipped to GBA'},'geometry':mapping(unary_union(gs))} for (n,name),gs in groups.items()]}
(root/'data/assemblies.geojson').write_text(json.dumps(assemblies,separators=(',',':')))
raw=json.loads(Path(sys.argv[1]).read_text())
if raw.get('remark'):raise RuntimeError(raw['remark'])
tree=STRtree(geoms);points=[];counts=[collections.Counter() for f in wards]
for e in raw['elements']:
 t=e.get('tags',{}); pos=e.get('center',e);lat=pos.get('lat');lon=pos.get('lon')
 if lat is None or lon is None:continue
 p=Point(lon,lat)
 if not city.covers(p):continue
 a=t.get('amenity');category=a
 if t.get('railway') in ('station','halt'):
  if t.get('station') in ('subway','metro') or t.get('subway')=='yes' or 'metro' in (t.get('network','')+' '+t.get('operator','')).lower():category='metro'
  else:category='rail'
 elif t.get('highway')=='bus_stop' or (t.get('public_transport')=='platform' and t.get('bus')=='yes'):category='bus_stop'
 elif t.get('shop')=='mall':category='mall'
 elif 'starbucks' in (t.get('brand','')+' '+t.get('name','')).lower():category='starbucks'
 elif t.get('leisure')=='park':category='park'
 elif t.get('natural')=='water':category='lake'
 if not category:continue
 matches=[int(i) for i in tree.query(p) if geoms[int(i)].covers(p)]
 wi=matches[0] if matches else None
 if wi is not None:
  counts[wi][category]+=1
  if category=='park' and t.get('access') in ('yes','permissive','designated'):counts[wi]['public_park']+=1
  if category=='lake' and t.get('water')=='lake':counts[wi]['lake_only']+=1
 points.append({'id':f"{e['type']}/{e['id']}",'lat':lat,'lon':lon,'category':category,'name':t.get('name',t.get('name:en','')),'ward':wards[wi]['properties']['id2'] if wi is not None else None,'tags':{k:v for k,v in t.items() if k in ('access','water','brand','shop','operator','network','wheelchair','opening_hours','website','station','railway','amenity','highway','bus','public_transport')}})
metrics=[]
for f,g,c in zip(wards,geoms,counts):
 p=g.representative_point();metrics.append({'id':f['properties']['id2'],'center':[p.y,p.x],'counts':dict(c)})
airport=None
if len(sys.argv)>2:
 airport_raw=json.loads(Path(sys.argv[2]).read_text())
 for e in airport_raw['elements']:
  if e.get('tags',{}).get('iata')=='BLR':
   c=e.get('center',e);airport={'center':[c['lat'],c['lon']],'id':f"{e['type']}/{e['id']}",'name':e['tags'].get('name'),'scope':'OSM aerodrome bounding-box center; not a terminal entrance'};break
output={'airport':airport,'source':'OpenStreetMap contributors / Overpass','license':'ODbL','downloadedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'osmTimestamp':raw.get('osm3s',{}).get('timestamp_osm_base'),'scope':'Point or bounding-box center inside GBA ward footprint','points':points,'wards':metrics}
(root/'data/amenities.json').write_text(json.dumps(output,separators=(',',':')))
print(len(assemblies['features']),'assemblies;',len(points),'OSM objects;',dict(collections.Counter(p['category'] for p in points)))
