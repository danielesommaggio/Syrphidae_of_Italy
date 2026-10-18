# panels — the taxon pages

Every folder here with a `main.js` is a panel (`id: 'panel:…'`) that TaxonPages can place
on a taxon page. Which panels appear, in which tab and order, is set in
`config/taxa_page.yml`. Folders starting with `_` (`_shared`, `_gbifShared`) are not
panels: they hold code used by several panels. Each panel has its own `readme.md`.

## Tabs of a taxon page

| Tab (address) | Ranks | Panels |
|---|---|---|
| **Overview** (`/otus/:id/overview`) | all | `PanelAtAGlance`, gallery, type, nomenclature… / `PanelMapV2`, descendants, `PanelScrutiny`, `PanelKeys`, `PanelEtymology`, `PanelGBIF`, statistics |
| **Biological associations** (`…/associations`) | species | `PanelBiologicalAssociationsTable`, `PanelBiologicalAssociationsGraph` |
| **Biology** (`…/biology`) | all | `PanelBiology` |
| **Specimen & Occurrence Records** (`…/specimen_records`) | all | `PanelSpecimenOccurrences` |
| **Distribution** (`…/asserted_distributions`) | species | `PanelDistribution`, then the map of `PanelAssertedDistributions` (`mapOnly`) |
| **Field occurrences** | species | `PanelFieldOccurrences` |
| **iNaturalist** | genus, species | `PaneliNaturalist` |
| **GBIF** | all | `PanelGbifImages`, `PanelGbifMap`, `PanelGbifTypeSpecimens` |

Panels without the "Panel" prefix in the yml (gallery, type, nomenclature, map, descendants,
statistics) are the stock TaxonPages ones in `src/modules/otus/components/Panel/`.
Not used at the moment: `PanelBiologicalAssociationsV2`, `PanelSpecimenRecords`,
`PanelGbifTaxon`.

## How the SoI panels present data

These rules are shared by the Biology, Distribution, Biological associations and At a
glance panels, so the pages read the same way:

- **Literature and SoI records are always shown apart, and say which is which.**
  Yellow = what the literature reports (TaxonWorks contents and asserted distributions);
  green = SoI's own records (specimens and literature records in the SoI database,
  `/otus/:id/inventory/dwc.json`). Where both exist, one sentence compares them, stating
  facts only (e.g. "2 records in SoI lie above the literature range …").
- **Data from outside SoI is labelled as such** — e.g. "From GBIF (not SoI data): …" on the
  Distribution tab. Everything else on these tabs comes from SoI.
- **Internal links first, GBIF second.** A record opens its full record inside SoI
  (ⓘ, `_shared/DwcTable.vue`, through `_shared/RecordList.vue`); "GBIF ↗" beside it opens
  the same record on GBIF. References open the Bibliography page (`/bibliography`), species
  open their SoI page, filtered record sets open the Data page (`/data`).
- **Hover, click, keyboard.** Every chart mark shows its exact value on hover or keyboard
  focus; clicking a mark lists what is behind it (records at an elevation, records of a
  region, other species sharing a habitat, a flower genus or a larval layer).
- **English and Italian** through `useT` (`src/utils/soiLang.js`); site colours and fonts
  from `config/style/theme.css` (`--soi-…` variables, light and dark).

## Shared code

| Where | What |
|---|---|
| `_shared/RecordList.vue` | List of SoI records: full record inside SoI (ⓘ), literature reference, GBIF ↗ |
| `_shared/DwcTable.vue` | The full-record window (Darwin Core) for a specimen or field observation |
| `_shared/italyAreas.js` | `regionOf(name)`: a TaxonWorks area name → Italian region ("Sicily" = "Sicilia") |
| `_shared/associationGraph.js` | Biological associations: loading, network, references |
| `pages/components/Atlas/useAtlas.js` | `REGION_ALIASES`: `stateProvince` spellings → region |
| `pages/components/Atlas/RedListBadge.vue`, `SeasonBars.vue` | Red List badge, monthly bars |
| `pages/components/Gbif/useGbif.js` | SoI on GBIF: dataset numbers, taxon match and counts, `openRecordOnGbif` |

More in `_shared/readme.md` and in each panel's `readme.md`.

## Recent changes (October 2026)

- **Biology** rebuilt from a list of texts into a life-cycle summary: size, flight season and
  altitude charts (literature vs SoI records, with a comparison sentence; altitude ticks list
  their records), preferred habitat by broad type, flowers visited by plant family, larval food
  and a height scale of where larvae live. Each of habitat, flower genus and larval layer
  lists the other hoverflies that share it. Free-text values are cleaned on display
  (`PanelBiology/traits.js`, with tests). See `PanelBiology/readme.md`.
- **Distribution** tab (was "Asserted Distributions"): Italy first — regions map and table
  from SoI records and literature, records of a region listed on click, then countries outside
  Italy and a labelled GBIF line. See `PanelDistribution/readme.md`.
- **GBIF card** on the Overview: SoI records on GBIF, records from Italy and worldwide
  (`PanelGBIF/readme.md`).
- **Records open inside SoI** everywhere (ⓘ), with GBIF as a second link.
