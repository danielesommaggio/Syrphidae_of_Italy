# Atlas — `/atlas`

Page: `pages/atlas.vue`. Header menu "Atlas" / "Atlante".

## What the page does

- **Map of Italy** coloured by the number of Italian records per region (specimens and
  literature records with a known region). Hover for the count; click a region to list
  its species (or pick it from the ranked list next to the map).
- **Species per region**: loaded on click (a slow query, a few seconds), linked to the
  species pages.
- **Flight season**: records per month for all of Italy, with the peak month.
- **European Red List**: species with a Red List category, grouped by category,
  with a coloured badge.

## Files

| File | Used by | |
|---|---|---|
| `useAtlas.js` | atlas page, home (`HomeAtlasTeaser`); `REGION_ALIASES` also Data page, `PanelAtAGlance`, `panels/_shared/italyAreas.js` | Data and region names |
| `AtlasMap.vue` | atlas page, home (`HomeAtlasTeaser`), Data page | Clickable map of the 20 regions |
| `SeasonBars.vue` | atlas page, home (`HomeAtlasTeaser`), Data page, `PanelAtAGlance` | 12 monthly bars |
| `RedListBadge.vue` | atlas page, `PanelAtAGlance` | IUCN category badge |
| `italyRegions.js` | `AtlasMap.vue` | Simplified SVG outlines of the regions |

### useAtlas.js

- `REGION_ALIASES` — map region name → spellings found in `stateProvince`
  (e.g. Sicilia: `Sicilia`, `Sicily`). **If records from a region don't appear on
  the map, add the spelling here.** Shared with the Data page, `PanelAtAGlance`
  and `panels/_shared/italyAreas.js`.
- `useAtlas()` → a reactive state shared by everyone who calls it (loaded once):
  `total`, `regions` (`{ name: { records, aliases: { spelling: n } } }`),
  `months` (12 counts), `redList`, `loadingRegions`, `loadingMonths`,
  `loadingRedList`, `species`. Counts are read from the `pagination-total` header of
  `/dwc_occurrences.json?country=Italy&per=1` (one small request per region spelling
  and per month), so they are exact without downloading the records.
- `loadRegionSpecies(name)` → fills `state.species[name]` with the OTUs that have a
  record in that region (`/otus.json?dwc_occurrence_query[...]`).
- `RED_LIST_ORDER` — order of the categories. The Red List comes from TaxonWorks
  content with topic **6440** ("European Red List"): the text of the content is the
  category, e.g. `Vulnerable`.

### AtlasMap.vue

Props: `counts` (`{ region: { records } }`), `selected` (region or `null`),
`loading`. Emits `select(region)`. Six colour classes (0, 1–9, 10–49, 50–199,
200–999, 1000+) with a legend; regions are keyboard accessible.

### SeasonBars.vue

Props: `values` (12 numbers, `null` = loading), `height` (px, default 140),
`unit` (`'records'` or any word). Hover a month for the exact number.

### RedListBadge.vue

Prop: `category` (English IUCN name). Shows the two-letter code in the IUCN colour plus
the name, in Italian when the site is in Italian.

### italyRegions.js

Default export: `[{ name, iso, d }]` (SVG path per region), `VIEWBOX`.
Source: openpolis/geojson-italy (ISTAT boundaries), CC BY 4.0 — keep this credit.
