# Interactions — `/interactions`

Page: `pages/interactions.vue` (header menu "Interactions" / "Interazioni").

- **Numbers** at the top: associations, hoverflies, resources (plants and prey) and natural enemies in the network.
- **Association network** of every biological association in SoI — the same
  `AssociationGraph` used on species pages (`panels/_shared/AssociationGraph.vue`,
  data from `panels/_shared/associationGraph.js`: `fetchAssociations()` + `buildGraph()`),
  here with a search box; its PNG/SVG export is named `soi-interactions`.
- **Which plant families hoverflies use** — `PlantFamilyChart.vue`.

## PlantFamilyChart.vue

Horizontal stacked bars: number of hoverfly–plant associations per plant family,
split into *flower visits* and *feeding on the plant* (same colours as the network).
Hover a bar to list the plants.

Props: `graph` (the result of `buildGraph()`), `top` (families shown before the rest
are folded into "Other families", default 12). Families come from the plant's
classification in TaxonWorks (as read by `buildGraph()`); plants without one go under "Family not recorded".

The network, its colours and relationship definitions are documented in
`panels/PanelBiologicalAssociationsGraph/readme.md` and `panels/_shared/readme.md`.
