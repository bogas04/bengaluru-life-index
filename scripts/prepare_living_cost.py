"""Build a locality rent proxy for wards from the attributed rental CSV + OSM centres.
Usage: python scripts/prepare_living_cost.py
This is NOT a measured ward rent median. Preserve nearby matches within 2 km;
store optional inverse-distance estimates for gaps separately.
"""
import csv,json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
places=json.loads((root/'data/search-places.json').read_text())['places']
ward_data=json.loads((root/'data/amenities.json').read_text())['wards']
aliases={'Bellandur':'Bellanduru','CV Raman Nagar':'C V Raman Nagar','Malleshwaram':'Malleswaram'}
rows=list(csv.DictReader((root/'data/rent-index-2026-10.csv').open()))
areas={};omitted=[]
for r in rows:
 name=r['area'];target=aliases.get(name,name)
 matches=[p for p in places if p['name']==target and p['kind'] in ('Suburb','Town','Quarter')]
 if not matches:
  omitted.append(name);continue
 p=matches[0]
 area=areas.setdefault(name,{'name':name,'center':[p['lat'],p['lon']],'osmId':p['id'],'rents':{}})
 area['rents'][r['bhk']]={'rent':int(r['median_rent_inr_90d']),'reports':int(r['reports_90d'])}
def distance(a,b):
 lat1,lat2=map(math.radians,(a[0],b[0]));dlat=lat2-lat1;dlon=math.radians(b[1]-a[1]);h=math.sin(dlat/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
 return 6371000*2*math.asin(math.sqrt(h))
wards={}; inferred={}
for w in ward_data:
 costs={}; estimates={}
 for bhk in ('1','2','3'):
  near=sorted([(distance(w['center'],a['center']),a) for a in areas.values() if bhk in a['rents']],key=lambda item:item[0])
  if near and near[0][0]<=2000:
   d,a=near[0];costs[bhk]={**a['rents'][bhk],'area':a['name'],'distanceM':round(d)}
  elif near:
   nearest=near[:3]
   weights=[1/max(d,500)**2 for d,a in nearest]
   total=sum(weights)
   estimates[bhk]={'basis':'inferred','rent':round(sum(a['rents'][bhk]['rent']*weight for (d,a),weight in zip(nearest,weights))/total/500)*500,'area':'Nearby-locality estimate','distanceM':round(nearest[0][0]),'sourceCount':len(nearest),'farExtrapolation':nearest[0][0]>5000,'sources':[{'area':a['name'],'distanceM':round(d),'rent':a['rents'][bhk]['rent'],'reports':a['rents'][bhk]['reports'],'weightShare':weight/total} for (d,a),weight in zip(nearest,weights)]}
 wards[w['id']]=costs
 inferred[w['id']]=estimates
out={'edition':'2026-10','windowEnd':'2026-10-06','source':'https://bengaluru.rent/bengaluru-rent-index','csvSource':'https://bengaluru.rent/data/bengaluru-rent-index-2026-10.csv','method':'Nearest OSM locality centre with matching BHK median, within 2 km of ward representative point. Locality proxy, not measured ward rent.','inference':{'version':'rent-idw-v1','method':'Gaps use up to three nearest locality medians of the same BHK. Inverse squared distance weights, distance floor 500 m; rounded to ₹500. Not a market valuation or a measured ward median. Beyond 5 km to nearest source is flagged as long-distance extrapolation. No housing-type or furnishing adjustment.','nearbyCutoffM':2000,'farCutoffM':5000},'inferredWards':inferred,'areas':list(areas.values()),'omittedAreas':sorted(set(omitted)),'wards':wards}
(root/'data/living-cost.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
print('Localities:',len(areas),'coverage:',{bhk:sum(bhk in w for w in wards.values()) for bhk in ('1','2','3')},'inferred:',{bhk:sum(bhk in w for w in inferred.values()) for bhk in ('1','2','3')},'omitted:',out['omittedAreas'])
