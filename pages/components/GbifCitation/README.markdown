# GbifCitation — GBIF literature widget

A Vue version of GBIF's "latest literature" widget (the one from
gbif.org/tools/literature-widget), without the iframe. Used on the home page
(`../Home/HomeNewsCite.vue`) to list publications that cite the SoI dataset:

```vue
<ClientOnly>
  <VGbifCitationWidget query="gbifDatasetKey=83c91ce0-3fd9-42dd-a920-20feafe541f8" :per-page="10" :height="300" />
</ClientOnly>
```

| File | |
|---|---|
| `components/VGbifCitationWidget.vue` | The table: title, authors, year, source, paging. Props: `query` (the widget URL or only its query string, e.g. `gbifTaxonKey=2435099&year=2020,2024`), `filters` (same as an object; wins over `query`), `perPage`, `height`. |
| `components/VGbifCitationWidgetButton.vue` | A small GBIF button showing the number of citations, linking to the full list on gbif.org (used by `../Section/GbifBar.vue`, currently unused). |
| `components/CitationRow.vue`, `TableFooter.vue` | One row; paging footer (same rules as gbif-web). |
| `components/GbifLogoIcon.vue`, `MaterialIcon.vue` | Icons. |
| `utils/api.js` | `searchLiterature({ filters, offset, limit })` → GBIF `/v1/literature/search` (REST equivalent of the widget's GraphQL query); `parseWidgetQuery`, `makeSearchParams`, `makeLiteratureSearchUrl` (link "see all on GBIF"). |
| `utils/citation.js` | `getAuthors`, `getLink`, `getTruncatedAbstract` for one GBIF literature record (ported from gbif-web). |

Data comes straight from the public GBIF API in the visitor's browser.
