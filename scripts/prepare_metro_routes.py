"""Attach metro line colors and deduplicated track geometry from OSM routes.
Usage: python scripts/prepare_metro_routes.py ROUTES_JSON
Requires shapely. Run after base amenity preparation.
"""
import json,sys,datetime,collections,math
from pathlib import Path
root=Path(__file__).resolve().parents[1];path=root/'data/amenities.json';data=json.loads(path.read_text());raw=json.loads(Path(sys.argv[1]).read_text())
if raw.get('remark'):raise RuntimeError(raw['remark'])
colors={'Purple':'#9333b8','Green':'#168345','Yellow':'#eab308'};groups={};stops=collections.defaultdict(list);members=collections.defaultdict(set)
for r in raw['elements']:
 t=r.get('tags',{});line=t.get('ref')
 if line not in colors or t.get('network')!='Namma Metro':continue
 group=groups.setdefault(line,{'name':line,'color':colors[line],'ways':{},'relations':[]});group['relations'].append(r['id'])
 for m in r.get('members',[]):
  role=m.get('role','')
  if role.startswith(('stop','platform')):
   members[f"{m['type']}/{m['ref']}"].add(line)
   if 'lat' in m:stops[line].append((m['lat'],m['lon']))
   elif m.get('geometry'):
    g=[p for p in m['geometry'] if p and 'lat' in p]
    if g:stops[line].append((sum(p['lat'] for p in g)/len(g),sum(p['lon'] for p in g)/len(g)))
  elif m['type']=='way' and role in ('','route'):
   coords=[[p['lat'],p['lon']] for p in m.get('geometry',[]) if p and 'lat' in p]
   if len(coords)>1:group['ways'][m['ref']]=coords
for p in data['points']:
 if p['category']!='metro':continue
 lines=set(members[p['id']]);method='OSM route member' if lines else 'Within 250 m of an OSM route stop/platform'
 for line,positions in stops.items():
  if any(math.hypot((p['lat']-lat)*111200,(p['lon']-lon)*108400)<=250 for lat,lon in positions):lines.add(line)
 p['metroLines']=[{'name':name,'color':colors[name]} for name in colors if name in lines];p['metroLineMatch']=method if lines else 'No route membership match'
data['metroRoutes']=[{'name':g['name'],'color':g['color'],'paths':list(g['ways'].values()),'relations':g['relations']} for g in groups.values()]
data['metroRouteMetadata']={'osmTimestamp':raw.get('osm3s',{}).get('timestamp_osm_base'),'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'assignment':'Direct route membership or <=250 m from route stops/platforms; uncertain matches gray','colors':'Display palette for OSM named Purple, Green, Yellow routes; not arbitrary colour tags'}
path.write_text(json.dumps(data,separators=(',',':')))
print(collections.Counter('/'.join(l['name'] for l in p['metroLines']) or 'Unknown' for p in data['points'] if p['category']=='metro'))
print([(p['name'],p['metroLineMatch']) for p in data['points'] if p['category']=='metro' and not p['metroLines']])
