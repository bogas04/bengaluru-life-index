# Working context

**Read this page, then one relevant topic.** These docs record the current prototype's design intent, contracts and reusable change recipes so a future agent does not need to reconstruct them from chat history or a full code scan.

## Product intent

Help concerned citizens, resident associations and locality observers (including groups such as BengaWalk) gather evidence, compare gaps, and raise specific concerns with civic bodies. Encourage data-oriented debate with less reliance on vague impressions or community-identity framing. Do not rank people or communities.

The longer-term loop is **data → issues → improve**: observations, comparisons, evidence packs, responsible civic contacts, responses and measured outcomes. A 15–20-year city vision should be traced backward into measurable milestones. Evidence packs, contacts and response tracking are not implemented.

Housing choice is another use of the same evidence. Future questions include a pleasant public-transport journey to a café, affordable housing with a commute to work, and rain conditions along a scooter route. Routing, verified footpaths/potholes/waterlogging and live environmental measurements remain future work.

## Topic map

- [Architecture](architecture.md): files, initialization, state, configuration and key function names.
- [Design](design.md): information hierarchy, responsive interaction and group-slider behavior.
- [Scoring](scoring.md): formulas, missing-data rules, units and budget assumptions.
- [Data](data.md): dataset joins, coordinate order, attribution, rent imports and refresh order.
- [Recipes](recipes.md): minimal paths for common changes and pitfalls to avoid.

The public [README](../README.md) describes features, setup and refresh commands. The [vision page](../vision/index.html) explains product direction; the [sources page](../sources/index.html) documents publishers and methods. These internal docs summarize contracts, not a second source catalogue.

## Maintenance

Update only the affected topic when changing a contract. Document the decision and its reason, not every implementation line. Link to filenames/functions instead of unstable line numbers. Record limitations rather than treating prototype behavior as validated truth. Snapshot counts and dates belong in dataset metadata and the source catalogue, not scattered through every doc.
