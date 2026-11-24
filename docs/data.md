# Data contracts and provenance

## Joins and coordinate conventions

Ward geometry: `data/wards-bengaluru-gba.geojson`, keyed by `feature.properties.id2`; `ward_id` is a display number, not the canonical join key. Attributes include ward name, corporation and constituency. Legacy population columns are not current population estimates.

**GeoJSON positions are `[longitude, latitude]`; Leaflet centres/bounds are `[latitude, longitude]`.** The upstream ward export originally had reversed axes; `prepare_ward_boundaries.py` corrects it. Do not swap already-normalized local geometry again. Prior stretching/Europe placement came from coordinate/layout problems, not actual ward locations.

| File | Shape / use |
| --- | --- |
| `amenities.json` | `points`, `exposureSites`, `wards`, airport, metro routes and provenance metadata |
| Amenity point | `{id,lat,lon,category,name,ward,tags}`; transit enrichment adds line assignments |
| Amenity ward row | `{id,center,counts,roadProxy}`; `id` joins ward `id2` |
| `assemblies.geojson` | Wards dissolved by constituency, clipped to GBA; not full official constituency polygons |
| `search-places.json` | Named places `{id,name,lat,lon,kind,aliases,address,ward}` and snapshot metadata |
| `living-cost.json` | Locality data and `wards[id2]` nearby rent proxies, separate `inferredWards[id2]`, edition/method metadata |
| `green-cover.json` | `wards[id2]` with meanAlpha, coverage, pixels, score; raster bounds/hash/source metadata |

Inspect metadata or a few records; do not dump these large files into context. Preparation assigns some OSM objects using geometry centres; duplicate representations and incomplete mapping remain limitations. Metro line matching/track geometry comes from OSM and is not a verified complete network census. Search is local, not a live geocoder.

## Rental import contract

No citywide Housing.com database or live portal feed is integrated. Advertisements on `/sources/` are research examples, not scoring inputs. Use a permitted export/reviewed dataset; do not silently scrape or fabricate price uplifts.

CSV header:

```csv
property_id,latitude,longitude,bhk,housing_type,rent_inr,maintenance_inr,furnishing,observed_on,source_url
```

- BHK 1–3; housing type `gated|standalone|unknown`; furnishing `unfurnished|semi-furnished|furnished|unknown`.
- ISO date, finite valid Bengaluru coordinates, canonical property ID, HTTP(S) source URL.
- Import excludes observations older than 90 days or future dates, duplicate property IDs/URLs, unknown maintenance and points outside ward polygons. Use canonical IDs across portals.
- Blank maintenance is unknown; zero means explicitly no additional maintenance. Monthly amount is rent + maintenance.
- Exact point-in-polygon ward assignment; no locality fallback. Specific filters exclude unknown classifications.
- At least five matching unique records per ward; median and 25th–75th percentiles shown. This is a prototype quality gate, not proof of a representative sample.
- Imports stay in tab memory, not storage, share URLs or repository data. Filters persist; reproducibility needs the same re-imported dataset.

## Refresh and attribution

See [README refresh commands](../README.md#refreshing-data). Order matters:

1. Ward normalization.
2. Base amenity/layer preparation (overwrites `amenities.json`), then `prepare_coffee_chains.py` to regenerate chain metadata and counts.
3. Exposure/roads enrichment and metro enrichment again after base preparation.
4. Separate destination directory, rent and vegetation preparation as applicable.
5. Update source dates/editions/coverage and run `prepare_sources_page.py` last.

Scripts include snapshot-specific paths/constants; inspect before executing. Offline processing needs Shapely, plus Pillow/NumPy for greenery. Deployment never refreshes data automatically.

Preserve OSM ODbL credit, OpenCity/GBA/Bharat Atlas provenance, bengaluru.rent/Harshit Anand credit and modified Copernicus attribution. CPCB station data is historical context, not interpolation or road-proxy calibration. Edit the source-page generator and generated page together. Each new dataset needs source, licence/terms, observation date, geography, method and limitations.

## Coffee/tea chain selection

`coffee_chain` / `coffee_chain_count` replaces the Starbucks-only category. `scripts/coffee_chains.py` owns the named allowlist: Starbucks, Third Wave Coffee, Blue Tokai, Café Coffee Day and Chaayos. Match normalized brand/operator/name tags only on café/restaurant/fast-food objects; exclude nearby transit landmarks named after shops. It is a bespoke preference category, not verified expense or quality. Chains are an exclusive category and do not also contribute to generic café counts.

`prepare_coffee_chains.py` reclassifies the current snapshot and rebuilds only café/chain ward counts, preserving road/site/transit enrichments and original source timestamps. `coffeeChainMetadata` records the classification version and brand counts. No new observations are downloaded; OSM gaps/point-area duplication remain.

## Rent inference

`prepare_living_cost.py` preserves nearest same-BHK locality matches within 2 km in `wards`. Missing matches receive a separate `inferredWards` record: up to three nearest same-BHK locality medians weighted by inverse squared distance with a 500 m floor, rounded to ₹500. Each record retains source names, rents, report counts, distances and normalized weights. `inference.version` is included in the source signature. No new observations or claim of measured ward median is added.

`includeInferredRent` defaults to true, including older configs without the field. Only unrestricted tenant-rent preferences can use it; housing/furnishing filters and imported asking datasets never fall back to this model. It can be turned off to retain previous nearby-only coverage. Nearest source beyond 5 km is labelled long-distance extrapolation; 3 BHK has only two locality sources, so spatial differentiation is especially weak. The method cannot infer gated-society premiums or correct old tenancies into current asking rents.
