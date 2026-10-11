# Bengaluru Life Index

An interactive map for exploring Bengaluru's wards, public infrastructure, street conditions, environment, and everyday access to city services.

## Throwaway prototype

The first prototype is a static web page in [`index.html`](./index.html). It loads the 369 GBA ward boundaries notified in November 2025, lets you filter by corporation, search ward names/numbers, and select a ward to inspect the available boundary attributes. Other layer controls are visual placeholders; the prototype does not yet contain validated amenity, transport, walkability, or hazard metrics.

Run it from this directory with:

```bash
npm run dev
```

Then open `http://localhost:4173`. The `dev` command uses `npx serve` to host the folder as a regular website. Ward boundaries are bundled in `data/wards-bengaluru-gba.geojson`, so they load locally; the page still needs internet for Leaflet and OpenStreetMap tiles. The downloaded export had latitude and longitude reversed from GeoJSON's required coordinate order. [`scripts/prepare_ward_boundaries.py`](./scripts/prepare_ward_boundaries.py) refreshes the source and corrects that axis order before writing the local data file. Data credits and source links are shown on the map and in the interface. The boundary source is [OpenCity's GBA ward dataset](https://data.opencity.in/dataset/gba-wards-delimitation-2025), served as a GeoJSON export by [Bharat Atlas](https://bharatlas.com/view/wards_bengaluru_gba); the map background uses [OpenStreetMap](https://www.openstreetmap.org/copyright).

The experience should feel familiar to people who use Google Maps or Windy: start with a navigable map, turn data layers on and off, select a ward to inspect its profile, and eventually plan trips using public transport and walking conditions. The purpose is to make civic data easier to explore and compare—not to present incomplete data as an official scorecard.

## Why this exists

Citywide averages hide major differences between neighbourhoods. This project aims to bring public datasets together on a consistent ward map so residents, researchers, journalists, and civic groups can ask questions such as:

- How many schools, fire stations, parks, lakes, bus stops, and metro stations are mapped in each ward?
- How much road or footpath network is mapped, and how does it compare per resident or per square kilometre?
- Which streets have usable, continuous footpaths, and where are sidewalks narrow, blocked, or missing?
- Where and when do potholes or waterlogging make a route unpleasant or difficult?
- Which wards have better access to public amenities, and where are important gaps?
- Which destination can I reach by public transport with the most pleasant final walk?
- Which localities fit a rent budget of X and have a reasonable public-transport commute to Y?
- Can I ride my scooter from X to Y during the rains, and which route has fewer known hazards?
- How do these patterns change when looking at a different ward-boundary edition or data source?

These questions express the product vision: help people relate where they live and go to the quality, cost, and conditions of getting around Bengaluru. They are examples of the questions the app should work toward answering, not promises that every answer or dataset will be available in the first release.

## Product direction

### Map layers

The map will support selectable thematic layers. Initial candidates include:

- Schools and other education facilities
- Fire stations and emergency services
- Roads and footpaths
- Footpath width, continuity, obstructions, crossings, and surface quality, where measurable
- Pothole and waterlogging reports, with observation dates and seasonal context
- BMTC bus stops and routes
- Metro stations and lines
- Parks, playgrounds, and lakes
- Other public facilities as reliable datasets become available

A layer should explain what it counts, where the data came from, when it was updated, and what is missing. Point features (such as schools) and network or area features (such as roads, footpaths, parks, and lakes) need suitable, clearly labelled measures.

### Route and access questions (eventual goal)

The map should eventually answer questions such as: **"Which Starbucks can I get to by public transport, with a pleasant walk at either end?"** The same approach should work for other destinations and origin points.

Other eventual questions include **"Which locality fits my rent budget and has a reasonable public-transport commute to work?"** and **"Can I ride my scooter from X to Y during the rains, and which route has fewer known hazards?"** These combine several kinds of evidence rather than one ward score: rent listings or area-level rent estimates, transit routes and service times, walking and road networks, rainfall, waterlogging history, pothole reports, and potentially traffic or road-safety data. Answers should show the assumptions and freshness of each input, let people compare trade-offs, and avoid presenting an estimate as a guarantee of affordability, travel time, or safety.

A useful answer would compare candidate destinations and show the journey behind each result: walking distance to and from transit, transit legs and transfers, total time where reliable schedules are available, and a breakdown of walking conditions along the route. A walking quality view could include footpath presence and width, continuity, crossings, shade, surface condition, reported potholes, and waterlogging risk. Users should be able to prioritize factors such as fewer transfers, shorter walking, wider footpaths, or fewer known hazards, and inspect why a route ranked well.

This requires a routable street and footpath network connected to transit stops, routes, and preferably service times. Route-level data should be attached to street segments where possible; ward averages alone cannot tell whether a specific walk is pleasant. Conditions such as potholes and waterlogging are time-sensitive, so reports need dates, confidence, and freshness indicators. If no reliable observation exists, show the condition as unknown rather than safe or clear. Initial versions can compare mapped evidence and relative walking conditions, but should not imply live navigation or real-time hazard detection.

Some street conditions will need to be estimated because complete citywide measurements may not exist. Candidate evidence includes citizen reports and civic complaint records, field surveys, street-level imagery where reuse is permitted, mapped footway geometry, rainfall, elevation, drainage and lake networks, and documented waterlogging locations. For example, a waterlogging likelihood model could combine low-lying terrain, drainage context, rainfall, and past dated observations. A pothole layer could combine verified reports and road-condition surveys. These are hypotheses to validate, not substitutes for observation: keep measured reports separate from modelled likelihoods and publish the method and confidence.

### Ward profiles

Selecting a ward should open a profile with its name and boundary edition, area, population reference (when available), metric values, data dates, and links to sources. Comparisons should show both raw counts and useful normalized measures where appropriate:

- Counts, such as schools or fire stations
- Density, such as mapped road kilometres per square kilometre
- Per-capita measures, only when a population estimate with a documented year and boundary match is available
- Access measures, such as residents within a defined walking distance of a facility, when the underlying data supports that analysis

A per-capita figure is not meaningful for every metric. For example, road length is often better shown as network length per area, while facility counts may be shown per population alongside the raw count.

### Indices

Longer term, the project may publish transparent composite measures such as a **Neighbourhood Access Index**, **Walking Comfort Index**, **Public Realm Index**, or **Noise Exposure Index**. These are project-defined analytical measures, not official government ratings. A route-level walking comfort estimate could combine sidewalk availability and width, continuity, crossing quality, shade, surface condition, and recent hazard reports, while exposing those components separately.

Each index must publish its component indicators, definitions, data vintage, normalization method, weights, missing-data treatment, and known limitations. A future noise measure should use actual, sourced noise observations or a clearly documented model; amenity counts alone cannot establish noise exposure. Waterlogging and pothole indicators should retain location, date, and confidence rather than being reduced to timeless ward scores. Avoid a single headline "livability" score until its meaning and methodology can be explained and reviewed.

## First milestone

Build a small, dependable first version before expanding the catalogue:

1. Select and document one authoritative Bengaluru ward-boundary edition.
2. Load ward polygons, a modest set of well-sourced amenity datasets, and a baseline street/footpath network.
3. Show those features on a navigable map with toggleable layers.
4. Calculate ward-level counts and appropriate area-normalized metrics, plus an initial walking-network coverage measure if data supports it.
5. Add a ward profile with source, date, coverage, and caveats for every value.
6. Keep the data preparation repeatable so new snapshots can be incorporated later.

The first release should prioritize clear provenance and correct ward assignment over the number of layers.

## Data sources

Potential starting points include:

- [OpenCity Bengaluru datasets](https://data.opencity.in/): civic datasets, ward maps, public-goods data, and datasets from city agencies. Dataset freshness, boundary version, completeness, and reuse licence must be checked individually. OpenCity's ward information collection includes historical BBMP ward maps and newer Greater Bengaluru Authority delimitation resources; these boundary editions are not interchangeable.
- [OpenStreetMap](https://www.openstreetmap.org/): mapped streets, footways, schools, parks, water bodies, transit stops, and other points of interest. Coverage varies by feature and neighbourhood, and absence from OSM does not prove a facility is absent in reality. Public use must follow OSM attribution and ODbL requirements; see [OpenStreetMap's copyright and licence page](https://www.openstreetmap.org/copyright).
- Official agency sources: Greater Bengaluru Authority/corporation boundary notifications and maps, BBMP and successor agency facility records, BMTC, BMRCL, and other relevant public bodies, where downloadable data is available.

These are candidate sources, not guarantees that each desired metric is currently available in a usable, ward-ready format. Before a dataset is included, record its publisher, source URL, licence or reuse terms, download date, observation period, geometry, boundary edition, transformations, and known gaps.

## Boundary and data principles

- **Version boundaries.** Store a boundary edition and source with every ward identifier. Never silently join old ward data to a newer boundary map.
- **Preserve source data.** Keep downloaded snapshots and repeatable processing steps separate from the derived map data.
- **Make uncertainty visible.** Distinguish zero from unknown, unavailable, stale, or incomplete values.
- **Avoid false comparisons.** Compare wards only when the metric definition, data vintage, and geography are sufficiently consistent.
- **Treat OSM as a community map, not a census.** Report that mapped counts are a lower bound where completeness is unknown.
- **Respect licences.** Review each source's terms before redistribution; provide attribution and licence links in the product and data exports.
- **Explain calculations.** Publish formulas, units, population year, and caveats alongside derived metrics and indices.

## Data catalogue (planned)

| Theme | Candidate measures | Notes to resolve |
| --- | --- | --- |
| Education | School count; schools per population; access to schools | Define school types and verify source coverage |
| Emergency response | Fire station count; distance/access coverage | Check for official, current station locations |
| Streets | Road and footpath length; length per area | Define included road/footway classes and network rules |
| Public transport | Bus stop and metro station counts; access coverage | Distinguish stop locations, routes, and service frequency |
| Walkability | Footpath presence, width, continuity, crossings, shade, and surface | Prefer segment-level measurements; document survey or imagery method and distinguish observed from inferred values |
| Street hazards | Pothole locations; observed waterlogging and modelled likelihood | Preserve report date, evidence, confidence, and season; missing reports do not mean no hazard |
| Route access | Transit-plus-walking travel options and walking comfort | Requires connected street/transit networks and reliable service data |
| Green and blue space | Parks, playgrounds, and lakes; area and access | Define facility boundaries and avoid duplicate polygons |
| Population | Population and density | Match year and geography to the selected ward boundaries |
| Environment | Noise observations or exposure estimates | Requires a defensible measurement/model and time period |

## Metric and index design

For each published metric, maintain a definition including:

- **Unit and inclusion rules** (what is counted, and what is excluded)
- **Aggregation rule** (point-in-polygon, line length clipped to ward, polygon area, or another method)
- **Denominator**, if normalized (population year, ward area, or walking catchment)
- **Data source, licence, vintage, and boundary edition**
- **Coverage and limitations**, including missing or uncertain records

For a composite index, document the direction of each indicator, normalization, weights, treatment of missing indicators, and sensitivity to those choices. Publish the component values alongside any score so people can inspect what drives it.

Route estimates should explain the underlying street segments, transit services, assumptions, and data timestamps. Separate measured conditions from inferred ones. For example, a footpath's mapped presence is not proof that it is unobstructed, and a ward with no pothole reports may simply have little reporting coverage.

## Possible implementation shape

The application and data pipeline are not selected yet. A sensible architecture can be chosen after the first data inventory. It will likely need:

- A web map that supports ward polygons, feature layers, filtering, and mobile screens
- A repeatable pipeline that turns sourced raw files into validated geospatial data
- A versioned data catalogue and generated ward-level summaries
- A lightweight way to inspect methodology and source metadata from the interface

Avoid depending on a public tile or geocoding endpoint as if it were an unlimited production API; select map hosting and data services with their usage terms in mind.

## Contributing

Contributions can add data sources, check ward assignments, improve definitions, review index methods, or improve the map. Please include source and licence details with every dataset contribution. Do not submit scraped or copied material unless its terms permit reuse.

## Status

**Planning stage.** This README records the product direction and data principles. No map implementation or validated ward-level dataset is included yet.

## Amenity layers and custom index prototype

The local prototype now includes a dimmed basemap (adjustable detail slider), ward boundaries, and **28 assembly constituency outlines derived by dissolving ward polygons by `ac_no`**. These outlines are clipped to the GBA ward footprint, not the complete official constituency boundaries. Ward delimitation topology and assembly assignment errors carry through to these derived outlines.

`data/amenities.json` bundles an OpenStreetMap snapshot retrieved on 11 October 2026: **12,704 mapped objects** whose point or bounding-box center lies inside the ward footprint. The UI includes metro stations, bus stops and bus stations, railway stations, schools, kindergartens, colleges, universities, fire stations, hospitals, clinics, doctors, pharmacies, parks, lakes/ponds, libraries, police stations, public toilets, cafés, malls, movie theaters, and Starbucks. Points have OSM object links and selected source tags. Layers follow the corporation and ward search filters. Parks and lakes are shown as representative dots, not their full polygons.

Counts are **OSM objects**, not a verified census of unique facilities. Opposite-side bus stops are separate objects; node/area duplicates and misclassified tags can occur. A center outside the city can exclude an area partly inside it. Metro stations are identified from railway stations/halts with subway/metro station tags, `subway=yes`, or a metro network/operator; station entrances and platforms are not counted. All public transit tagging is incomplete and can be inconsistent. No live routes, frequencies, journey planner, footpath widths, potholes, waterlogging, or rain safety inference has been added.

### Individual ward metrics and your life index

Open **Build my index**. The **Color wards by** picker shows any individual metric on a linear red (0) to green (1) scale, or **My weighted index**. Gray means unavailable. Red and green express the selected preference, not an objective judgment of the ward.

Individual count metrics: malls, lakes, explicitly public-access parks, all mapped parks, cinemas, Starbucks, hospitals, schools, bus stops, and fire stations. Count scores are `ward count / maximum city ward count`. The denominator always uses all 369 wards; filtering does not change normalization. Count scores have no per-capita adjustment and zero mapped objects may reflect incomplete coverage.

Definitions:

- Malls: `shop=mall`; movie theaters: `amenity=cinema` (objects, not screens).
- Starbucks: brand or name contains Starbucks. These objects have their own category instead of being included in the generic café category.
- Lakes: `natural=water` and `water=lake`; ponds/reservoirs remain visible in the broader water point layer.
- Public parks: `leisure=park` with `access=yes`, `permissive`, or `designated`. Unknown-access parks are excluded from this strict count. This is an incomplete proxy, not verified public ownership or guaranteed access. All mapped parks remain available separately.

Distance metrics use a representative point inside each ward and straight-line distance to the nearest matching mapped object. `score = max(0, 1 − distance / threshold)`:

| Metric | Threshold for score zero |
| --- | --- |
| Metro proximity | 3 km |
| Bus stop proximity | 1 km |
| Hospital proximity | 5 km |
| Park proximity | 2 km |
| BLR airport distance | 60 km |
| Office / school reference distance | 15 km |

Airport distance uses the OSM BLR aerodrome bounding-box center, not a terminal entrance or road distance. The airport source is included in snapshot metadata. Reference location is chosen by clicking the map and stays in memory for this browser session.

Check metrics to include them in a custom index, set weights from 0–100, and choose **My weighted index**. Each metric also has **More/Fewer is better** or **Closer/Farther is better**; reversal uses `1 − base score`, both for the individual map and the custom score. The weighted average is `sum(weight × score) / sum(available selected weights)`. Unselected, unavailable, and zero-weight indicators are excluded. With no usable selected weights the score is unavailable. The five highest scoring wards in the current filter are selectable. Hover over a ward for its active score and raw count/distance; selection shows individual component scores and weights for the custom index.

**Metro-only travel time to X is explicitly unavailable**, excluded from scoring, and listed as needing data. Station points alone cannot establish connectivity, running times, transfer delays, service availability, or the correct destination station. Implement this using a verified metro network and schedules with clear handling of access walking, waiting, interchange time and unreachable destinations. No fabricated times are used.

Thresholds and count normalization are initial prototype assumptions. This index can reflect OSM mapping completeness. Future work should expose configurable targets and thresholds, population/area normalization, confidence, and network travel time.

### Refreshing the snapshot

Install Python `shapely` in an isolated environment. Fetch the saved query and regenerate the city layers:

```sh
curl --fail --get --data-urlencode data@scripts/amenities.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-osm.json
# Airport is outside the city query; fetch its source separately.
curl --fail --get --data-urlencode data@scripts/extra-amenities.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-extra.json
python scripts/prepare_layers.py /tmp/bengaluru-osm.json /tmp/bengaluru-extra.json
```

The script repairs invalid input geometry for union operations, derives assembly outlines, clips object centers to GBA, assigns each to one ward, and computes counts. Review refreshed data quality before using the resulting scores. OSM data is © OpenStreetMap contributors, licensed ODbL. Snapshot metadata records its source timestamp and retrieval time.

Source documentation: [OSM public transport tags](https://wiki.openstreetmap.org/wiki/Public_transport), [Overpass output and filtering](https://dev.overpass-api.de/overpass-doc/en/criteria/chaining.html), [OSM license](https://www.openstreetmap.org/copyright).

Expanded snapshot includes 74 mall objects, 103 cinema objects and 46 Starbucks objects; these are mapped objects rather than audited facility counts. Tag reference: [OSM cinema](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcinema).

## Name search, noise and industrial / waste proximity

The index panel now includes **Find any destination**. Type a name and choose a result with its place type, available address, ward and coordinates. Search uses named OSM places from a buffered Bengaluru query, including buildings, landmarks, shops, businesses, neighbourhoods, streets, amenities and offices. It matches partial names, alternate names, brands/operators, addresses and ward names, ignoring case and punctuation. It runs locally; unmatched names do not trigger external geocoding. Unknown/missing places can still be chosen on the map. A chosen result becomes the reference distance metric, with a marker. Multiple branches are separate results. OSM locations and names require user review; coverage is not a business directory.

### Noise data and road-pressure proxy

CPCB publishes station-level noise data for Bengaluru. The panel includes historical **2022 day/night annual averages** from table 5.5 of its [Annual Report 2022–23](https://cpcb.nic.in/openpdffile.php?id=UmVwb3J0RmlsZXMvMTY2OV8xNzI3NDE0NTc1X21lZGlhcGhvdG8yOTAyNy5wZGY%3D). These are not current readings or ward-wide observations. The prototype does not interpolate ten stations into 369 wards or use them to calibrate the proxy.

**Noise · road-pressure proxy** is available as an individual choropleth and weighted index component. It represents road infrastructure intensity, not dB(A). For each ward:

```
pressure = sum(road length inside ward × estimated carriageway width × class factor)
           / ward land area
preference score = 1 − pressure / highest city ward pressure
```

Lower pressure is green by default. A ward with no mapped road geometry is unavailable, not automatically quiet. Road count is shown as OSM way segments (not unique named roads), alongside road length and width provenance in the selected ward. Using clipped road length avoids treating arbitrary OSM segment splits as added noise.

Width uses parseable `width:carriageway` or `width` in metres/feet, otherwise `lanes × 3.2 m`, otherwise class defaults. Defaults (metres): motorway/trunk 10, primary 9, secondary 7, tertiary 6, unclassified/residential 5, service 3.5, living street 3. Factors: motorway 4, trunk 3, primary 2.5, secondary 2, tertiary 1.5, unclassified/residential 1, service 0.5, living street 0.4. Link roads use their parent class. These are **uncalibrated prototype assumptions**, not traffic measurements. Only motor-road classes in the saved query are included; road areas and `access=no` are excluded. Width provenance is reported by share of road length.

Road geometry is clipped to wards; lengths and areas use an approximate local planar scale (108,400 m per longitude degree, 111,200 m per latitude degree). Roads beyond the ward, traffic volume, horns, speed, pavement, elevated roads, shielding, building geometry, construction, rail/aircraft noise, and time of day are not modeled. Divided carriageways are distinct mapped ways. Do not interpret low road pressure as established quietness. [OSM width semantics](https://wiki.openstreetmap.org/wiki/Key:width) concern carriageway width, not footpath width.

### Industrial and waste sites

The snapshot adds mapped industrial areas, factories, composting sites, and waste-processing/landfill sites in a buffer around GBA. The KCDC compost location is present as **Karnataka Compost Development Centre - KCDC**, OSM way 287327441. The [BBMP wet-waste handbook](https://apps.bbmpgov.in/SWM/Home/Documents/ReportsandStudies/How%20to%20process%20wet%20wastehandbook.pdf) documents the KCDC City Compost Plant, but its historical description does not verify current operation, throughput, odour, or emissions.

- Industrial areas: `landuse=industrial` or other `industrial` objects not classified below.
- Factories: `man_made=works`, or `industrial=factory/manufacturing`.
- Compost: `industrial=composting`, or names containing compost/KCDC. Name-based matches need review.
- Waste sites: `amenity=waste_transfer_station`, `landuse=landfill`, waste/recycling industrial types, or `recycling:organic=yes`. Not every recycling facility handles compost or creates odour.

Distance metrics use **nearest OSM point / bounding-box center**, not the site perimeter. Farther is preferred by default: distance/5 km, capped at 1, for industrial areas/factories; distance/3 km for compost/waste. Distances include mapped sites outside GBA within the buffer. Site dots are also toggleable; external dots are shown under the all-city filter. Mapping gaps, inactive facilities, overlapping industrial landuse/factory objects and approximate centers remain limitations. This metric does not measure smell, pollution dose, environmental compliance or health risk; wind and plant operation matter.

Refresh these additions after regenerating the base amenity snapshot:

```sh
curl --fail --get --data-urlencode data@scripts/exposure-sites.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-sites.json
curl --fail --get --data-urlencode data@scripts/roads.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-roads.json
python scripts/prepare_exposure.py /tmp/bengaluru-sites.json /tmp/bengaluru-roads.json
```

This requires Shapely. Raw road geometry is processed offline and not shipped to the browser. `exposureMetadata` records source timestamps, formula, defaults and class factors. The snapshot contains 1,434 industrial-area objects, 310 factory objects, two compost-name/tag matches and 26 waste-site objects; these are not audited facility totals.

### Transit symbols and metro line colors

Metro stations use circular **M** badges colored by Purple, Green or Yellow line. Interchanges show a split-color badge with an outer ring. Bus stops/stations use a blue bus pictogram in a rounded square; railway stations use an orange train pictogram in a diamond. A map legend follows the enabled transit layers, and popups name metro lines.

The metro layer also shows mapped track paths in line colors. These are OSM route-member ways, not straight lines drawn between stations. Opposite-direction route ways are deduplicated by OSM way ID within each line. Routes remain visible when ward filters are active, while station symbols follow those filters.

Line assignments come from Namma Metro `route=subway` relations: direct station membership or a station center within 250 m of a route stop/platform. That proximity fallback can be imperfect; the match method is displayed in popups. Unmatched stations show gray, never a guessed line color. The current snapshot assigns 35 Purple-only, 28 Green-only, 10 Yellow-only, one Purple/Green and one Green/Yellow station object. This reflects the existing 75 mapped city station objects, not a complete network census. Route colors use readable display shades for their named lines. [BMRCL schematic map](https://www.bmrc.co.in/schematic-route-map/) is the official map reference.

After regenerating the base snapshot, refresh transit styling data:

```sh
curl --fail --get --data-urlencode data@scripts/metro-routes.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-metro-routes.json
python scripts/prepare_metro_routes.py /tmp/bengaluru-metro-routes.json
```

This is display data, not a travel-time model: route relations and paths alone do not establish verified running/transfer times.

## Starter templates and named, shareable indexes

The index panel has four editable preference starters. The definitions live in `presets.js`, separate from rendering and scoring, so weights can be fine-tuned later. Choosing a template replaces the included metrics, weights and preference directions, switches the map to the custom score and gives the index a starting name/description. It preserves your chosen reference point, but includes reference distance only if you select that metric yourself. Anyone can use any template; these are design hypotheses rather than established demographic preferences.

| Starter | Weights (total 100) |
| --- | --- |
| Single / bachelors | malls 20, park proximity 20, cinemas 15, cafés 15, metro proximity 20, bus proximity 10 |
| Young married couples | hospital proximity 25, park proximity 15, malls 20, cafés 15, road-noise proxy 10, metro proximity 15 |
| Young parents | schools 35, hospital proximity 25, park proximity 20, road-noise proxy 10, bus proximity 10 |
| Retired / local living | road-noise proxy 25, within-ward essentials 25, hospital proximity 15, park proximity 15, bus proximity 10, pharmacy proximity 10 |

Mapped café counts provide a limited going-out proxy, **not fine-dining quality**. Pharmacy proximity uses the existing distance formula with a 1.5 km threshold. **Within-ward essentials** scores presence of four groups equally (0–4 divided by 4): healthcare (any hospital/clinic/doctors), pharmacy, park and bus stop. It does not measure whether services are public, suitable, operating, wheelchair-accessible or within a short walk. Ward boundaries can cut nearby services out of this count. **Walkability remains unavailable**; neither road pressure nor service presence establishes pleasant/accessible footpaths. All earlier coverage and geometry limitations still apply.

### Naming and sharing

Name an index, add a description, and open **Save & share this index**:

- **Copy share link:** encodes the configuration in a versioned URL fragment. It restores selected metrics, weights, directions, the name and description, and opens the custom-score view. There is no account, backend upload, short-link service or publication step.
- **Export configuration:** downloads a JSON file that another user can import into their copy of this app. Export files are also useful for preserving multiple named versions.
- **Import configuration:** reads JSON locally and validates the model/version, weights, booleans, name lengths and optional coordinates. Unsupported metric keys are ignored; invalid settings are rejected. A generated share-link field remains available if clipboard access is blocked.
- **Local draft:** the current configuration is stored in this browser's local storage, including a chosen reference point, and restored on reload. Storage can be disabled by browser privacy settings. A shared URL takes priority over a saved draft.

Reference name and precise coordinates are excluded from exported files/links **by default**. The explicit **Include my reference location coordinates** checkbox includes both; anyone with the file/link can read them. If a reference-dependent metric is included without its location, it is unavailable until the recipient chooses one, so rankings can differ. Template application does not silently include that metric.

This local prototype's link starts with localhost and is only useful on the same computer. Export/import provides portable configuration sharing now. Once the same app is hosted at a public address, fragment links can work across computers without changing the configuration format. Opening a shared link does not publish the app or make a local server public.

Configurations use `version: 1` and scoring model `ward-model-v1`. They record a signature of available source snapshot timestamps, not embedded datasets or frozen rankings. New data may change ranks even with identical weights; the UI warns when the source signature differs. Scoring-model changes should bump the model identifier or provide a migration. The URL payload is readable encoding, not encryption. Existing reference-session-only documentation above is superseded by the local draft behavior here.

### Broad destination directory

`data/search-places.json` is a separate local OSM directory; destinations do not become extra amenity layers or alter ward counts. The directory currently contains 92,049 named objects after excluding route/boundary relations and centres outside the query area. Named way/relation destinations use OSM geometry centres, so large campuses or streets may need a manually chosen entrance. Duplicate OSM representations can appear separately. Search stays within the Bengaluru snapshot and buffer, not a worldwide geocoder. Unmapped places remain selectable on the map.

Refresh using `scripts/search-places.overpass` with a public Overpass endpoint, then run `python scripts/prepare_search_places.py RAW_JSON` (requires Shapely). Existing reference-location configurations remain compatible; the metric is now labelled “Distance from your destination”. Distance is still straight-line, not journey time.

### Co-located layer and score controls

Amenity cards contain their map toggle and related index metrics together (for example hospitals have both count and proximity). Check a metric to include it, adjust its weight/preferences in place, or color wards by that metric directly. Lake and public-park submetrics sit with their parent layers. Destination, airport, noise and within-ward essentials remain in the index panel. Map visibility and index inclusion are separate choices; clearing map layers does not clear index weights. Templates, saved configurations and sharing use the same metric keys.

Ward hover tooltips show the raw mapped count (or distance/proxy value), normalized score and weight for each included custom-index metric. Single-metric views also show the raw value. The selected ward panel includes the same raw values; a high weight changes the contribution, not the underlying count.

### Map leaderboard

Choosing a score or custom index shows the top five matching wards in a panel on the right of the map. The leaderboard follows corporation/search filters, excludes unavailable scores and sorts equal scores by ward name. Clicking a row highlights and frames the ward, opens its count/score tooltip and updates ward details. The selected row is marked. The panel is hidden for corporation-boundary colors; on small screens it scrolls within the space above the bottom controls.

### Living costs and affordability

The October 2026 [Bengaluru Rent Index](https://bengaluru.rent/bengaluru-rent-index) offers a [CSV](https://bengaluru.rent/data/bengaluru-rent-index-2026-10.csv), freely reusable with attribution. These are crowdsourced locality rent medians by BHK, with at least 15 tenant reports in the 90 days ending 6 October 2026. They are not validated ward rent medians or a complete living-cost survey.

`prepare_living_cost.py` matches ward representative points to the closest named OSM locality centre within 2 km, for the selected BHK. This is our geographic approximation; OSM centres may differ from the source's centres. The rent dataset's area radius is also 2 km. Sarjapur Road is omitted because a corridor has no unambiguous locality centre. Coverage: 67 wards for 1 BHK, 115 for 2 BHK and 7 for 3 BHK; all other wards remain unavailable. Ward popups identify the matched locality, number of reports, date, matching distance and rent/expense breakdown. No MG Road price is invented.

Monthly cost = locality rent median + user-entered non-rent household expenses. Score = max(0, 1 − cost / (2 × monthly household spending budget)); cost equal to budget scores 0.5. Lower costs are preferred by default, and the direction is reversible. Deposits/moving costs are excluded. Non-rent assumptions do not vary by ward and are not measured grocery, utility, education or healthcare prices.

If cost has a nonzero weight in a custom index, wards without rent coverage have no total score, so missing affordability cannot win through weight renormalization. Presets now include cost at weights 40/25/20/25 for singles/couples/parents/retired. Starter scenarios respectively use 1/2/2/2 BHK, ₹30k/55k/75k/60k monthly spending budgets and ₹10k/20k/30k/20k non-rent expenses. These are editable product assumptions, not household income predictions based on age. Retired households can have fixed incomes; no age or income is inferred. Sharing/export includes housing size, budget and expense assumptions; older configurations remain loadable with the new cost metric excluded.

To refresh, download the attributed CSV and update its filename/edition in `scripts/prepare_living_cost.py`, then regenerate `data/living-cost.json`.

Ward hover uses SVG paths so empty space in higher amenity/assembly panes cannot intercept ward pointer events. Assembly boundaries are visual overlays. The ward-visibility toggle hides the drawing but retains transparent ward hit areas; ward details remain available. Basic ward hover includes corporation, assembly constituency and counts for active amenity layers, even without a score selected.

### Green cover and sources page

The new `/sources/` page documents every active source, observation/download dates, source links, attribution/licence notes, local files, transformations and missing-data limits. Each metric weight slider has inline credit and a source/method link.

Vegetation visualization: [bengaluru.rent / Harshit Anand](https://bengaluru.rent/), published image date 28 March 2026. Contains modified Copernicus Sentinel-2 data [2026]. The raster is bundled as `data/greenery-overlay.webp`, with extent 12.82–13.12 latitude / 77.45–77.78 longitude. The noninteractive image layer preserves ward hover.

`prepare_green_cover.py` creates `data/green-cover.json`: mean display alpha inside each ward using pixel centres and cosine-latitude weights, normalized by the largest covered-ward mean. At least 95% raster extent coverage is required: 366 wards score; 3 are unavailable. This is a relative vegetation-display proxy, not calibrated NDVI, percentage canopy or walking shade. Transparent pixels are counted as zero signal; the source does not supply cloud/no-data masks or processing thresholds. Green cover can be viewed individually or added to a custom index. Preset weights are unchanged; it is optional. Refresh the raster and rerun the script with Pillow/NumPy/Shapely, preserving its source extent/date, then refresh the sources page metadata.

Run `python scripts/prepare_sources_page.py` to regenerate the sources page metadata after refreshing snapshots.

### Layer and index controls

Amenity Show/Hide buttons control map visibility. Editing a weight automatically selects that factor and colors wards with the weighted index. Unselected amenity cards are muted; their controls remain available. The map counter shows the number of selected factors, including selected factors with zero weight (which do not contribute to the average).

### Guided starting index

A skippable, full-screen welcome asks about lifestyle, optional household spending, travel preference and priorities. Completing it replaces the current index with editable weights: the selected preset supplies a base, selected priorities add weight, then weights are normalized and rounded. Leaving budget blank excludes living costs. Skipping preserves the current index. The guide appears once per browser and can be reopened with “Help me find my priorities”; shared configuration links bypass the welcome. Answers remain local through the existing draft storage.

The guided budget question asks only for total monthly household spending, including rent. It starts other expenses at 30% of that budget, explicitly labeled as an assumption in the guide and editable in the living-cost controls.

Weight edits, factor selection and preference changes activate the weighted ward map immediately. Slider edits also restore ward visibility. Index fills remain visible when boundary strokes are hidden. Weights are relative: changing the sole active factor’s weight does not change its normalized score.

Hover or click the chosen-factor count to see the selected factors and their weights. Click a factor to jump to its sidebar controls; keyboard focus and Escape are supported.

### Map information hierarchy

Only one transient map tooltip is shown at a time. Ward hover previews show the overall score and up to three factors with the highest weights, including their actual values. Click a ward for a persistent detail panel with all selected factors, raw values and source notes. That panel replaces the leaderboard; closing it restores the leaderboard.

## Hosting and deployment

This is a static site: HTML, CSS, JavaScript modules and bundled data. No backend or build dependencies are required.

- Repository: https://github.com/bogas04/bengaluru-life-index
- Website: https://bogas04.github.io/bengaluru-life-index/
- GitHub Actions workflow: `.github/workflows/pages.yml` deploys every push to `main`, or can be run manually.
- Repository Settings → Pages → Source should be **GitHub Actions**.
- Deployment packages only the site files, source documentation and data; processing scripts and local preview screenshots are excluded from the Pages artifact.
- Local development: `npm run dev`.

Links use relative paths so both localhost and the GitHub Pages project path work.
