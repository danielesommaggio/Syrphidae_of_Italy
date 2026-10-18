# Data — `/data`

Page: `pages/data.vue`. Header menu "Data" / "Dati". Replaces the stock TaxonWorks
OTU filter (`/resources/tw/filter/dwc_otus`, still reachable) with an explorer of the
**occurrence records** themselves: specimens (`CollectionObject`) and literature
records (`AssertedDistribution`, basis of record `MaterialCitation`).

## What the page does

- **Loads every record once** from `/dwc_occurrences.json` (1000 per request, with a
  "Loading… n of total" message) and filters in the browser — instant, no server
  queries per click. About 5,200 records load in a few seconds. Past ~30,000 records
  (`MAX_PAGES` in `useOccurrences.js`) the filters should move to API queries.
- **Italy / All countries** switch (Italy by default). Numbers at the top follow it:
  records, species, records with coordinates, years.
- **Search**: species, locality, collector, collection, catalog number, type status, habitat.
- **Filters** (left column; behind "Show filters" on phones):
  - **Region map** (Italy only) — the Atlas map, coloured by the records matching the
    other filters; click a region to filter, click again to clear.
  - **Records per month** — the Atlas month bars for the current selection (read-only).
  - Subfamily, genus, species, country (all-countries mode), collection
    (`institutionCode`), collector (`recordedBy`, split on `|` and `;`), kind of record
    (specimen / literature), sex — each with live counts; click to select, click again to clear.
  - Year range, "with coordinates", "type specimens".
- **Three views**:
  - **Species** (default): one row per species with records, regions (or countries),
    first–last year. The record count opens those records.
  - **Records**: species, type status, literature badge (hover: the reference), sex,
    collection and catalog number, region, locality and elevation, date, collector.
  - **Map**: clustered points (`SoiPointMap.vue`); click a cluster to zoom, a point
    for the record and a link to the species page.
- **Download CSV (Darwin Core)** — the filtered records with standard DwC column
  names (`DWC_COLUMNS`), `SoI_records_<date>.csv`, UTF-8 with BOM (opens in Excel).
- **Copy link to this search** — all filters and the view are kept in the address
  (`?species=…&region=Veneto&view=map`).
- **GBIF banner** at the top: these records are the SoI occurrence dataset on GBIF
  (doi:10.15468/faryxm), with the date GBIF last updated it and links to the records
  and the dataset page on GBIF.
- **Record ⓘ on every specimen** (records view and map popups): the full record inside
  SoI (`panels/_shared/DwcTable.vue`, the same window as on species pages).
- **GBIF ↗ on every record**: opens that record on gbif.org, found by its `occurrenceID`
  (`openRecordOnGbif` in `../Gbif/useGbif.js`).
- **How to cite**: the dataset citation from GBIF (title not repeated), with
  "accessed via syrphidaeitaly.com on <today>"; a fixed text is used if GBIF can't be
  reached.

## Regions

Italian regions come from `stateProvince`, mapped to the 20 region names of the map
with `REGION_ALIASES` in `../Atlas/useAtlas.js` (so "Sicily" → Sicilia,
"Apulia" → Puglia). A spelling not in that list is not counted on the map; add it there
(it is shared with the Atlas and the species pages).

## Files

| File | |
|---|---|
| `../../data.vue` | The page: filters, facet counts, views, address sync, citation |
| `useOccurrences.js` | Loading and normalising the records; CSV export |
| `SoiPointMap.vue` | Leaflet map with marker clustering |

### useOccurrences.js

- `fetchOccurrences(onProgress)` → normalised records; calls `onProgress(loaded, total)`.
- `toRecord(dwc)` → `{ id, otu, name, species, subfamily, genus, country, state, region,
  locality, where, date, year, month, collectors, collector, inst, cat,
  basis ('specimen' | 'literature'), sex, type, elev, lat, lng, refs, raw, text }`.
  `raw` keeps the original DwC record for the CSV; `text` is the search index.
- `DWC_COLUMNS`, `downloadCsv(records, fileName)`.

### SoiPointMap.vue

Props: `points` (`[{ lat, lng, html }]`, `html` = popup), `height` (default `520px`),
`label` (screen readers). Loads Leaflet and `leaflet.markercluster` only in the browser
(wrap it in `<ClientOnly>`); falls back to plain points if clustering can't load.
Esri light-grey tiles; scroll-wheel zoom is off so the page scrolls normally.

## Reused components

`../Atlas/AtlasMap.vue` (region map), `../Atlas/SeasonBars.vue` (months),
`../Gbif/useGbif.js` (GBIF numbers, links, citation).
