// Local, explicitly imported listing data. No portal scraping or guessed rent uplift.
export const RENT_CSV_HEADER='property_id,latitude,longitude,bhk,housing_type,rent_inr,maintenance_inr,furnishing,observed_on,source_url';
function parseCSV(text){const rows=[];let row=[],cell='',quoted=false;for(let n=0;n<text.length;n++){const c=text[n];if(c==='"'){if(quoted&&text[n+1]==='"'){cell+='"';n++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(cell.trim());cell='';if(c==='\n'){if(row.some(Boolean))rows.push(row);row=[];}}else if(c!=='\r')cell+=c;}if(quoted)throw Error('Unclosed CSV quote.');if(cell||row.length){row.push(cell.trim());rows.push(row);}return rows;}
function inRing(point,ring){let inside=false;for(let n=0,j=ring.length-1;n<ring.length;j=n++){const [x,y]=ring[n],[xj,yj]=ring[j];if((y>point[1])!==(yj>point[1])&&point[0]<(xj-x)*(point[1]-y)/(yj-y)+x)inside=!inside;}return inside;}
function inPolygon(point,polygon){return inRing(point,polygon[0])&&!polygon.slice(1).some(r=>inRing(point,r));}
function inWard(point,geometry){return geometry.type==='Polygon'?inPolygon(point,geometry.coordinates):geometry.type==='MultiPolygon'&&geometry.coordinates.some(p=>inPolygon(point,p));}
export function importRentalListings(text,features){
 const rows=parseCSV(text.replace(/^\uFEFF/,''));const header=rows.shift()||[];const required=RENT_CSV_HEADER.split(',');if(required.some(name=>!header.includes(name)))throw Error('Use the provided CSV headers.');
 const seen=new Set(),seenURLs=new Set(),records=[];let excluded=0;const today=new Date();
 for(const [n,row] of rows.entries()){
  if(row.length!==header.length)throw Error(`Row ${n+2}: column count does not match the header.`);
  const r=Object.fromEntries(header.map((h,i)=>[h,row[i]]));const lat=Number(r.latitude),lon=Number(r.longitude),bhk=Number(r.bhk),rent=Number(r.rent_inr),maintenance=r.maintenance_inr===''?null:Number(r.maintenance_inr);const date=new Date(r.observed_on+'T00:00:00Z');let url;try{url=new URL(r.source_url);}catch{throw Error(`Row ${n+2}: invalid source URL.`);}
  if(!r.property_id||!r.latitude||!r.longitude||!Number.isFinite(lat)||!Number.isFinite(lon)||lat<12.5||lat>13.5||lon<77||lon>78.5||![1,2,3].includes(bhk)||!['gated','standalone','unknown'].includes(r.housing_type)||!['unfurnished','semi-furnished','furnished','unknown'].includes(r.furnishing)||rent<=0||rent>1000000||!Number.isFinite(rent)||maintenance!=null&&(!Number.isFinite(maintenance)||maintenance<0||maintenance>100000)||!/^\d{4}-\d{2}-\d{2}$/.test(r.observed_on)||!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==r.observed_on||!['https:','http:'].includes(url.protocol))throw Error(`Row ${n+2}: invalid listing fields.`);
  const age=(today-date)/86400000;if(age<0||age>90||maintenance===null||seen.has(r.property_id)||seenURLs.has(url.href)){excluded++;continue;}
  const ward=features.find(f=>inWard([lon,lat],f.geometry));if(!ward){excluded++;continue;}
  seen.add(r.property_id);seenURLs.add(url.href);records.push({ward:ward.properties.id2,bhk,housingType:r.housing_type,furnishing:r.furnishing,rent:rent+maintenance,observedOn:r.observed_on,sourceURL:url.href});
 }
 return {records,excluded};
}
const percentile=(values,p)=>{const pos=(values.length-1)*p,low=Math.floor(pos);return values[low]+(values[Math.ceil(pos)]-values[low])*(pos-low);};
export function summarizeRentalListings(records,settings){
 const groups=new Map();for(const r of records){if(r.bhk!==settings.bhk||settings.housingType!=='all'&&r.housingType!==settings.housingType||settings.furnishing!=='all'&&r.furnishing!==settings.furnishing)continue;if(!groups.has(r.ward))groups.set(r.ward,[]);groups.get(r.ward).push(r);}
 const summaries=new Map();for(const [id,rows] of groups){if(rows.length<5)continue;const values=rows.map(r=>r.rent).sort((a,b)=>a-b);summaries.set(id,{rent:Math.round(percentile(values,.5)),low:Math.round(percentile(values,.25)),high:Math.round(percentile(values,.75)),reports:rows.length,basis:'asking',sourceURLs:rows.map(r=>r.sourceURL),area:'Within this ward',observedOn:rows.map(r=>r.observedOn).sort().at(-1)});}return summaries;
}
