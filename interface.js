const ICONS={map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15m6-12v15"/>',priorities:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',rankings:'<path d="M5 20V10h4v10m2 0V4h4v16m2 0v-6h4v6"/>',index:'<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>'};
const GROUP_ICONS={civic:'<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6zM12 8v8m-4-4h8"/>',access:'<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 10h14M8 18l-3 4m11-4 3 4"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',leisure:'<path d="M4 9h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM16 10h2a3 3 0 0 1 0 6h-2M7 3v3m5-3v3"/>',home:'<path d="m3 11 9-8 9 8M5 9v12h14V9M9 21v-8h6v8"/>',peace:'<path d="M20 3C8 2 3 7 5 15c7 5 15 0 15-12ZM4 21 15 10"/>'};
export const groupIcon=group=>`<svg data-tuning-transition class="group-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GROUP_ICONS[group.id]}</svg>`;
const themeGroup=(node,group)=>{node.style.setProperty('--group-color',group.color);node.style.setProperty('--group-tint',group.tint);};
export const GROUPS=[
 {id:'civic',color:'#476f9c',tint:'#edf3fa',name:'Civic services',description:'Schools, healthcare & public essentials',categories:['school','kindergarten','college','university','fire_station','hospital','clinic','doctors','pharmacy','police','toilets','library'],metrics:['school_count','fire_count','hospital_count','hospital','pharmacy','local_services'],defaults:['school_count','hospital','pharmacy','local_services']},
 {id:'access',color:'#237a80',tint:'#eaf5f4',name:'Daily access',description:'Transport & your everyday destinations',categories:['metro','bus_stop','bus_station','rail'],metrics:['metro','bus_stop','bus_count','reference','airport'],defaults:['metro','bus_stop']},
 {id:'leisure',color:'#87619e',tint:'#f3edf7',name:'Leisure',description:'Cafés, cinemas & places to go out',categories:['mall','cinema','coffee_chain','cafe'],metrics:['mall_count','cinema_count','coffee_chain_count','cafe_count'],defaults:['mall_count','cinema_count','cafe_count']},
 {id:'home',color:'#a16c33',tint:'#faf1e6',name:'Home & budget',description:'Home size, monthly rent & housing preferences',categories:[],metrics:['cost_of_living'],defaults:['cost_of_living']},
 {id:'peace',color:'#548061',tint:'#edf4e9',name:'Quiet & green',description:'Parks, greenery & environmental comfort',categories:['park','lake','industry','factory','compost','waste_site'],metrics:['park','park_count','public_park_count','lake_count','green_cover','noise','industry','factory','compost','waste_site'],defaults:['park','green_cover','noise']}
];
export function setupInterface({indicators,amenityCards,changeWeights,onLayout,referenceState,toggleReference}){
 const $=id=>document.getElementById(id),mobile=()=>matchMedia('(max-width:760px)').matches;
 const sidebar=document.querySelector('.sidebar'),cards=new Map(),dialogs=[];
 const syncTuningSurface=()=>{const active=dialogs.some(dialog=>dialog.open&&dialog.id.startsWith('tune-'));document.body.classList.toggle('desktop-tuning',!mobile()&&active);document.body.classList.toggle('mobile-tuning',mobile()&&active);onLayout();};
 const closeDialogs=()=>{dialogs.forEach(dialog=>{if(dialog.open)dialog.close();});syncTuningSurface();};
 const showTuning=dialog=>{closeDialogs();$('factor-popover').hidden=true;if(mobile())dialog.showModal();else dialog.show();syncTuningSurface();};
 let tuningTransition=null;
 let textFlights=[];
 const stopTextFlights=()=>{textFlights.forEach(flight=>flight.cancel());textFlights=[];};
 function animateTuningText(from,to,change){
  stopTextFlights();
  const origins=from.map(node=>node.getBoundingClientRect());
  change();
  to.forEach((node,n)=>{
   const origin=origins[n],target=node.getBoundingClientRect();
   if(!origin.width||!origin.height||origin.bottom<0||origin.top>innerHeight||!target.width)return;
   const copy=node.cloneNode(true),style=getComputedStyle(node);
   copy.classList.add('tuning-text-flight');copy.removeAttribute('data-tuning-transition');copy.style.removeProperty('view-transition-name');copy.setAttribute('aria-hidden','true');
   for(const property of ['font-family','font-size','font-weight','line-height','letter-spacing','text-transform','color'])copy.style.setProperty(property,style.getPropertyValue(property));
   Object.assign(copy.style,{margin:'0',left:`${target.left}px`,top:`${target.top}px`,width:`${target.width}px`,height:`${target.height}px`});
   const previousVisibility=node.style.visibility;node.style.visibility='hidden';document.body.append(copy);
   const flight=copy.animate([{transform:`translate(${origin.left-target.left}px,${origin.top-target.top}px) scale(${origin.width/target.width},${origin.height/target.height})`},{transform:'translate(0,0) scale(1,1)'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
   textFlights.push(flight);
   flight.finished.catch(()=>{}).finally(()=>{copy.remove();node.style.visibility=previousVisibility;});
  });
 }
 const clearTransitionNames=()=>document.querySelectorAll('[data-tuning-transition]').forEach(node=>node.style.removeProperty('view-transition-name'));
 function transitionTuning(dialog,opening){
  const card=cards.get(dialog.id.slice(5));
  const change=()=>opening?showTuning(dialog):closeDialogs();
  if(mobile()||matchMedia('(prefers-reduced-motion:reduce)').matches){stopTextFlights();change();return;}
  tuningTransition?.skipTransition();clearTransitionNames();
  const overview=[card.querySelector('.group-icon'),card.querySelector('h3')];
  const detail=[dialog.querySelector('.group-icon'),dialog.querySelector('h2')];
  const from=opening?overview:detail,to=opening?detail:overview;
  if(!document.startViewTransition){animateTuningText(from,to,change);return;}
  const names=['tuning-group-icon','tuning-group-title'];
  from.forEach((node,n)=>node.style.viewTransitionName=names[n]);
  const transition=document.startViewTransition(()=>{from.forEach(node=>node.style.removeProperty('view-transition-name'));to.forEach((node,n)=>node.style.viewTransitionName=names[n]);change();});
  tuningTransition=transition;
  transition.finished.catch(()=>{}).finally(()=>{if(tuningTransition===transition){clearTransitionNames();tuningTransition=null;}});
 }
 const openTuning=dialog=>transitionTuning(dialog,true);
 const closeTuning=dialog=>transitionTuning(dialog,false);
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('desktop-tuning')){const tuning=dialogs.find(dialog=>dialog.open&&dialog.id.startsWith('tune-'));if(tuning)closeTuning(tuning);}});
 matchMedia('(max-width:760px)').addEventListener('change',()=>{const tuning=dialogs.find(dialog=>dialog.open&&dialog.id.startsWith('tune-'));if(tuning)showTuning(tuning);else syncTuningSurface();});
 function panel(name){closeDialogs();if(name==='rankings'){$('clear-selection').click();$('map-leaderboard').hidden=false;}document.body.dataset.mobilePanel=name;$('factor-popover').hidden=true;$('factor-trigger').setAttribute('aria-expanded','false');document.querySelectorAll('[data-nav]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nav===name)));if(name==='index')$('index-builder').open=true;sidebar.scrollTop=0;onLayout();}
 // Reuse the layer buttons so map visibility still has one source of truth.
 const strip=document.createElement('nav');strip.className='map-layer-strip';strip.setAttribute('aria-label','Map layers');
 const order=['metro','bus_station','hospital','bus_stop','rail','school','fire_station'];
 const layerButtons=[...document.querySelectorAll('[data-category]')];
 const ranks=new Map([...order,...layerButtons.map(b=>b.dataset.category).filter(key=>!order.includes(key))].map((key,i)=>[key,i]));layerButtons.sort((a,b)=>ranks.get(a.dataset.category)-ranks.get(b.dataset.category));
 const pin=document.createElement('button');pin.id='destination-layer';pin.className='map-layer-button destination-layer';pin.setAttribute('aria-pressed','false');pin.innerHTML='<span aria-hidden="true">⌖</span> Office / school';strip.append(pin);
 const editPin=document.createElement('button');editPin.className='map-layer-button destination-edit';editPin.setAttribute('aria-label','Search or change destination');editPin.textContent='Search destination';strip.append(editPin);
 for(const button of layerButtons){const row=button.closest('.layer-row');button.dataset.label=row.querySelector('.layer-label').textContent;button.classList.add('map-layer-button');button.textContent=button.dataset.label;strip.append(button);}
 strip.insertBefore(pin,layerButtons[3]);strip.insertBefore(editPin,layerButtons[3]);
 const greenButton=$('green-toggle');greenButton.classList.add('map-layer-button');greenButton.dataset.label='Green cover';greenButton.textContent='Green cover';strip.append(greenButton);
 const clear=$('clear-layers');clear.classList.add('map-layer-button');clear.textContent='Clear layers';strip.append(clear);document.body.append(strip);
 // Compact shortcuts and one expanded, scrollable catalogue reuse the same controls.
 const shortcuts=[...strip.querySelectorAll('.map-layer-button')];
 const toggles=shortcuts.filter(button=>button!==editPin&&button!==clear);
 const catalogue=document.createElement('div');catalogue.id='map-layer-catalogue';catalogue.className='map-layer-catalogue';shortcuts.forEach(button=>catalogue.append(button));strip.append(catalogue);
 const expand=document.createElement('button');expand.className='layer-expand';expand.setAttribute('aria-controls',catalogue.id);expand.innerHTML='<span class="layer-expand-count"></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';strip.append(expand);
 let layersExpanded=false;
 function syncLayerPicker(){
  const selected= toggles.filter(button=>button.getAttribute('aria-pressed')==='true');
  strip.classList.toggle('expanded',layersExpanded);expand.setAttribute('aria-expanded',String(layersExpanded));expand.setAttribute('aria-label',`${layersExpanded?'Collapse':'Show all'} map layers${selected.length?` · ${selected.length} enabled`:''}`);
  expand.querySelector('.layer-expand-count').textContent=layersExpanded?'Close':selected.length?String(selected.length):'All';
  if(layersExpanded){shortcuts.forEach(button=>button.hidden=false);if(catalogue.dataset.expanded!=='true')shortcuts.forEach(button=>catalogue.append(button));catalogue.dataset.expanded='true';return;}
  catalogue.dataset.expanded='false';
  shortcuts.forEach(button=>button.hidden=true);
  const candidates=(selected.length?selected:toggles).slice(0,5);
  candidates.forEach(button=>catalogue.append(button));
  let used=0;const available=catalogue.clientWidth;
  candidates.forEach((button,n)=>{button.hidden=false;const width=button.offsetWidth+(n?8:0);if(n&&used+width>available)button.hidden=true;else used+=width;});
 }
 expand.onclick=()=>{layersExpanded=!layersExpanded;syncLayerPicker();catalogue.scrollTop=0;};
 strip.addEventListener('click',event=>{if(event.target.closest('.map-layer-button'))syncLayerPicker();});
 strip.addEventListener('keydown',event=>{if(event.key==='Escape'&&layersExpanded){event.preventDefault();layersExpanded=false;syncLayerPicker();expand.focus();}});
 new ResizeObserver(syncLayerPicker).observe(strip);
 syncLayerPicker();
 const groupList=document.createElement('div');groupList.className='priority-groups';$('layers-panel').append(groupList);
 for(const group of GROUPS){
  const card=document.createElement('section');card.className='priority-group';themeGroup(card,group);card.innerHTML=`<div class="group-heading"><div><div class="group-title">${groupIcon(group)}<h3 data-tuning-transition>${group.name}</h3></div><p>${group.description}</p></div><span id="group-active-${group.id}" class="group-active"></span></div><label class="group-weight" for="group-weight-${group.id}">Overall weight <output id="group-value-${group.id}">0</output></label><input id="group-weight-${group.id}" type="range" min="0" max="100" aria-label="Overall weight for ${group.name}"><button class="group-tune" type="button"><span class="fine-tune-label">Fine tune</span> <span aria-hidden="true">↗</span></button>`;
  card.querySelector('input').oninput=e=>{const total=Number(e.target.value),selected=group.metrics.filter(key=>indicators[key].included);const keys=selected.length?selected:group.defaults;const oldTotal=keys.reduce((sum,key)=>sum+indicators[key].weight,0);const shares=keys.map(key=>({key,exact:total*(oldTotal?indicators[key].weight/oldTotal:1/keys.length)}));const weights=Object.fromEntries(shares.map(s=>[s.key,Math.floor(s.exact)]));let remainder=total-Object.values(weights).reduce((a,b)=>a+b,0);for(const share of shares.sort((a,b)=>(b.exact-Math.floor(b.exact))-(a.exact-Math.floor(a.exact))))if(remainder-->0)weights[share.key]++;changeWeights(weights);};
  const dialog=document.createElement('dialog');dialog.className='tuning-dialog';dialog.id=`tune-${group.id}`;dialog.setAttribute('aria-label',`${group.name} fine tuning`);themeGroup(dialog,group);dialog.innerHTML=`<header class="tuning-header"><div><span class="eyebrow">Fine tune</span><div class="group-title">${groupIcon(group)}<h2 data-tuning-transition>${group.name}</h2></div></div><button type="button" aria-label="Close ${group.name} controls">✕</button></header><div class="tuning-content"><p class="tuning-intro">Choose factors or refine their weights. Show places using the layer strip above the map. Changes apply immediately.</p></div>`;
  document.body.append(dialog);dialogs.push(dialog);dialog.addEventListener('close',syncTuningSurface);
  const content=dialog.querySelector('.tuning-content');for(const category of group.categories)if(amenityCards[category])content.append(amenityCards[category]);
  if(group.id==='peace')content.append($('green-card'),document.querySelector('.noise-data'));
  if(group.id==='home')content.append($('cost-panel'));
  for(const key of group.metrics){const row=$(`include-${key}`).closest('.weight-row');if(row.parentElement===$('weight-controls'))content.append(row);}
  if(group.id==='access'){content.append(document.querySelector('.unavailable-metric'));content.prepend(document.querySelector('.reference-search'));content.append($('pick-reference'),$('reference-note'));}
  const open=()=>{openTuning(dialog);content.scrollTop=0;};card.querySelector('button').onclick=open;dialog.querySelector('header button').onclick=()=>closeTuning(dialog);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  if(group.id==='home'){const note=document.createElement('p');note.id='budget-coverage-summary';note.className='group-coverage-note';card.append(note);}
  groupList.append(card);cards.set(group.id,card);
 }
 // Keep secondary data notes out of the main priority view.
 const notes=document.createElement('details');notes.className='source-notes';notes.innerHTML='<summary>Data coverage & limitations</summary>';for(const p of [...$('layers-panel').children])if(p.tagName==='P')notes.append(p);$('layers-panel').append(notes);
 $('layers-panel').querySelector('.section-title').textContent='Your priorities';
 const indexSection=$('index-builder').parentElement;indexSection.classList.add('index-section');const docs=document.createElement('nav');docs.className='index-docs';docs.setAttribute('aria-label','Project documentation');docs.innerHTML='<a href="./vision/">Our vision ↗</a><a href="./sources/">Data sources ↗</a>';indexSection.append(docs);
 const searchSection=document.createElement('section');searchSection.className='search-section';sidebar.insertBefore(searchSection,$('layers-panel'));searchSection.append(document.querySelector('.search-wrap'),$('filters'));
 const mapSettings=document.createElement('details');mapSettings.className='map-settings';mapSettings.innerHTML='<summary>Map appearance & boundaries</summary>';sidebar.insertBefore(mapSettings,$('layers-panel'));for(const section of [...sidebar.children])if(section.classList.contains('panel-section')&&section!==$('layers-panel')&&section!==indexSection)mapSettings.append(section);
 const quickNav=document.querySelector('.quick-nav');quickNav.querySelector('a[href="#layers-panel"]').textContent='Priorities';quickNav.querySelector('a[href="#index-builder"]').textContent='My index';
 const header=document.createElement('header');header.className='mobile-sheet-header';header.innerHTML='<span id="mobile-sheet-title">Your priorities</span><button type="button" aria-label="Close panel">✕</button>';header.querySelector('button').onclick=()=>panel('map');sidebar.prepend(header);
 const nav=document.createElement('nav');nav.className='mobile-nav';nav.setAttribute('aria-label','Map navigation');for(const [name,label] of [['map','Map'],['priorities','Priorities'],['rankings','Top wards'],['index','My index'],['search','Search']]){const b=document.createElement('button');b.dataset.nav=name;b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${ICONS[name]}</svg><span>${label}</span>`;b.onclick=()=>{panel(document.body.dataset.mobilePanel===name?'map':name);$('mobile-sheet-title').textContent={priorities:'Your priorities',index:'Your index',search:'Find a ward'}[name]||'';};nav.append(b);}document.body.append(nav);
 const scrim=document.createElement('button');scrim.className='mobile-sheet-scrim';scrim.setAttribute('aria-label','Close panel');scrim.onclick=()=>panel('map');document.body.append(scrim);
 const rankingClose=document.createElement('button');rankingClose.className='ranking-close';rankingClose.setAttribute('aria-label','Close top wards');rankingClose.textContent='✕';rankingClose.onclick=()=>panel('map');$('map-leaderboard').prepend(rankingClose);
 document.querySelectorAll('.quick-nav a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{if(mobile()){e.preventDefault();panel(link.hash==='#layers-panel'?'priorities':'index');}}));

 const destinationDialog=document.createElement('dialog');destinationDialog.className='tuning-dialog destination-dialog';destinationDialog.setAttribute('aria-label','Choose your destination');destinationDialog.innerHTML='<header class="tuning-header"><div><span class="eyebrow">OFFICE / SCHOOL / LANDMARK</span><h2>Your destination</h2></div><button aria-label="Close destination search">✕</button></header><div class="tuning-content"></div>';document.body.append(destinationDialog);dialogs.push(destinationDialog);destinationDialog.querySelector('.tuning-content').append(document.querySelector('.reference-search'),$('pick-reference'),$('reference-note'));destinationDialog.querySelector('header button').onclick=()=>destinationDialog.close();
 const openDestination=()=>{panel('map');destinationDialog.showModal();$('place-search').focus();};editPin.onclick=openDestination;pin.onclick=()=>referenceState().chosen?toggleReference():openDestination();
 const placeDialog=document.createElement('dialog');placeDialog.className='tuning-dialog place-dialog';placeDialog.setAttribute('aria-label','Mapped place details');placeDialog.innerHTML='<header class="tuning-header"><h2>Mapped place</h2><button aria-label="Close place details">✕</button></header><div class="tuning-content"></div>';document.body.append(placeDialog);dialogs.push(placeDialog);placeDialog.querySelector('button').onclick=()=>placeDialog.close();
 // Reserve actual screen space for map chrome, instead of relying on z-index.
 const zoom=document.querySelector('.leaflet-control-zoom');zoom.classList.add('map-zoom-dock');document.body.append(zoom);
 const root=document.documentElement;
 const setSpace=(key,value)=>{const px=`${Math.round(value)}px`;if(root.style.getPropertyValue(key)!==px)root.style.setProperty(key,px);};
 const visible=node=>node&&!node.hidden&&getComputedStyle(node).display!=='none'&&getComputedStyle(node).visibility!=='hidden';
 let overlayFrame=0;
 function arrangeOverlays(){
  overlayFrame=0;
  const gap=12,mapRect=$('map').getBoundingClientRect(),counter=document.querySelector('.map-counter'),legend=$('transit-legend');
  let bottom=mapRect.bottom;
  if(mobile()){
   const navRect=nav.getBoundingClientRect();bottom=Math.min(bottom,navRect.top);
   for(const sheet of [sidebar,$('map-leaderboard'),$('ward-inspector'),...dialogs])if(visible(sheet)&&sheet.getBoundingClientRect().top>mapRect.top)bottom=Math.min(bottom,sheet.getBoundingClientRect().top);
  }
  const counterHeight=visible(counter)?counter.offsetHeight:0;
  setSpace('--overlay-zoom-bottom',innerHeight-bottom+gap+12);
  setSpace('--overlay-counter-bottom',innerHeight-bottom+gap+12);
  setSpace('--overlay-legend-bottom',innerHeight-bottom+gap+12+counterHeight+gap);
  const stripTop=document.querySelector('.map-topbar').getBoundingClientRect().bottom+gap;
  setSpace('--overlay-layers-top',stripTop);
  setSpace('--overlay-catalogue-height',Math.max(44,Math.min(innerHeight*.4,(bottom-stripTop-110)*.48)));
  const stripBottom=strip.getBoundingClientRect().bottom;
  const mapChrome=stripBottom+zoom.offsetHeight+gap*3;
  setSpace('--overlay-mobile-sheet-height',Math.max(44,nav.getBoundingClientRect().top-mapChrome));
  setSpace('--overlay-mobile-tuning-height',Math.max(150,innerHeight-mapChrome));
  const resultsTop=stripBottom+gap,zoomTop=zoom.getBoundingClientRect().top;
  setSpace('--overlay-results-top',resultsTop);
  const resultsFloor=visible(counter)?Math.min(zoomTop,counter.getBoundingClientRect().top):zoomTop;
  setSpace('--overlay-results-height',Math.max(44,resultsFloor-resultsTop-gap));
  const results=[$('map-leaderboard'),$('ward-inspector')].find(visible);
  const left=mobile()?16:mapRect.left+24;
  const right=mobile()?innerWidth-16:results?results.getBoundingClientRect().left-gap:innerWidth-80;
  const floor=visible(legend)?legend.getBoundingClientRect().top-gap:visible(counter)?counter.getBoundingClientRect().top-gap:zoomTop-gap;
  setSpace('--overlay-preview-left',left);setSpace('--overlay-preview-right',right);
  setSpace('--overlay-preview-top',resultsTop);setSpace('--overlay-preview-bottom',floor);
  setSpace('--overlay-preview-width',Math.max(100,right-left));
  setSpace('--overlay-preview-height',Math.max(44,floor-resultsTop));
  setSpace('--overlay-popover-bottom',innerHeight-floor);
 }
 const requestOverlayLayout=()=>{if(!overlayFrame)overlayFrame=requestAnimationFrame(arrangeOverlays);};
 const overlaySizes=new ResizeObserver(requestOverlayLayout);
 [strip,zoom,document.querySelector('.map-topbar'),document.querySelector('.map-counter'),$('map'),$('transit-legend'),sidebar,$('map-leaderboard'),$('ward-inspector'),...dialogs].forEach(node=>overlaySizes.observe(node));
 const overlayVisibility=new MutationObserver(requestOverlayLayout);
 overlayVisibility.observe(document.body,{attributes:true,attributeFilter:['class','data-mobile-panel']});
 [strip,$('transit-legend'),$('map-leaderboard'),$('ward-inspector'),$('factor-popover'),...dialogs].forEach(node=>overlayVisibility.observe(node,{attributes:true,attributeFilter:['hidden','open','aria-expanded','class']}));
 window.addEventListener('resize',requestOverlayLayout);
 panel('map');requestOverlayLayout();
 return {
  sync(){const destination=referenceState();pin.classList.toggle('on',destination.visible);pin.setAttribute('aria-pressed',String(destination.visible));pin.setAttribute('aria-label',destination.chosen?`${destination.visible?'Hide':'Show'} destination pin: ${destination.name}`:'Choose office, school or destination');syncLayerPicker();for(const group of GROUPS){const chosen=group.metrics.filter(key=>indicators[key].included);const total=chosen.reduce((sum,key)=>sum+indicators[key].weight,0);$(`group-value-${group.id}`).textContent=total;$(`group-weight-${group.id}`).max=Math.max(100,total);$(`group-weight-${group.id}`).value=total;$(`group-active-${group.id}`).textContent=`${chosen.length} selected`;cards.get(group.id).classList.toggle('has-factors',chosen.length>0);}},
  setBudgetCoverage(covered,total,active,strict,inferred=0){
   const note=$('budget-coverage-summary');
   const detail=inferred?` · ${inferred} inferred`:'';
   const missing=active&&covered<total?(strict?' Others are excluded.':' Others show partial scores.'):'';
   note.textContent=covered?`Rent estimates: ${covered} / ${total} wards${detail}.${missing}`:`No matching rent estimates.${active?(strict?' Rent required: overall scores unavailable.':' Budget is unassessed; other factors still apply.'):''}`;
  },
  revealFactor(key){const group=GROUPS.find(g=>g.metrics.includes(key));if(group)openTuning($(`tune-${group.id}`));},
  selectWard(){if(mobile())panel('details');},
  closeWard(){if(mobile())panel('map');},
  pickOnMap(){closeDialogs();if(mobile())panel('map');},
  inspectPlace(html){panel('map');placeDialog.querySelector('.tuning-content').innerHTML=html;placeDialog.showModal();},
  isMobile:mobile
 };
}
