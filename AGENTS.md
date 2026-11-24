# Bengaluru Life Index: agent entry point

This is a static Bengaluru ward map and civic evidence prototype. Primary users are concerned citizens and locality groups. The purpose is **data → issues → improve**; choosing a place to live is a secondary use.

## Load only what the task needs

Start with [docs/README.md](docs/README.md), then select:

| Task | Read |
| --- | --- |
| Layout, mobile, panels, tooltips | [Design decisions](docs/design.md) |
| State, functions, file ownership, debugging | [Architecture](docs/architecture.md) |
| Weights, scores, costs, presets | [Scoring contract](docs/scoring.md) |
| Sources, geometry, imports, refreshes | [Data contracts](docs/data.md) |
| Add a metric/layer or ship an asset | [Change recipes](docs/recipes.md) |

These are project context and reusable workflows, not installed Codex skills. Avoid scanning the entire codebase or dumping large data files. Read the relevant function after the topic doc. Check git status before editing; existing changes may belong to earlier work.

## Rules worth retaining

- Preserve the static, relative-path deployment on GitHub Pages unless a task explicitly changes architecture.
- Source credits stay beside detailed controls and on `/sources/`. Edit its generator as well as the generated page.
- Distinguish observations from proxies. Missing data is unavailable, never evidence of safety or absence of a problem.
- Map visibility and index inclusion are independent. Editing a weight selects its factor and activates weighted ward coloring.
- Every slider must leave the map visible for immediate color feedback: desktop non-modal tuning in the sidebar footprint, mobile partial-height tuning sheets.
- Mobile primarily shows the map, with one panel at a time. Desktop stacking: tooltip/popover > results > sidebar > map; native dialogs use the top layer.
- Preserve configuration compatibility and reference-location privacy; see architecture.md.
- Do not add/run tests unless requested. Any authorized verification should focus on changed behavior; do not claim unperformed checks.
- Update the relevant topic doc when a decision or contract changes. Keep documentation factual about the current implementation; label plans explicitly.

Run with `npm run dev` (port 4173). A push to `main` triggers the Pages workflow; commit/push only when requested. No build or backend is required.
