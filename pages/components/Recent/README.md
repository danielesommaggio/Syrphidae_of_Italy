# Recent — `/newtaxa` and `/newreferences`

Pages: `pages/newtaxa.vue` and `pages/newreferences.vue` (header menu
"Latest › Names added / References added"). Both are three lines: a `RecentPage`
with their own title and texts.

| File | |
|---|---|
| `RecentPage.vue` | Layout: masthead, Names / References tabs, the log, and a side box with the curators' e-mail (`../Section/Data/curators.js`). Props: `kind` (`'taxa'` or `'sources'`), `title`; slots `lede` and `aside`. |
| `RecentLog.vue` | The list, newest first, grouped by month, with "Load more". Props: `kind`, `per` (default 40). |

## Data

- **Names** (`kind="taxa"`): `/taxon_names?validity=true&recent=true&recent_target=created_at&taxon_name_type=Protonym&extend[]=otus` —
  valid original names, by date entered in TaxonWorks; each links to its species page
  (OTU looked up by `taxon_name_id` when not included). The tag is the rank.
- **References** (`kind="sources"`): `/sources?in_project=true&recent=true&recent_target=created_at` — the tag is the year of publication.

"Recent" means *entered in TaxonWorks recently*, not *published recently*.
