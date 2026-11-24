# Reusable change recipes

Read the linked topic first; then inspect named functions rather than the whole repository. These are local project workflows, not installed skills.

## Add an amenity layer and score

1. Define its OSM/source meaning and limitations. A visible layer need not have a score.
2. Extend saved queries and offline preparation; assign ward `id2`, update point categories/counts and provenance. Base preparation overwrites enrichments: rerun dependent steps.
3. In `app.js`, add `categories` entry for visibility and `countMetric()`/`indicators` entry for scoring. Extend `calculate()` only for a genuinely new component type.
4. Add the category and metric key to one `GROUPS` entry in `interface.js`; select curated defaults if appropriate. Every metric needs a group so its controls remain accessible.
5. `colocateAmenityScores()` moves category-matched scoring controls into amenity cards. `setupInterface()` moves their visibility buttons into the map layer strip. Non-category metrics are moved separately by group setup. Preserve IDs and existing handlers.
6. Supply units via `formatRaw()` and truthful source links via `metricCredit()`. Update source generator/page and affected docs.
7. Existing configs tolerate absent/unknown keys, but meaning changes require an explicit compatibility decision. Do not silently reinterpret a saved metric.

## Change weights or presets

- Use `presets.js` for starters and `questionnaire.js` for guide adjustments; no demographic income assumptions.
- Individual/group edits must sync controls, activate weighted coloring and call `calculate()`. Display-only changes use `updateIndex()` when no components changed.
- New dynamic components must bypass or invalidate static `cachedParts` appropriately. A stale cache can leave colors inconsistent with changed inputs.
- Keep map visibility independent. A group distributes weight over components; it does not multiply a second group-level score.
- Preserve the rent-covered ranking tier, partial-score labels and optional strict rent-coverage setting when altering scoring.

## Change panels or mobile UX

- Edit responsive overrides in `interface.css`, structural/group navigation in `interface.js`, map behavior in `app.js`.
- Preserve one mobile panel selected by `data-mobile-panel`. Close existing dialogs before another opens. Mobile modal dialogs provide focus trapping/Escape. Desktop fine tuning uses a non-modal sidebar panel so every slider leaves the map visible and interactive; do not reintroduce a desktop backdrop.
- Keep desktop hover content in the root portal; changing a Leaflet pane z-index cannot lift it above root UI surfaces.
- `select()` uses bottom padding for mobile sheets and right padding for desktop results. Call `map.invalidateSize()` after layout changes.
- Preserve first-paint welcome logic in `index.html`; waiting for data recreates the map flash before onboarding.
- Keep source/vision navigation accessible even when desktop chrome is hidden on mobile.

## Change sources, docs or deployment

- Internal decisions go in the relevant `docs/` topic; public feature/status information in README; purpose in vision; provenance in sources.
- `/sources/` is generated: edit `scripts/prepare_sources_page.py`, then regenerate. A page-only edit will be lost.
- New runtime assets must be added to `.github/workflows/pages.yml`'s explicit copy list. Relative paths are required under the Pages project prefix.
- `docs/` and AGENTS.md are repository context, not automatically deployed site pages.
- Start the static site with `npm run dev`. Never assume localhost preview means the hosted deployment changed. Commit/push only on request.

## When verification is requested

Use focused checks: changed slider updates ward colors and rankings; selected raw values remain correct; group/individual weights agree; missing-data wards stay unavailable; imported/shared settings restore as intended. For responsive changes inspect mobile map/sheet/dialog and desktop hover stacking. Restore temporary viewport overrides afterward. Keep checks proportionate and report only those actually performed.
