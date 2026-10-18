# PanelAtAGlance (`panel:at-a-glance`)

First panel of the **Overview** tab of species (and subspecies) pages: a summary card
of what SoI knows about the species, in English or Italian.

- **Italian records** — number of records from Italy (records with no country count as Italian).
- **Regions** — a small map of Italy with the regions where it was recorded
  ("Recorded in n regions"); region names come from `stateProvince` through
  `REGION_ALIASES` (`pages/components/Atlas/useAtlas.js`).
- **Flight season** — records per month (`SeasonBars`) and the peak month; if there are
  no dated records, "No dated records yet"; the phenology from the literature (topic content), when present, is shown below as "Literature".
- **Elevation**, **Generations** (voltinism) and **Larva** (trophism) — from topic content.
- **European Red List** badge (`RedListBadge`).
- **Interactions** in one line ("visits 24 plants · 2 parasitoids") with a link to the
  "Biological associations" tab (`otus-id-associations`).
- If nothing is known yet: "No records or ecological data in SoI for this species yet."

## Data

- `/otus/:id/inventory/dwc.json` — the species' occurrence records.
- `/contents?otu_id[]&topic_id[]` — ecological content. Topic ids are in `TOPIC`
  at the top of the file: phenology 6433, min. elevation 6434, max. elevation 6435,
  voltinism 6436, trophism 6422, Red List 6440.
- `fetchAssociations()` from `../_shared/associationGraph.js` (coordinate OTUs included).

Uses `pages/components/Atlas/SeasonBars.vue`, `RedListBadge.vue` and `useAtlas.js`
(`REGION_ALIASES`). Placed in `config/taxa_page.yml`, overview tab, first column.
