# Gbif — Syrphidae of Italy on GBIF

SoI is a GBIF data publisher
([publisher page](https://www.gbif.org/publisher/2728e1fe-5c6d-486d-97ef-2adae33dc5b1),
endorsed by GBIF-US) with one occurrence dataset,
[Syrphidae of Italy (SoI)](https://www.gbif.org/dataset/83c91ce0-3fd9-42dd-a920-20feafe541f8),
DOI [10.15468/faryxm](https://doi.org/10.15468/faryxm), licence CC0 1.0.
GBIF harvests it regularly from the TaxonWorks Darwin Core archive
(`/api/v1/downloads/dwc_archive_complete`), so it follows TaxonWorks without uploads.

These files show that on the site. Everything is read live from the public GBIF API in
the visitor's browser.

| File | Used by |
|---|---|
| `useGbif.js` | home, about, data page, footer, `panels/PanelGBIF` |
| `GbifOpenData.vue` | home ("Cite and reuse"), about ("Open data") |

## useGbif.js

- `GBIF` (publisher key, dataset key, DOI) and `LINKS` (publisher, dataset, DOI,
  occurrence search, CC0) — **change the keys here** if they ever change.
- `useGbif()` → shared reactive state, loaded once: `records`, `species`, `updated`
  (last GBIF crawl, from `dataset/<key>/process`), `licence` (`{ code, url }`, from the
  dataset), `endorsedBy` (node name), `citation`.
- `cleanCitation(text)` — GBIF's citation repeats the title because the publisher and
  the dataset have the same name ("Syrphidae of Italy (SoI). Syrphidae of Italy (SoI).");
  this removes the repeat and the "accessed via GBIF.org on …" date.
- `datasetCitation(via)` → the citation with "accessed via <via> on <today>."
- `matchTaxon(name)`, `taxonCounts(taxonKey)`, `taxonLinks(taxonKey)` — for the
  species card (`panels/PanelGBIF`).
- `openRecordOnGbif(occurrenceID)` — opens one SoI record on gbif.org (looked up by
  `occurrenceId` in the dataset); the new tab opens immediately, so pop-up blockers
  allow it, and falls back to the dataset's occurrence search.
- `fmtDate(iso, it)` — "17 October 2026" / "17 ottobre 2026".

## GbifOpenData.vue

Card: GBIF mark, "Syrphidae of Italy is a GBIF data publisher", endorsing node, live
numbers (records, species, last update, licence), buttons to the dataset, the occurrence
search (explore and download) and the publisher page, DOI. No props; wrap it in
`<ClientOnly>`.

## Citations

- **Website** — from `config/project.yml` (`project_authors`, `project_citation`),
  shown on the home page and in the footer ("Cite this page").
- **Dataset** — GBIF's own citation of the dataset, shown on the home and data pages.
