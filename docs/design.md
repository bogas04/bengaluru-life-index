# Design decisions

## Calm hierarchy

The earlier interface exposed dozens of detailed controls plus overlapping hover cards, rankings, legends and popovers. The current direction uses rounded opaque surfaces, larger headings, generous spacing and progressive disclosure. The map carries the comparison; controls and explanations appear when requested.

Five groups are defined in `interface.js`:

| Group | Contents |
| --- | --- |
| Civic services | Education, health, emergency services and public essentials |
| Daily access | Metro/bus/rail, chosen destination and airport |
| Leisure | Malls, cafés, cinemas and named coffee/tea chains |
| Home & budget | Home size, housing preferences and monthly rent affordability |
| Quiet & green | Parks/lakes/greenery, road-pressure proxy and industrial/waste distance |

Each card exposes an **overall weight** and **Fine tune**. Fine tuning contains individual factors, preferences, weights and source credits. Layer visibility is controlled separately by a compact chip row above the map, with a chevron to expand all layers. Map appearance/boundaries and data limitations are collapsed secondary sections.

## Live map feedback

Every slider must leave enough map visible to inspect color changes immediately. On desktop, Fine tune opens a non-modal panel occupying the existing sidebar footprint: no backdrop, map occlusion or blocked map interactions. Mobile uses a 60dvh bottom modal without a dim/blur backdrop; the map resizes into the visible area above it so color feedback remains legible. Changes apply on input without an Apply step. If weights cannot change a score (e.g. one active factor or missing data), preserve the mathematical result and explain the limitation.

## Group slider semantics

The displayed group weight is the sum of its selected individual weights. Moving it redistributes that total proportionally among selected factors, preserving their relative weights. Integer rounding distributes the remainder. If none are selected, curated defaults from `GROUPS.defaults` are included. It is a weight budget, not a separate group score or an additional multiplication layer.

Fine tuning can create totals above 100; the group slider maximum expands to the current total. Every change uses the app callback, syncs individual controls, activates weighted coloring and recalculates. Selected zero-weight factors remain in the count but do not contribute. The single-factor normalized score can remain unchanged when only its weight changes.

**Map layer chips** toggle visibility only. All amenity layers, metro tracks, greenery and the destination pin start hidden on each load; scoring selections are restored independently. The Office / school chip opens destination search if none is chosen, then toggles the selected pin. Search destination reopens the chooser for a new landmark or manual pin drop. Selection checkbox controls scoring. Editing a weight automatically includes that factor. Unused amenity cards are muted without making their controls unusable.

## Desktop surfaces

Root tokens in `interface.css`: map 0, map controls 200, sidebar 400, results 600, tooltip/popover 800, mobile nav 900. Leaflet pane indices are local to the map and are not root-surface indices.

Hover content is rendered in the body-level `#map-hovercard` portal so it can appear above rankings/sidebar; native Leaflet tooltip DOM is hidden. Pointer-selected wards use their selected map stroke, without a browser focus box. Keyboard focus retains a green outline via `:focus-visible`. Keep one compact preview, showing raw values for up to three high-weight factors and a hint to click. Full details replace the leaderboard on selection. Do not open a second large hover breakdown over the selected panel.

Factor-count hover/click opens a factor list; choosing a factor opens its group dialog and focuses its control. Group `<dialog>` surfaces use `show()` on desktop and `showModal()` on mobile, with Close/Escape behavior. Switching the responsive breakpoint reopens an active tuning surface in the correct mode. Desktop tuning stays in the sidebar z-index tier; modal dialogs use the browser top layer.

## Mobile (≤760 px)

Map is the default full-screen surface. Bottom icon navigation: Map, Priorities, Top wards, My index, Search. `body[data-mobile-panel]` selects one visible sheet; close/scrim returns to map. Sidebar and rankings/details become bottom sheets, with fine tuning in deeper native dialogs. Search also exposes map settings; My index links to vision and sources.

No hover previews or transit legend on mobile. The index composition breakdown opens deliberately on tap. Tap a ward for its details; tap an amenity for a deliberate place-details modal. The factor-count button opens the index breakdown. Do not restore the overlapping desktop panels at narrow widths.

Respect safe-area insets and dynamic viewport height. Keep inputs ≥16 px to avoid iOS auto-zoom and primary touch controls around 44 px. Ward framing must reserve space **below** the map for a mobile sheet, rather than applying a desktop sidebar's width as right padding.

Fine tuning has a distinct sage canvas and darker header to signal deeper settings. On desktop, the group icon and title use 650 ms shared-element View Transitions to translate/scale between the overview card and panel header, including reverse navigation. Browsers without that API use temporary, non-interactive icon/title copies animated with the Web Animations API. The Fine tune label does not translate or scale. Only those elements animate; the map stays live. Reduced-motion preferences and mobile use immediate navigation.

## Group identity and composition

`GROUPS` owns each group's icon, color and light tint: civic blue, access teal, leisure violet, home ochre, quiet/green sage. Reuse these in overview headings, group sliders, tuning headers/canvas and the index breakdown. Color identifies a preference group; ward red/green still represents the score. Icons and names accompany colors.

The factor-count button includes one segmented bar: each segment's width is that group's **selected weight total / all selected weights**, not its factor count or its contribution to a particular ward score. Zero-weight selections remain listed but have no segment; all-zero weights give a neutral bar. Hover/focus on desktop or tap on mobile opens the same grouped breakdown, with group percentages, individual weights/shares and preference direction. Selecting a factor opens its fine tuner. Mobile uses a dismissible popover above navigation instead of redirecting to priorities. Missing ward data can change the effective weight mix for that ward; this bar describes the configured index only.

## Compact map layer picker

The collapsed map picker shows up to five shortcuts, constrained by available width so the chevron always remains visible without horizontal scrolling. Initially these are Metro stations, Bus stations, Hospitals, Office / school and Bus stops. Once layers are enabled, only selected layers are eligible for the compact row (maximum five); the chevron displays the total enabled count. Hidden selected layers remain enabled. With none enabled it returns to starter shortcuts.

The chevron opens a wrapping, vertically scrollable catalogue over the map, above results. Selection does not close or reorder this catalogue; collapsing brings selected layers forward. Search destination and Clear layers remain available in the expanded catalogue. Escape collapses it and returns focus to the chevron. Reuse the same visibility buttons/handlers; do not duplicate scoring state or enable layers on expansion. Layout adapts to the available map width on desktop and mobile.

## Overlay space reservations

`setupInterface()` measures the top bar, layer catalogue, bottom counter/legend, visible results panel and mobile sheets using resize/visibility observers. Shared `--overlay-*` variables reserve non-overlapping areas: results start below layers and end above zoom/counter; legends sit above the counter; factor breakdowns and hover previews stay in the left map area above bottom chrome. Expanded layers scroll within a bounded height and push results downward. Result panels scroll when space is short. Zoom is a body-level fixed dock (same Leaflet control/handlers) in the reserved bottom-right area; mobile sheets lift it into the visible map. Avoid solving geometry collisions by raising z-index. Hover previews are suppressed while the deliberate factor breakdown is open.
