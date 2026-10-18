# PanelDistribution (`panel:distribution`)

First panel of the **Distribution** tab (species pages; the tab key in
`config/taxa_page.yml` is still `asserted_distributions`, so the address
`#/otus/:id/asserted_distributions` does not change). It puts Italy first and joins two
kinds of evidence:

- **SoI records** — the taxon's specimen and literature records
  (`/otus/:id/inventory/dwc.json`), placed in a region by `stateProvince`
  (`REGION_ALIASES` in `pages/components/Atlas/useAtlas.js`);
- **literature** — the asserted distributions of the taxon and its descendants
  (`/asserted_distributions?taxon_name_id[]=…&descendants=true`), with their citations
  (`/citations?citation_object_type=AssertedDistribution&extend[]=source`). Italian areas are
  matched to regions by `regionOf` (`../_shared/italyAreas.js`), so "Sicily" and "Sicilia"
  count as the same region; an area inside a region (e.g. a province) counts for its region.

## Layout

1. **Distribution in Italy**
   - one sentence: "Recorded in 10 of 20 Italian regions." (a region counts when it has
     records or literature);
   - a map of the 20 regions: green = SoI records, yellow = literature, striped = both,
     pale = nothing yet; hover a region for its numbers and references;
   - a table grouped North / Centre / South / Islands with, for every region, the number of
     SoI records and the literature as author–year chips; regions without data say "no record
     yet", so gaps are visible. Click the number of records (or the region on the map) to list
     them under the row (`../_shared/RecordList.vue`): each record opens its full record inside
     SoI (ⓘ), with GBIF ↗ as a second link and a link to filter them on the Data page;
   - literature that gives only "Italy" is listed above the map;
   - a source note at the bottom: everything in this box is SoI data (records entered in
     SoI — the same records SoI publishes on GBIF — and the literature cited in SoI);
     other GBIF publishers are not included.
2. **Outside Italy** — one line per country, with its sub-areas (Skåne, Finnmark…) after
   it and the literature as chips; "absent" when the literature says the taxon is absent.
   Below, the GBIF context, labelled as not SoI data: "From GBIF (not SoI data): this taxon
   is recorded from 90 countries by all GBIF publishers together", linked to the GBIF map (`species/match` + `occurrence/search?facet=country`).

Author–year chips ("Bartsch et al. 2009") link to the Bibliography page searched for that
author and year; hover a chip for the full reference.

Below this panel the tab keeps the map of `panel:asserted-distributions`, shown with
`mapOnly: true` (its table is replaced by this panel).

Colours follow the Biology tab: literature yellow, SoI records green. English and Italian.
