# Home — `/`

Page: `pages/home.vue`, which only stacks these sections in order. To reorder or
hide a section, edit `home.vue`.

| # | Component | What it shows | Data |
|---|---|---|---|
| 1 | `HomeHero.vue` | Title, live species count, name search, quick links (genera, atlas, keys), and "plates" of museum specimens | `useSoiStats`, `useSoiImages`; fallback photo `../images/scaeva.jpg` |
| 2 | `HomeLedger.vue` | "The catalogue in numbers": valid species, genera, synonyms, references… | `useSoiStats` |
| 3 | `HomeSubfamilies.vue` | The four subfamilies with their share of species (stacked bar) and counts | `useSoiStats` (`SUBFAMILIES`) |
| 4 | `HomeAtlasTeaser.vue` | Small Atlas map, records per month, peak month, link to `/atlas` | `../Atlas/useAtlas.js` |
| 5 | `HomeAbout.vue` | Why the catalogue (pollinators, pest control, bioindicators), links to About and Atlas | static text |
| 6 | `HomeExplore.vue` | "Find your way in": cards to genera, atlas, keys, family page, bibliography, data, latest, help wanted | static + family OTU id |
| 7 | `HomeNewsCite.vue` | Last 3 news; "Cite and reuse": the GBIF open-data card (`../Gbif/GbifOpenData.vue`), two citations with copy buttons (the website, from `config/project.yml`; the GBIF occurrence dataset, from GBIF), and the GBIF literature widget | `/news?per=3`; `../Gbif/useGbif.js`; `../GbifCitation` |
| 8 | `HomePartners.vue` | Partner logos (TaxonWorks, SFG, GBIF, Dolomiti Bellunesi National Park…) | list in the file; logos in `public/images/` |

Not used at the moment (kept for later): `HomeGallery.vue` (grid of diagnostic
characters, uses `useSoiImages().gallery`) and `ItalyMark.vue` (small outline of Italy
from `../Atlas/italyRegions.js`). Add `<HomeGallery />` to `home.vue` to bring the
gallery back.

## useSoiStats.js

`useSoiStats()` → shared reactive state, loaded once per visit:
`family` (`species`, `genera`, `invalid` = invalid species names),
`subfamilies[name]` (`species`, `genera`), `stats` (project `/stats`), `loaded`.
Counts come from the `pagination-total` header of `/taxon_names` (descendants of a
taxon, by rank and validity), so they are always current.

Hard-coded here: `SYRPHIDAE` (taxon name 1095229, OTU 945664) and `SUBFAMILIES`
(name, author, TaxonWorks ids, colour, one-line description EN/IT). `fmt(n)` formats numbers.

## useSoiImages.js

`useSoiImages()` → `{ plates, gallery, loaded }`, loaded once.

- **Plates** (hero): depictions on *specimens* whose caption contains "habitus" and
  that have a figure label; the label ("Eristalis tenax. Male…") gives the name, which
  is looked up to link the species page. First 6.
- **Gallery**: 8 random photographs (JPEG, ≥ 900 px wide) depicted on species (OTU)
  pages. The body part comes from the file name (`PARTS`: "addome", "wing", "faccia"…).

So: to put a specimen on the home page, depict it on the specimen in TaxonWorks with a
caption containing "habitus" and a figure label starting with the species name.
