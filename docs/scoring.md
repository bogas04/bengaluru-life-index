# Scoring contract

Scores express personal preferences, not official livability, safety, quality or noise ratings. Gray is unavailable. Always retain raw units/counts alongside normalized values.

## Components

| Type | Base score |
| --- | --- |
| Count | Ward count / citywide maximum count |
| Distance | `max(0, 1 - straightLineDistance / threshold)` |
| Pressure | `1 - min(1, wardRoadPressure / citywideMaximumPressure)` |
| Essentials coverage | Number of mapped healthcare/pharmacy/park/bus-stop groups present / 4 |
| Cost | `max(0, 1 - medianRent / (2 * rentBudget))` |
| Green | Precomputed mean raster display alpha / maximum covered ward mean |

`reverse` applies `1 - base`. Industry/factory/compost/waste reverse by default, preferring farther locations. Counts normalize across the whole city, not current ward/corporation filters; changing a filter must not change the scale.

Distance thresholds: metro 3 km; bus 1 km; hospital 5 km; park 2 km; pharmacy 1.5 km; airport 60 km; reference 15 km; industry/factory 5 km; compost/waste 3 km. Distances are from a representative point inside the ward to mapped points/centres, not travel routes or site boundaries.

## Weighted index and ranking

`sum(selectedPositiveWeight * availableScore) / sum(selectedPositiveAvailableWeights)`.

Unselected, zero-weight and unavailable components do not contribute. No available positive components means unavailable total. **Affordability coverage:** by default missing rent is omitted from the average and the ward is marked “Budget not assessed · partial score,” with lighter map fill. Rankings use rent-covered wards when any match current filters; otherwise rank other factors with an explicit unassessed-budget label. `costSettings.requireRentCoverage=true` restores strict exclusion of missing-rent totals. Individual cost coloring leaves missing eligible rent unavailable. Tenant-rent inference is enabled by default for unrestricted housing/furnishing preferences and can be disabled; inferred estimates contribute to affordability but are labelled in coverage and ward details. A partial score is not evidence of affordability.

`displayedScore()` chooses custom total or the individual metric. Rankings follow current filters, omit unavailable totals, show five and break ties by ward name. Colors and rankings must consume the same scores. Raising the only factor's weight cannot change its normalized average; do not invent color movement to mask this.

## Cost and household assumptions

Score only eligible median rent against `rentBudget`. Home & budget exposes a ₹10,000–₹1,00,000 range slider (₹1,000 steps) and 1/2/3 BHK selector. Slider input includes affordability and updates the map immediately. Other household expenses are not scored. At the chosen budget the score is 0.5; at twice the budget it is 0. Templates supply editable rent preferences, not income predictions based on age or marital status. No budget in the guide removes affordability from the starting mix.

Tenant rents use nearby locality medians and mix housing/tenancy ages; they are not new-lease prices. Specific housing/furnishing filters use imported asking records without tenant fallback or invented gated-society premiums. See [data contracts](data.md).

## Interpretation constraints

- Road pressure estimates infrastructure intensity from road length/width/class; it is uncalibrated, not dB or a measured noise level.
- Green display alpha is not canopy percentage, raw NDVI, public access or walking shade.
- Site distance is not smell, emissions, health risk or verified operational status.
- Counts may be incomplete or duplicate point/area representations. Zero is not verified absence.
- Lakes require `water=lake`; public parks require explicit public/permissive access. The named high-end coffee/tea chains are separate from generic cafés; this is not a price or quality classification.
- Essentials presence is not walkability. No per-capita score uses legacy population as a current denominator.

Presets live in `presets.js`; guide adjustments in `questionnaire.js`. Keep component definitions and truthful labels consistent in detailed controls, hover/details, README and source methods.
