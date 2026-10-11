"""Aggregate the published vegetation-display raster inside ward polygons.
Requires Pillow, numpy and shapely. This does not recover NDVI or canopy percentage.
"""
import json,hashlib,datetime
from pathlib import Path
import numpy as np
from PIL import Image
from shapely.geometry import shape,box
from shapely import make_valid,contains_xy
root=Path(__file__).resolve().parents[1]
path=root/'data/greenery-overlay.webp'
a=np.array(Image.open(path).convert('RGBA'))[:,:,3]
h,w=a.shape
south,west,north,east=12.82,77.45,13.12,77.78
bounds=box(west,south,east,north)
lons=west+(np.arange(w)+.5)*(east-west)/w
lats=north-(np.arange(h)+.5)*(north-south)/h
wards={}
for f in json.loads((root/'data/wards-bengaluru-gba.geojson').read_text())['features']:
 g=make_valid(shape(f['geometry']));coverage=g.intersection(bounds).area/g.area
 left,bottom,right,top=g.bounds
 xx=np.flatnonzero((lons>=left)&(lons<=right));yy=np.flatnonzero((lats>=bottom)&(lats<=top))
 signal=None;count=0
 if len(xx) and len(yy):
  x,y=np.meshgrid(lons[xx],lats[yy]);mask=contains_xy(g,x,y);count=int(mask.sum())
  if count and coverage>=.95:
   values=a[np.ix_(yy,xx)][mask];weights=np.cos(np.radians(y[mask]));signal=float(np.average(values,weights=weights))
 wards[f['properties']['id2']]={'meanAlpha':signal,'coverage':round(coverage,4),'pixels':count}
maximum=max(v['meanAlpha'] or 0 for v in wards.values())
for v in wards.values():v['score']=v['meanAlpha']/maximum if v['meanAlpha'] is not None and maximum else None
out={'source':'https://bengaluru.rent/','rasterSource':'https://bengaluru.rent/greenery-overlay.webp','imageryDate':'2026-03-28','retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bounds':[[south,west],[north,east]],'imageSize':[w,h],'attribution':'Vegetation visualization: bengaluru.rent / Harshit Anand. Contains modified Copernicus Sentinel-2 data [2026].','method':'Cos(latitude)-weighted mean alpha of published display pixels whose centres lie inside each ward; divide by highest covered ward mean. Require 95% raster extent coverage. Display proxy, not NDVI or canopy percent. Transparent pixels are counted as zero display signal; source no-data/cloud mask not supplied.','maximumWardMeanAlpha':maximum,'wards':wards}
(root/'data/green-cover.json').write_text(json.dumps(out,separators=(',',':')))
print('Covered wards:',sum(v['score'] is not None for v in wards.values()),'of',len(wards),'maximum mean alpha:',round(maximum,2))
