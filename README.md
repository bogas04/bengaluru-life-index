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
| Index controls | Map-top visibility strip; grouped metric selection, weights, direction, credits and source links |
| Guided setup | Skippable questionnaire for lifestyle, optional rent budget, travel preference and priorities |
| Templates | Four editable starting configurations; definitions in [presets.js](presets.js) |
| Destination search | Local search across named OSM buildings, landmarks, businesses, schools and localities; manual map selection also available |
| Ward inspection | One compact hover preview; click for a detailed panel with raw values, component scores and weights |
| Rankings | Top five matching wards; click to highlight and frame a ward |
| Factor navigation | Hover or click the selected-factor count, then open a factor’s fine-tuning controls |
| Save and share | Named configurations, local drafts, share links, JSON export and import |
| Documentation | [Vision page](vision/index.html) and [source catalogue](sources/index.html) |

A thin, horizontally scrollable layer strip above the map controls visibility independently of index inclusion. All amenity layers and the destination pin start hidden; choose any chip to show it. The Office / school chip lets you choose a destination, then hide/show its pin; Search destination lets you change it. Editing a weight selects that factor, activates the weighted view and restores ward visibility. Unused amenity cards are muted. Selected factors with zero weight appear in the factor count but do not contribute to the score.

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
| Rent affordability | Selected median rent; `max(0, 1 − rent / (2 × rent budget))` |
| Green cover | Mean raster display alpha inside each ward, normalized to the largest covered-ward mean |
| Reverse preference | `1 − base score` |
| Custom index | `sum(weight × available score) / sum(available selected weights)` |

### Distances and counts

Proximity thresholds: metro 3 km, bus stop 1 km, hospital 5 km, park 2 km, pharmacy 1.5 km, airport 60 km and a chosen destination 15 km. Farther-from-site thresholds are 5 km for industry/factories and 3 km for compost/waste sites.

Distances use mapped points or geometry centres, not walking routes, entrances, terminal access or site perimeters. Objects crossing ward boundaries can be assigned by their centres. Duplicated point/area representations may inflate counts. Count normalization always uses the entire city, so filtering does not change a metric’s scale.

Lake counts require `water=lake`. Explicit public-park counts require public/permissive access tags; other parks remain available separately. High-end coffee stores is a bespoke chain selection: Starbucks, Third Wave Coffee, Blue Tokai, Café Coffee Day and Chaayos. These mapped objects are counted separately from generic cafés; the label does not verify price or quality. Counts do not establish suitability, opening hours, quality or capacity.

### Missing data and weighting

Unselected, zero-weight and unavailable factors do not contribute. Available weights are renormalized; if none remain, the result is unavailable. **Rent coverage:** missing rent produces a visibly marked partial score from other factors by default. With cost included, rankings use rent-covered wards when any match; otherwise rankings are labelled budget unassessed. An optional “Require rent data” setting restores strict exclusion. Individual cost coloring always shows missing rent as unavailable.

Weights are relative. Increasing the only active factor’s weight does not change its normalized score. Rankings follow ward/corporation filters, omit unavailable totals and break ties by ward name. A high weight changes contribution, not the underlying raw value.

### Costs, greenery and noise

Rent is matched to the nearest eligible OSM locality centre within 2 km. Current coverage is 67 wards for 1 BHK, 115 for 2 BHK and 7 for 3 BHK. Sarjapur Road is omitted because it has no unambiguous locality centre. Home & budget has a ₹10,000–₹1,00,000 monthly rent slider and 1/2/3 BHK selector. Other household expenses are not scored. The guide asks for an optional rent budget; templates provide editable rent preferences. Deposits and moving costs are excluded; these settings are not income predictions by age.

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

Controls are grouped into **Civic services**, **Daily access**, **Leisure**, **Home & budget**, and **Quiet & green**. Each overall slider distributes a total weight among the group's selected factors, preserving their relative weights; a group without selections starts with curated defaults. **Fine tune** opens individual factors, credits and preferences in a desktop side panel or a mobile modal. Every slider keeps the desktop map visible for immediate color feedback.

On mobile, the map is the primary surface. Bottom navigation opens one sheet at a time for priorities, rankings, the index or search; tapping a ward opens its details. Hover previews are desktop-only. Desktop surfaces use explicit stacking: map, sidebar, results, then hover previews and factor popovers. Desktop fine tuning occupies the sidebar footprint without blocking the map; mobile modals appear above the map.

Route questions remain longer-term goals: public transport plus pleasant walking to a destination; affordable localities with a commute to work; and rain conditions along a scooter route. They require connected networks, service timings and dated, verified street observations.

**Not implemented:** journey-time routing, metro-only travel times, per-capita metrics, verified footpath width/continuity, potholes, waterlogging likelihood, rain-safe routes, live noise or validated odour exposure. Missing observations must not be presented as safe or problem-free.

## Project structure

```text
index.html                 Map interface and styles
app.js                     Layers, scoring, search, configuration and ward inspection
presets.js                 Editable starter weights and rent budgets
questionnaire.js           Guided starting-index flow
interface.js / interface.css Group controls, responsive sheets and surface hierarchy
rental-data.js             Validated listing import and ward rent summaries
data/                      Bundled source snapshots and derived ward summaries
scripts/                   Saved Overpass queries and Python preparation scripts
sources/index.html         Source catalogue and methods
vision/index.html          Audience, civic purpose and long-term direction
.github/workflows/pages.yml GitHub Pages deployment
```

## Refreshing data

Preparation runs offline; the browser only consumes generated files. Use an isolated Python environment with Shapely; the vegetation script also requires Pillow and NumPy. Scripts contain snapshot-specific filenames and metadata that must be updated when changing editions.

The base amenity preparation overwrites `amenities.json`. Run coffee-chain classification, exposure and metro enrichment again afterward:

```sh
python scripts/prepare_ward_boundaries.py

curl --fail --get --data-urlencode data@scripts/amenities.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-osm.json
curl --fail --get --data-urlencode data@scripts/extra-amenities.overpass \
  https://overpass-api.de/api/interpreter/ -o /tmp/bengaluru-extra.json
python scripts/prepare_layers.py /tmp/bengaluru-osm.json /tmp/bengaluru-extra.json
python scripts/prepare_coffee_chains.py

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

## Working on the prototype

Agent entry point: [AGENTS.md](AGENTS.md). Focused [developer docs](docs/README.md) cover architecture, design decisions, scoring/data contracts and common change recipes. Read the relevant topic instead of reconstructing context from the entire codebase.

## Contributing

Useful contributions include reviewing ward assignments, documenting missing services, supplying permitted datasets, improving metric definitions and building the civic evidence workflow. Include source, licence, observation date, geography and limitations with every data contribution. Keep measured observations distinct from inferred conditions, and preserve uncertainty in the interface.

## Housing type and asking-rent datasets

The rental controls now distinguish **gated society**, **standalone / builder housing**, and **all housing types**, with optional furnishing filters. The guide includes housing preference. The existing tenant dataset cannot answer a housing-type-specific query, so specific filters use imported asking rents and leave uncovered wards unavailable. No guessed gated-society premium is applied.

A local CSV import supports a permitted property export or reviewed listing dataset with these headers:

```csv
property_id,latitude,longitude,bhk,housing_type,rent_inr,maintenance_inr,furnishing,observed_on,source_url
```

- `housing_type`: `gated`, `standalone`, `unknown`. Furnishing: `unfurnished`, `semi-furnished`, `furnished`, `unknown`. Unknown values are excluded from specific filters.
- Use exact reviewed coordinates and a canonical property ID across sources; duplicated IDs/URLs are excluded. Only 1–3 BHK records within GBA are used.
- Observations must be within 90 days at import. Maintenance must be separately stated: blank is unknown and excluded, zero means explicitly no additional charge.
- Ward medians require at least five matching unique records and include rent + maintenance. The breakdown shows sample size and the middle 50% range. This threshold is a prototype quality gate, not evidence of a representative sample.
- Imports stay in the current tab. Share links save filters but not the dataset; re-import after reload or when reproducing a shared index.

[Rental source research](sources/index.html#rental-listings) documents Housing.com examples and their limitations. No Housing.com live feed or citywide database has been integrated yet. New asking rents and existing tenant-paid rents are separate bases; portal locality labels require location review before ward assignment.

### Optional rent extrapolation

Home & budget includes inferred rents by default for unrestricted reported tenant-rent preferences. Nearby matching localities within 2 km are retained; other wards use up to three nearest same-BHK medians, weighted by inverse squared distance (500 m floor) and rounded to ₹500. This gives all 369 wards a proxy for each home size, with nearby/inferred counts and source details. Disable the option for nearby-only coverage. Long-distance estimates are marked; 3 BHK has only two source localities and is especially rough. No extrapolation applies to gated/furnishing-specific preferences or imported asking rents. This does not add observations or validate current market prices.
