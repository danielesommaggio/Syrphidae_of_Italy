# pages — the custom SoI pages

Every `.vue` file in this folder becomes a route (file-based routing of TaxonPages);
a file route wins over a module route with the same path. Sub-folders become nested
routes (`taxa/index.vue` → `/taxa`, `taxa/[name].vue` → `/taxa/:name`). The site uses
hash routing (`config/router.yml`, `hash_mode: true`), so links look like
`https://syrphidaeitaly.com/#/atlas`.

After adding or renaming a page, **restart the dev server** — new routes are only
picked up at start-up.

**Any `.md` file in this folder becomes a page** (TaxonPages supports Markdown pages),
and a README full of code breaks the build. That is why the READMEs here are named
`README.markdown`: GitHub still shows them, the site ignores them. Never add a
`README.md` under `pages/`.

## Pages

| Route | File | Header menu | What it is |
|---|---|---|---|
| `/` | `home.vue` | Home | Home page, assembled from `components/Home/` |
| `/taxa` | `taxa/index.vue` | Genera | Table of all genera: subfamily, species in Italy and worldwide, realms, keys — see `taxa/README.markdown` |
| `/taxa/:name` | `taxa/[name].vue` | — | Genus profile (written account + live species list) |
| `/atlas` | `atlas.vue` | Atlas | Records per Italian region (map), species per region, flight season, European Red List |
| `/interactions` | `interactions.vue` | Interactions | Network of every biological association + plant families chart |
| `/bibliography` | `bibliography.vue` | Bibliography | Searchable, filterable bibliography with exports — see `components/Bibliography/README.markdown` |
| `/data` | `data.vue` | Data | Occurrence explorer (species / records / map), Darwin Core CSV — see `components/Data/README.markdown` |
| `/newtaxa` | `newtaxa.vue` | Latest › Names added | Names most recently added (`components/Recent/`) |
| `/newreferences` | `newreferences.vue` | Latest › References added | References most recently added (`components/Recent/`) |
| `/about` | `about.vue` | About › About SoI | Project, aims, open data on GBIF (how the data flow from TaxonWorks to GBIF), team (from `components/Section/Data/curators.js`) |
| `/help-wanted` | `help-wanted.vue` | About › Help wanted | Species still missing a photo, an Italian record, ecological data or interactions |

Routes provided by modules rather than pages: `/keys` and `/key/:id` (`modules/keys`),
`/interactive-key/:id` (`modules/interactiveKeys`), `/news` (TaxonPages news module),
species pages `/otus/:id/...` (panels in `panels/`, layout in `config/taxa_page.yml`).

The stock TaxonPages filters are still reachable but no longer in the menu:
`/resources/tw/filter/bibliography` (linked as "Advanced search" from `/bibliography`)
and `/resources/tw/filter/dwc_otus`. Their headings are customised in
`src/modules/bibliography/views/index.vue` and `src/modules/DwCFilter/views/index.vue`.

The menu itself is `config/header.yml`; Italian menu labels are in `MENU_IT` in
`src/utils/soiLang.js` (add a line there when you add a menu item).

## Data

All pages read the public TaxonWorks API of the SoI project (`config/api.yml`)
through `makeAPIRequest` from `@/utils/request` — an axios instance that already adds
the `project_token`. Nothing is written back. A few pages also read public APIs
(GBIF, iNaturalist) directly with `fetch`/axios; those are listed in each README.

Ids hard-coded in pages (change them here if they change in TaxonWorks):

| What | Id | Used in |
|---|---|---|
| Syrphidae taxon name / OTU | 1095229 / 945664 | `components/Home/useSoiStats.js`, `taxa/useGenera.js`, `help-wanted.vue` |
| Topic "European Red List" | 6440 | `components/Atlas/useAtlas.js`, `panels/PanelBiology`, `panels/PanelAtAGlance` |
| GBIF publisher, dataset key and DOI | see `GBIF` in `components/Gbif/useGbif.js` | home, about, data, footer, `panels/PanelGBIF` |

## Shared building blocks

- **`SoiMasthead`** (`src/components/Layout/SoiMasthead.global.vue`, global) — the page
  heading: `eyebrow`, `title`, `lede` (or a default slot instead of `lede`).
- **Language** (`src/utils/soiLang.js`) — every page is English/Italian.
  `const t = useT({ en: {...}, it: {...} })`, then `t('key', { n: 3 })` replaces `{n}`.
  `isIt` / `lang` give the current language (remembered in the browser,
  English by default). Missing Italian keys fall back to English.
- **Styles** (`config/style/theme.css`) — wrap a page in `<div class="soi">` and use
  `soi-card`, `soi-eyebrow`, `soi-serif` (Fraunces), `soi-muted`, `soi-link`,
  `soi-btn soi-btn-ink | soi-btn-line`, `soi-search`, `soi-skel` (loading shimmer).
  Colours are CSS variables with a dark-mode set: `--soi-paper`, `--soi-paper-2`,
  `--soi-ink`, `--soi-ink-soft`, `--soi-rule`, `--soi-yellow`, `--soi-yellow-deep`,
  `--soi-olive`, `--soi-terra`, `--soi-sea`, `--soi-card`.
- **Links to species pages**: `{ name: 'otus-id-overview', params: { id: otuId } }`.

## Components folder

| Folder / file | For | README |
|---|---|---|
| `components/Atlas/` | Atlas page; map and month bars also reused by Data and species pages | yes |
| `components/Bibliography/` | Bibliography page | yes |
| `components/Data/` | Data page | yes |
| `components/Home/` | Home page sections | yes |
| `components/Interactions/` | Interactions page chart | yes |
| `components/Recent/` | Names / references added | yes |
| `components/Gbif/` | SoI on GBIF: live numbers, links, citations, open-data card | yes |
| `components/GbifCitation/` | GBIF "latest literature" widget (home page) | yes |
| `components/Section/` | Mostly the previous home page (unused) + `Data/curators.js` (used) | yes |
| `components/Icon/` | Small SVG icons used by `Section/SectionData.vue` | yes |
| `components/TaxonProfile.vue` | Genus profile layout used by `taxa/[name].vue` | see `taxa/README.markdown` |
| `components/AnimateNumber.vue` | Counts up to a number (used by `Section/Data/DataType.vue`) | — |
| `components/ImageCarrousel.vue` | Image slider (used by `Section/SectionLandscape.vue`) | — |
| `components/OSFLogo.vue`, `components/ProfileStats.vue` | Not used at the moment | — |
| `components/images/` | Images imported by components | — |

## Adding a page

1. Create `pages/<name>.vue` with `<div class="soi">`, `<SoiMasthead>` and a `useT` dictionary.
2. Set the tab title with `useHead({ title: () => \`${t('eyebrow')} — Syrphidae of Italy\` })`.
3. Add it to `config/header.yml` and its Italian label to `MENU_IT`.
4. Restart the dev server.
