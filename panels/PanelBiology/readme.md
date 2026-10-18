# PanelBiology (`panel:biology`)

The **Biology** tab of taxon pages: the ecology of the taxon drawn as a life-cycle
summary instead of a list of texts. It combines three sources and always says which
is which:

1. **Literature** — the ecological contents entered in TaxonWorks (OTU → Content,
   one per topic, see the table below);
2. **SoI records** — the taxon's dated and georeferenced records
   (`/otus/:id/inventory/dwc.json`);
3. **Biological associations** recorded in SoI (`fetchAssociations` from
   `../_shared/associationGraph.js`).

## Layout

- **Life cycle** — generations per year (with 1–3 dots), overwintering stage,
  migration, "lives with social insects" (only when *Yes*), European Red List badge
  (`pages/components/Atlas/RedListBadge.vue`).
- **Adult**
  - *Body length* — min–max bar on a 0–20 mm scale (longer scale if needed); mouthpart
    length when known.
  - *Flight season* — 12 months: the flight season given in the literature shaded yellow,
    SoI records per month as green bars. Hover (or tab to) a month for both
    ("July · in the literature season · 26 records").
  - *Altitude* — literature range as a yellow bar, each SoI record elevation as a tick;
    hover (or tab to) a tick for its elevation and number of records ("1,600 m · 14 records");
    click it (or press Enter) to list those records under the chart (`../_shared/RecordList.vue`):
    date, locality, elevation, sex, collector, collection and catalog number. Click a record
    (ⓘ) for the full record inside SoI (`DwcTable`); GBIF ↗ opens the same record on GBIF.
  - Under both charts, **one sentence compares the literature with the SoI records** when
    both exist: either "All SoI records fall within…", or how many records fall outside and
    where ("2 records in SoI lie above the literature range (up to 2,500 m; the literature
    gives a maximum of 2,200 m).").
  - *Preferred habitat* (`components/HabitatProfile.vue`) — one line on how broad the range
    is ("41 habitats across 5 habitat types — a habitat generalist", or "3 habitats, all
    woodland — a woodland specialist"), then one bar per broad type: Woodland, Scrub &
    Mediterranean shrubland, Grassland, Wetland & coast, Farmland & urban (and Other).
    Click a type to open its habitats; click a habitat to see **the other hoverflies in SoI
    with the same habitat** (all species' habitat contents, loaded on the first click),
    linked to their Biology tab. The type of each habitat is recognised from words in its
    name (`HABITAT_RULES` in `traits.js`: Quercus, Fagus, woods → Woodland; Maquis,
    Garrigue, Heath, shrubs → Scrub; Grassland, Meadow, Hay → Grassland; Lagoon, Marsh,
    Dunes, Beach → Wetland & coast; Fields, Orchard, Vineyards, Park, Garden → Farmland &
    urban). A new habitat that matches no rule goes under Other — add a word to the rules.
  - *Flowers visited* (`components/FlowersVisited.vue`) — one bar per plant family, length =
    number of genera, biggest first; the first 8 families, then "Show all". Literature and
    the flower visits recorded in SoI are merged; a green dot marks genera (and families)
    also recorded in SoI. Click a family to open its genera; click a genus to see **the
    other hoverflies that visit it** — from the literature of every species and from all
    SoI flower-visit records (loaded once, on the first click), linked to their Biology tab.
    A "Find a plant" box appears when there are more than 6 families. Entries without a
    family ("Caltha", "White umbellifers") go under "Family not given", unless a SoI record
    gives the genus a family.
- **Larva**
  - *Larval food* — feeding type ("Zoophagous (predator) — aphids"), plus prey and food
    plants recorded in SoI (dashed chips).
  - *Where larvae live* (`components/LarvalHabitat.vue`) — one sentence ("Larvae live on
    foliage, from understorey trees down to low-growing plants.") and a vertical height scale,
    like the altitude bar: tree canopy (12–25 m), understorey trees (5–12 m), shrubs
    (1.5–5 m), tall herbs (0.3–1.5 m), low-growing plants (0–0.3 m) and the ground, with
    the typical heights as ticks. The layers where the larvae live form a yellow band; every
    layer gets the same space on screen, so the scale is stretched near the ground (said under
    the chart). Dead wood, water and nests, which are not heights, appear as yellow chips
    below. Hover (or tab to) a layer for its typical height; click a yellow layer to see
    **the other hoverflies whose larvae live there**. Entries are read
    with `larvalLayers` (`traits.js`): "Tree foliage" → canopy + understorey trees, "Low
    shrubs" → shrubs, "Foliage" alone → "on foliage"; anything not recognised is shown as
    plain text under the profile.
- **"No habitat or larval data yet."** when neither habitat nor larval data exist.
- A footnote saying what comes from the literature, from the records and from the
  associations (with a link to the Biological associations tab), and **Sources** — the
  citations attached to the contents in TaxonWorks, if any. (At present the contents
  have no citations; add one to a content in TaxonWorks and it appears here.)

Sections and cards with no data are not shown. Everything is in English and Italian
(the trait values are translated; free-text habitats and plant names are shown as entered).

## Topics used

| Topic | Id | Shown as |
|---|---|---|
| Min Length (mm) / Max Length (mm) | 6424 / 6423 | Body length bar |
| Adult mouthpart length (mm) | 6432 | Text ("Unknown" is hidden) |
| Adult phenology | 6433 | Flight season (month names parsed) |
| Altitudinal minimum / maximum (m) | 6434 / 6435 | Altitude bar |
| Voltinism | 6436 | Generations per year |
| Overwintering stage | 6438 | Overwinters as |
| Migratory status | 6439 | Migration |
| Commensalism | 6437 | Shown only when Yes |
| Preferred habitat | 6429 | Habitat chips |
| Flowers visited | 6431 | Flower chips |
| Larval Trophism | 6422 | Larval food |
| Larval microhabitat | 6430 | Microhabitat chips |
| Red List - European Species | 6440 | Red List badge |

Other topics (remarks, type series, nomenclature…) are not part of this tab.
The ids are in `TOPIC` in `traits.js`. `topic_id` can be bound in
`config/taxa_page.yml` to show only some of them.

## Writing contents in TaxonWorks

The contents are free text, so `traits.js` cleans them before showing them:

- **Lists** (habitat, microhabitat, flowers): separate items with `;` (commas outside
  brackets also work): `Thermophilous Quercus woods; Fagus forest`.
- **Flowers**: preferably *Family (Genus, Genus)*, e.g.
  `Apiaceae (Heracleum, Daucus); Asteraceae (Taraxacum)` — the family groups them in the
  chart, and genera are what "other hoverflies visiting" matches on.
- **Numbers**: just the number (`8`, `9.5`, `800`); "08" and "00" are read as 8 and 0.
- **Phenology**: month names in English or Italian, as a range or a list:
  `March to June`, `May-June`, `April, May, June`, `iv–vi`.
- **Voltinism**: Univoltine / Bivoltine / Polyvoltine (several allowed: `Bivoltine; Polyvoltine`).
- **Migratory status**: No / Weakly migratory / Migratory / Strongly migratory.
- **Overwintering stage**: Larva / Pupa / Adult (several allowed).
- **Larval trophism**: Zoophagous / Phytophagous / Saprophagous / Mycophagous /
  Microphagous, optionally with the food in brackets: `Zoophagous (aphids)`.

Known misspellings found in SoI are corrected on display (`SPELLING` in `traits.js`:
Univoltin, Polivoltine, Bivolrine, Zoophagus, Schrubs, Shbrus, Thermophilus, Larvae,
Guarrigue, Heavely, Filed Margin, Sal Marsh, Leodonton, Ancuhusa, Sisybrium, Convolvolus,
Plantaginacee…).
It is still worth fixing them in TaxonWorks. Longer term, the fixed-answer topics
(voltinism, migration, overwintering, commensalism) would be better as data attributes
with controlled values.

## Files

| File | |
|---|---|
| `PanelBiology.vue` | The tab |
| `components/FlowersVisited.vue` | Flowers visited: family bars, genera, other visitors of a genus |
| `components/HabitatProfile.vue` | Preferred habitat: breadth, habitat types, other species sharing a habitat |
| `components/LarvalHabitat.vue` | Where larvae live: height scale of the vegetation layers, other species with larvae in a layer |
| `traits.js` | Pure functions: `traitsOf(contents)`, `flowerGroups(items, soi)`, `habitatType`, `habitatGroups`, `larvalLayers`, `parseMonths`, `splitList`, `toNumber`, `voltinism`, `migratory`, `overwintering`, `trophism`, `fixSpelling`, `TOPIC` |
| `traits.test.mjs` | Tests: `node panels/PanelBiology/traits.test.mjs` |
