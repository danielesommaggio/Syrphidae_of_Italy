# Layout — header, footer, masthead, language switch

Site-wide pieces of Syrphidae of Italy, shown on every page. They replace the stock
TaxonPages layout files of the same name.

| File | |
|---|---|
| `LayoutHeader.vue` | Logo, menu (from `config/header.yml`, labels translated by `menuLabel`), EN/IT switch, dark-mode toggle, GitHub link |
| `LangSwitch.vue` | EN / IT buttons; the choice is kept in the browser (`setLang` in `src/utils/soiLang.js`) |
| `SoiMasthead.global.vue` | Page heading used by the custom pages (`eyebrow`, `title`, `lede` or slot); global, no import needed |
| `LayoutFooter.vue` | Footer (below) |

## Footer

- **Brand** and tagline, and **Cite this page** (`src/components/Footer/FooterCitation.vue`):
  `project_authors` + `project_citation` from `config/project.yml`, today's date and the
  page address, e.g. "Sommaggio D, Dal Pos D (2026). Syrphidae of Italy (SoI). Retrieved
  on 2026-10-18 at syrphidaeitaly.com/#/about". Change the authors or year there.
- **Explore** and **Project** link lists — edit `explore` / `project` in the script.
- **Open data**: *Published on GBIF* (publisher page, with the GBIF mark), the
  *Occurrence dataset* with its DOI, the data licence (**CC0 1.0**), and *Report a problem*.
  GBIF links come from `LINKS` in `pages/components/Gbif/useGbif.js`.
- **Bottom line**: TaxonWorks · TaxonPages · Species File Group credits, analytics note,
  "© year Syrphidae of Italy · Data CC0 1.0 · images under the licence shown with each one".

The licence must match the GBIF dataset (CC0). If it ever changes on GBIF, change it
here (`licence`, `bottomLicence`, the `LINKS.cc0` link) and in the lede of `pages/about.vue`.

All footer text is in English and Italian (`useT` dictionary in the script).
