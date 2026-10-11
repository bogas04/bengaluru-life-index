# Bengaluru Life Index

A ward map and civic evidence prototype for Bengaluru. Help concerned citizens and locality-focused groups understand conditions, compare gaps, and make a clear case for change.

**Data → issues → improve.** Gather inspectable evidence, use it to debate, protest or raise specific concerns with civic bodies, then track responses and outcomes. Choosing where to live is another use of the same data.

[Explore the app](https://bogas04.github.io/bengaluru-life-index/) · [Product vision](https://bogas04.github.io/bengaluru-life-index/vision/) · [Sources & methods](https://bogas04.github.io/bengaluru-life-index/sources/)

## Status

Working static prototype with bundled data snapshots. Ward exploration, amenity layers and preference indices are implemented. Evidence packs, issue reporting, verified civic contacts and response tracking are future work.

The primary audience is concerned residents, resident associations and groups documenting their localities, including people making neighbourhood walks and videos such as BengaWalk on YouTube. The product aims to make civic conversations more data oriented: specific claims, visible sources, comparable measures and measurable outcomes, with less reliance on vague impressions or community-identity framing.

## What works today

| Feature | Current implementation |
| --- | --- |
| Ward map | 369 GBA wards, corporation filters, ward/name search and selection |
| Boundaries | Ward outlines and 28 assembly outlines derived within the GBA footprint |
| Amenity layers | Transport, education, healthcare, emergency services, parks, lakes, leisure and industrial/waste sites |
| Transit display | Metro line colors and mapped track paths; distinct metro, bus and rail symbols |
| Ward scores | Individual metrics or a custom weighted index, on a red-to-green 0–1 scale |
| Index controls | Co-located layer visibility, metric selection, weights, direction, credits and source links |
| Guided setup | Skippable questionnaire for lifestyle, optional total budget, travel preference and priorities |
| Templates | Four editable starting configurations; definitions in [presets.js](presets.js) |
| Destination search | Local search across named OSM buildings, landmarks, businesses, schools and localities; manual map selection also available |
| Ward inspection | One compact hover preview; click for a detailed panel with raw values, component scores and weights |
| Rankings | Top five matching wards; click to highlight and frame a ward |
| Factor navigation | Hover or click the selected-factor count, then jump to a factor’s sidebar controls |
| Save and share | Named configurations, local drafts, share links, JSON export and import |
| Documentation | [Vision page](vision/index.html) and [source catalogue](sources/index.html) |

Show/Hide buttons control map visibility independently of index inclusion. Editing a weight selects that factor, activates the weighted view and restores ward visibility. Unused amenity cards are muted. Selected factors with zero weight appear in the factor count but do not contribute to the score.

Hover previews show up to three factors with the highest positive weights. Clicking a ward opens the full breakdown in a persistent panel that replaces the leaderboard; closing it restores the rankings.

## Run locally

Requires Node.js and npm:

```sh
npm run dev
```

Open `http://localhost:4173/`. The command uses `npx serve` to host the project as a regular website. There is no application build step or backend. Internet access is needed for the Leaflet CDN and OpenStreetMap tiles; ward, amenity and search data are bundled locally.

## Data and credits

Current snapshots were assembled on 11 October 2026. Detailed timestamps, publisher links, licence notes, coverage and transformations are documented on the [Sources page](sources/index.html) and in dataset metadata.

| Source | Used for | Important qualification |
| --- | --- | --- |
| OpenCity / GBA, via Bharat Atlas | November 2025 ward boundaries and boundary attributes | Export coordinate order was corrected to GeoJSON longitude/latitude; legacy 2011 population fields are not current estimates |
| OpenStreetMap contributors, via Overpass | Amenities, metro geometry, roads, exposure sites and named destinations | Community mapping varies in completeness; counts are OSM objects, not audited unique facilities |
| Bengaluru Rent Index / Harshit Anand | October 2026 locality rent medians | Ward costs use a nearby-locality approximation, not measured ward rent |
| bengaluru.rent / Harshit Anand, Copernicus Sentinel-2 | Vegetation visualization dated 28 March 2026 | Derived ward scores measure display signal, not NDVI or canopy percentage |
| CPCB Annual Report 2022–23 | Historical 2022 station-level noise observations | Shown for context; not current ward readings or calibration for the road proxy |

The snapshot includes 12,704 city amenity objects, 1,772 industrial/waste objects in the city and buffer, and a separate directory of 92,049 named destinations. Data refreshes can change these totals. Metro assignments currently cover Purple, Green and Yellow line objects in the snapshot; this is not a verified complete network census.

Assembly outlines are dissolved from wards by constituency attributes and clipped to GBA. They are not separately sourced full official constituency boundaries.

OSM data is © OpenStreetMap contributors under ODbL. Vegetation attribution: **Contains modified Copernicus Sentinel-2 data [2026]**. Other datasets retain their own publisher terms; see the source catalogue. The repository does not assign a new licence to third-party data.

## How the scores work

Scores express the selected preferences. They are not official livability, noise, safety or service-quality ratings. Gray means unavailable. Raw counts and distances remain visible alongside scores.

| Metric | Calculation |
| --- | --- |
| Amenity count | Ward count / highest count across all 369 wards |
| Proximity | `max(0, 1 − straight-line distance / threshold)` from a representative point inside the ward |
| Industrial/waste distance | Farther preferred by default; distance / threshold, capped at 1 |
| Road-pressure noise proxy | Clipped road length × estimated carriageway width × class factor / ward area; score decreases relative to the highest city pressure |
| Within-ward essentials | Presence of healthcare, pharmacy, park and bus-stop groups, divided by four |
| Living cost | Nearby locality rent + non-rent expense assumption; `max(0, 1 − cost / (2 × monthly budget))` |
| Green cover | Mean raster display alpha inside each ward, normalized to the largest covered-ward mean |
| Reverse preference | `1 − base score` |
| Custom index | `sum(weight × available score) / sum(available selected weights)` |

### Distances and counts

Proximity thresholds: metro 3 km, bus stop 1 km, hospital 5 km, park 2 km, pharmacy 1.5 km, airport 60 km and a chosen destination 15 km. Farther-from-site thresholds are 5 km for industry/factories and 3 km for compost/waste sites.

Distances use mapped points or geometry centres, not walking routes, entrances, terminal access or site perimeters. Objects crossing ward boundaries can be assigned by their centres. Duplicated point/area representations may inflate counts. Count normalization always uses the entire city, so filtering does not change a metric’s scale.

Lake counts require `water=lake`. Explicit public-park counts require public/permissive access tags; other parks remain available separately. Starbucks has its own category rather than contributing to generic café counts. Counts do not establish suitability, opening hours, quality or capacity.

### Missing data and weighting

Unselected, zero-weight and unavailable factors do not contribute. Available weights are renormalized; if none remain, the result is unavailable. **Exception:** when living cost has a positive custom weight, a ward without rent coverage has no total score, so missing affordability cannot improve its rank.

Weights are relative. Increasing the only active factor’s weight does not change its normalized score. Rankings follow ward/corporation filters, omit unavailable totals and break ties by ward name. A high weight changes contribution, not the underlying raw value.

### Costs, greenery and noise

Rent is matched to the nearest eligible OSM locality centre within 2 km. Current coverage is 67 wards for 1 BHK, 115 for 2 BHK and 7 for 3 BHK. Sarjapur Road is omitted because it has no unambiguous locality centre. The guide asks only for total monthly budget including rent; it starts other expenses at 30% of that budget, explicitly as an editable assumption. Templates have their own spending scenarios. Deposits and moving costs are excluded; these settings are not income predictions by age.

Green-cover summaries sample pixel centres with cosine-latitude weights and require at least 95% raster extent coverage. Currently 366 wards have scores and three are unavailable. Transparent pixels count as zero display signal; cloud/no-data masks and original processing thresholds are not supplied. This does not measure public access, footpath shade or canopy percentage.

The noise proxy uses tagged carriageway width, otherwise lanes × 3.2 m, otherwise road-class defaults. It is uncalibrated infrastructure intensity, not dB. It omits traffic volume, horns, shielding, construction and time of day. Likewise, distance from industrial/waste sites does not measure odour, emissions or health risk.

## Configurations and privacy

- Changes are saved in this browser’s local storage, including a chosen destination. A shared URL takes priority over the local draft.
- Share links encode settings in a readable URL fragment; JSON export/import is an alternative. There is no account or configuration-upload backend.
- Destination name and precise coordinates are excluded from sharing by default. The explicit reference-location checkbox includes them; anyone with that link/file can read them.
- Configurations use `version: 1` and `ward-model-v1`. They record source snapshot signatures, not embedded data or frozen rankings. Updated snapshots may produce different results.
- The welcome guide appears once per browser, supports Skip and can be reopened. Completing it replaces the current index; skipping preserves it. Shared configurations bypass the welcome.
- Base tiles and Leaflet are requested from external services. Localhost share links work only on that computer; hosted links can be opened by others.

## Civic roadmap

The next direction is to make evidence useful for action:

1. **Understand ward issues:** identify service gaps and dated street/environmental observations, with confidence and missing-data indicators.
2. **Build evidence packs:** connect an issue and location to sources, observations, comparisons and a specific requested action.
3. **Find the responsible body:** maintain verified civic contacts, reporting channels and escalation paths.
4. **Compare wards:** inspect the same factors, weights and snapshot side by side, and explain the largest gaps.
5. **Track action:** retain official responses and revisit outcomes against a baseline.
6. **Work backward from 2041–2046:** define measurable city outcomes for the next 15–20 years, then trace milestones, investments and near-term interventions.

Planned layer groups: **civic & essentials**, **entertainment & leisure**, **work & daily journeys**, **environment & comfort**, **housing & affordability**, and **streets & safety**. Grouped controls are not implemented yet.

Route questions remain longer-term goals: public transport plus pleasant walking to a destination; affordable localities with a commute to work; and rain conditions along a scooter route. They require connected networks, service timings and dated, verified street observations.

**Not implemented:** journey-time routing, metro-only travel times, per-capita metrics, verified footpath width/continuity, potholes, waterlogging likelihood, rain-safe routes, live noise or validated odour exposure. Missing observations must not be presented as safe or problem-free.

## Project structure

```text
index.html                 Map interface and styles
app.js                     Layers, scoring, search, configuration and ward inspection
presets.js                 Editable starter weights and spending scenarios
questionnaire.js           Guided starting-index flow
data/                      Bundled source snapshots and derived ward summaries
scripts/                   Saved Overpass queries and Python preparation scripts
sources/index.html         Source catalogue and methods
vision/index.html          Audience, civic purpose and long-term direction
.github/workflows/pages.yml GitHub Pages deployment
```

## Refreshing data

Preparation runs offline; the browser only consumes generated files. Use an isolated Python environment with Shapely; the vegetation script also requires Pillow and NumPy. Scripts contain snapshot-specific filenames and metadata that must be updated when changing editions.

The base amenity preparation overwrites `amenities.json`. Run exposure and metro enrichment again afterward:

```sh
python scripts/prepare_ward_boundaries.py

curl --fail --get --data-urlencode data@scripts/amenities.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-osm.json
curl --fail --get --data-urlencode data@scripts/extra-amenities.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-extra.json
python scripts/prepare_layers.py /tmp/bengaluru-osm.json /tmp/bengaluru-extra.json

curl --fail --get --data-urlencode data@scripts/exposure-sites.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-sites.json
curl --fail --get --data-urlencode data@scripts/roads.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-roads.json
python scripts/prepare_exposure.py /tmp/bengaluru-sites.json /tmp/bengaluru-roads.json

curl --fail --get --data-urlencode data@scripts/metro-routes.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-metro-routes.json
python scripts/prepare_metro_routes.py /tmp/bengaluru-metro-routes.json

curl --fail --get --data-urlencode data@scripts/search-places.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-search.json
python scripts/prepare_search_places.py /tmp/bengaluru-search.json
```

Download the attributed rent CSV and vegetation raster from their publishers before running `prepare_living_cost.py` and `prepare_green_cover.py`. Update the edition, source date, filenames and raster extent as needed, then run `python scripts/prepare_sources_page.py` last. Data is not automatically refreshed by deployment. Review coverage, geometry assignments, attribution and metadata before publishing a new snapshot.

## Deployment

The [Pages workflow](.github/workflows/pages.yml) packages site files, documentation pages and data, then deploys every push to `main`. It can also be started manually. Repository **Settings → Pages → Source** must be **GitHub Actions**.

Relative links support both localhost and the `/bengaluru-life-index/` Pages path. Processing scripts and local preview screenshots are excluded from the deployed artifact.

## Contributing

Useful contributions include reviewing ward assignments, documenting missing services, supplying permitted datasets, improving metric definitions and building the civic evidence workflow. Include source, licence, observation date, geography and limitations with every data contribution. Keep measured observations distinct from inferred conditions, and preserve uncertainty in the interface.
