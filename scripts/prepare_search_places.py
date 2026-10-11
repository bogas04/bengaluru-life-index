"""Build the local destination directory: python scripts/prepare_search_places.py RAW_JSON.
Requires shapely. Named roads are retained too, as useful landmark destinations.
"""
import json, sys
from pathlib import Path
from shapely.geometry import shape, Point
from shapely import make_valid
from shapely.strtree import STRtree
root = Path(__file__).resolve().parents[1]
raw = json.loads(Path(sys.argv[1]).read_text())
if raw.get('remark'):
    raise RuntimeError(raw['remark'])
wards = json.loads((root / 'data/wards-bengaluru-gba.geojson').read_text())['features']
geoms = [make_valid(shape(w['geometry'])) for w in wards]
tree = STRtree(geoms)
places = []
for e in raw['elements']:
    t = e.get('tags', {})
    if t.get('type') in ('route', 'route_master', 'boundary') or 'boundary' in t:
        continue
    c = e.get('center', e)
    name = t.get('name:en') or t.get('name')
    if not name or 'lat' not in c or not (12.78 <= c['lat'] <= 13.21 and 77.38 <= c['lon'] <= 77.86):
        continue
    kind = next((t[k].replace('_', ' ').title() for k in ('amenity', 'tourism', 'historic', 'shop', 'office', 'leisure', 'railway', 'public_transport', 'place', 'man_made', 'natural', 'landuse', 'building', 'highway') if k in t), 'Mapped place')
    if kind == 'Yes':
        kind = 'Building'
    p = Point(c['lon'], c['lat'])
    wi = next((int(i) for i in tree.query(p) if geoms[int(i)].covers(p)), None)
    address = ', '.join(dict.fromkeys(t[k] for k in ('addr:housenumber', 'addr:street', 'addr:suburb', 'addr:city', 'addr:postcode') if t.get(k)))
    aliases = list(dict.fromkeys(v for k, v in t.items() if k.startswith('name:') or k in ('name', 'alt_name', 'short_name', 'official_name', 'brand', 'operator')))
    places.append({'id':f"{e['type']}/{e['id']}", 'name':name, 'lat':c['lat'], 'lon':c['lon'], 'kind':kind, 'aliases':aliases, 'address':address, 'ward':wards[wi]['properties']['id2'] if wi is not None else None})
out = {'osmTimestamp':raw.get('osm3s', {}).get('timestamp_osm_base'), 'bbox':[12.78,77.38,13.21,77.86], 'places':places}
(root / 'data/search-places.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print(f'{len(places):,} named destinations')
