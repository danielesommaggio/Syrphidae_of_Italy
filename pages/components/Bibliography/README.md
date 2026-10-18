# Bibliography — `/bibliography`

Page: `pages/bibliography.vue`. Header menu "Bibliography" / "Bibliografia".
Replaces the stock TaxonWorks source filter in the menu; that filter is still linked
from the page as "Advanced search" (`/resources/tw/filter/bibliography`).

## What the page does

- **Numbers**: works, years covered, languages, works online (with a DOI or a link).
- **Works per decade**: bar chart (`DecadeBars.vue`). Click a bar to show only that
  decade; click it again to clear. Bar heights follow the other filters.
- **Search** in author, title, journal, year and DOI. Accents are ignored
  ("vujic" finds Vujić). All words must match.
- **Filters**: type of work (all / articles / books / chapters), language, "available online".
- **Sort**: author A–Z (with letter headings and a sticky A–Z jump bar), newest or
  oldest first (headings by decade). Lists are shown 150 at a time ("Show more").
- **Each reference**: language tag, `DOI ↗`, `BHL ↗` or `Online ↗` (from the URL),
  **Names in SoI** and **Copy** (plain-text citation + DOI).
- **Names in SoI** (loaded only on click): the taxon names that cite the work, linked
  to their pages. ★ = described in this work (citation marked *original* in
  TaxonWorks); dashed border = not a valid name. Below, a count of other things the
  work is cited for (nomenclatural acts, distribution records, associations…).
- **Export** of the works currently shown, in the current order: CSV, BibTeX, RIS.
- **Copy a link to this search**: every filter is kept in the address
  (`?q=&lang=&kind=&online=1&decade=&sort=`), so a filtered list can be shared.
- All text in English and Italian.

## Files

| File | |
|---|---|
| `../../bibliography.vue` | The page: filters, grouping, paging, names panel, copy and export buttons |
| `useSources.js` | Loading, cleaning and exporting the sources (no Vue state) |
| `DecadeBars.vue` | The decade bar chart |

### useSources.js

- `fetchSources()` → all sources of the project, as entries (`/sources?in_project=true`, 1000 per page).
- `toEntry(source)` → `{ id, html, text, search, year, decade, letter, authorKey, authors, language, kind, doi, url, bhl, raw }`.
  - `html`: the TaxonWorks citation (`cached`) with only `<i> <em> <b> <strong> <sup> <sub>`
    kept (`safeHtml`), safe for `v-html`; the trailing "[in German]" is removed.
  - `language`: read from that trailing "[in …]" of the citation. Works with no language
    in TaxonWorks simply have none (they are not shown under any language filter).
  - `kind`: `article`, `chapter` (`inbook`/`incollection`) or `book` (everything else).
- `fetchCitedNames(sourceId)` → `{ names, other }` from `/citations?source_id=` (note:
  `source_id`, *not* `source_id[]`, which the API ignores), then `/taxon_names` and
  `/otus` by `taxon_name_id[]` in batches of 50. Kingdom–order names are left out.
- `exportCsv`, `exportBibtex`, `exportRis` (entries) → download a file
  `SoI_bibliography_<date>.<ext>`. BibTeX keys are `firstauthorYEAR` (+ a, b… if repeated).
- `LANG_IT` — Italian names of the languages; add one here if a new language appears.

### DecadeBars.vue

Props: `counts` (`{ 1850: 12, … }`), `from`, `to` (first and last decade), `selected`
(decade or `null`), `label`, `unit(n)` (tooltip text). Emits `select(decade)`.
Each bar is a button (keyboard accessible); empty decades are disabled. One colour
(`--soi-yellow`), the selected decade darker, the others dimmed while one is selected.

## Data quality notes

What the page shows comes straight from the TaxonWorks sources, so fixes are made there:

- duplicates show up next to each other when sorted by author;
- works with no "[in …]" language are missing from the language filter;
- "Available online" uses the DOI and URL fields only.
