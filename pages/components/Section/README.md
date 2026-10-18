# Section — previous home page (mostly unused)

These components built the earlier home page and the first About page. The current
home page is in `../Home/`, and **only these files are still used**:

| File | Used by |
|---|---|
| `Data/curators.js` | `pages/about.vue` (team), `pages/help-wanted.vue` and `../Recent/RecentPage.vue` (contact e-mail) |
| `About/Curators.vue` | `pages/about.vue` |

`curators.js` is the list of curators shown on the site: `name`, `url` (profile),
`affiliation`, `role`, `email` (empty = not shown), `image` (path in `public/`).
The first curator with an e-mail is the contact address for "Help wanted" and the
"Latest" pages — edit it here.

Not used at the moment (safe to delete, or reuse): `SectionLandscape.vue`,
`SectionData.vue` (+ `Data/DataType.vue`, `../Icon/`), `SectionDescription.vue`
(+ `GbifBar.vue`, `GbifLatestLiterature.vue`), `SectionHighlights.vue`,
`SectionTerms.vue`, `RecentTable.vue`, `RecentTaxonTable.vue`,
`About/AboutIntroduction.vue`.
