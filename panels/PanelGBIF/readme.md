# PanelGBIF (`panel:gbif`)

Card on the Overview tab: the taxon on GBIF, and how many GBIF records it has.

- the name, linked to the taxon's page on gbif.org;
- **records published by SoI** (highlighted), linked to those records on GBIF;
- **records from Italy** from all publishers, and **records worldwide**, each linked
  to the GBIF occurrence search;
- a link to the SoI occurrence dataset on GBIF.

The GBIF taxon is found with the GBIF name matcher (`species/match`, Animalia, on the
full name; subgenera in parentheses are handled by GBIF). If GBIF only finds a parent
taxon (match type `HIGHERRANK`) or nothing, the card is hidden, so counts are never
shown for the wrong taxon. Counts: `occurrence/search?taxonKey=…&limit=0`
(with `datasetKey` for SoI, `country=IT` for Italy).

Helpers (`matchTaxon`, `taxonCounts`, `taxonLinks`) are in
`pages/components/Gbif/useGbif.js`. For GBIF images, map and type specimens see the
**GBIF** tab (`PanelGbifImages`, `PanelGbifMap`, `PanelGbifTypeSpecimens`).
