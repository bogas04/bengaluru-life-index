"""Append local place search, site centers and ward road-pressure proxy.
Usage: python scripts/prepare_exposure.py SITES_JSON ROADS_JSON
Requires shapely; run after prepare_layers.py.
"""
import json,sys,re,collections,datetime
from pathlib import Path
from shapely.geometry import shape,Point,LineString
from shapely import make_valid
from shapely.affinity import scale
from shapely.strtree import STRtree
root=Path(__file__).resolve().parents[1];path=root/'data/amenities.json';data=json.loads(path.read_text())
wards=json.loads((root/'data/wards-bengaluru-gba.geojson').read_text())['features'];geoms=[make_valid(shape(w['geometry'])) for w in wards];tree=STRtree(geoms)
sites=json.loads(Path(sys.argv[1]).read_text());roads=json.loads(Path(sys.argv[2]).read_text())
for source in (sites,roads):
 if source.get('remark'):raise RuntimeError(source['remark'])
place_rows=[];site_rows=[]
for e in sites['elements']:
 t=e.get('tags',{});c=e.get('center',e)
 if 'lat' not in c:continue
 cat=None;name=t.get('name',t.get('name:en',''))
 if t.get('industrial')=='composting' or re.search(r'compost|\bkcdc\b',name,re.I):cat='compost'
 elif t.get('amenity')=='waste_transfer_station' or t.get('landuse')=='landfill' or t.get('industrial') in ('recycling','waste_processing','waste_management') or t.get('recycling:organic')=='yes':cat='waste_site'
 elif t.get('man_made')=='works' or t.get('industrial') in ('factory','manufacturing'):cat='factory'
 elif t.get('landuse')=='industrial' or t.get('industrial'):cat='industry'
 elif t.get('office'):cat='office'
 if not cat:continue
 p=Point(c['lon'],c['lat']);ids=[int(i) for i in tree.query(p) if geoms[int(i)].covers(p)];wi=ids[0] if ids else None
 row={'id':f"{e['type']}/{e['id']}",'lat':c['lat'],'lon':c['lon'],'category':cat,'name':name,'ward':wards[wi]['properties']['id2'] if wi is not None else None,'tags':{k:v for k,v in t.items() if k in ('industrial','landuse','man_made','office','operator','amenity','recycling:organic')}}
 if cat!='office':site_rows.append(row)
 if name:place_rows.append(row)
data['exposureSites']=site_rows;data['searchPlaces']=place_rows
factors={'motorway':4,'trunk':3,'primary':2.5,'secondary':2,'tertiary':1.5,'unclassified':1,'residential':1,'service':.5,'living_street':.4}
defaults={'motorway':10,'trunk':10,'primary':9,'secondary':7,'tertiary':6,'unclassified':5,'residential':5,'service':3.5,'living_street':3}
agg=[collections.Counter() for g in geoms]
def number(s):
 try:return float(s)
 except (ValueError,TypeError):return None
def width(t,kind):
 text=t.get('width:carriageway',t.get('width','')).strip();m=re.fullmatch(r'([\d.]+)\s*(m|ft)?',text)
 if m:
  value=float(m[1])*(.3048 if m[2]=='ft' else 1)
  if 1<=value<=80:return value,'tagged'
 lanes=number(t.get('lanes'))
 if lanes is not None and 1<=lanes<=16:return lanes*3.2,'lanes'
 return defaults[kind],'assumed'
for e in roads['elements']:
 t=e.get('tags',{});kind=t.get('highway','').removesuffix('_link')
 if kind not in factors or t.get('area')=='yes' or t.get('access')=='no':continue
 coords=[(p['lon'],p['lat']) for p in e.get('geometry',[]) if 'lon' in p]
 if len(coords)<2:continue
 line=LineString(coords);w,source=width(t,kind)
 for ii in tree.query(line):
  i=int(ii);clipped=geoms[i].intersection(line)
  length=scale(clipped,xfact=108400,yfact=111200,origin=(0,0)).length
  if length<=0:continue
  a=agg[i];a['roadObjects']+=1;a['roadLengthM']+=length;a['weightedSurfaceM2']+=length*w*factors[kind];a[source+'LengthM']+=length
by_id={m['id']:m for m in data['wards']}
for f,g,a in zip(wards,geoms,agg):
 area=scale(g,xfact=108400,yfact=111200,origin=(0,0)).area;m=by_id[f['properties']['id2']];length=a['roadLengthM'];m['roadProxy']={'pressure':a['weightedSurfaceM2']/area if area else None,'roadObjects':int(a['roadObjects']),'roadLengthKm':length/1000,'areaKm2':area/1e6,'taggedWidthFraction':a['taggedLengthM']/length if length else 0,'laneEstimatedFraction':a['lanesLengthM']/length if length else 0,'assumedWidthFraction':a['assumedLengthM']/length if length else 0}
data['exposureMetadata']={'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sitesTimestamp':sites.get('osm3s',{}).get('timestamp_osm_base'),'roadsTimestamp':roads.get('osm3s',{}).get('timestamp_osm_base'),'noiseProxy':'sum(clipped road length * estimated width * road-class factor) / ward area. Not dB or validated noise.','distanceScope':'Nearest OSM site center within buffered query bbox, not site boundary or exposure dose.','widthDefaultsM':defaults,'classFactors':factors}
path.write_text(json.dumps(data,separators=(',',':')))
print('Sites:',dict(collections.Counter(x['category'] for x in site_rows)),'named places:',len(place_rows),'road objects:',len(roads['elements']))
print('Compost:',[(p['name'],p['id']) for p in site_rows if p['category']=='compost'])
