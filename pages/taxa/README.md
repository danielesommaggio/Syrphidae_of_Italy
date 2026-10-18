# Genera — `/taxa` and `/taxa/:name`

Header menu "Genera" / "Generi".

| File | Route | |
|---|---|---|
| `index.vue` | `/taxa` | Table of all genera; filter by name, subfamily and realm; sort by column; click a row for the genus profile |
| `TaxaTableIntro.vue` | — | Masthead and introduction of the table |
| `[name].vue` | `/taxa/:name` (e.g. `/taxa/Dasysyrphus`) | Genus profile; 404 if the genus is not in the list |
| `useGenera.js` | — | Live list of genera (shared by `index.vue`, `[name].vue`, `pages/help-wanted.vue`) |
| `constants/taxa.js` | — | Loads every genus account in `constants/taxa/*.js` |
| `constants/taxa/<Genus>.js` | — | One hand-written genus account per file |
| `../components/TaxonProfile.vue` | — | Layout of the genus profile |

## Where the data come from

The table is **live**: genera, species and subfamilies come from TaxonWorks every
time, so a genus or species added in TaxonWorks appears without editing the site.
The hand-written accounts only add what TaxonWorks does not have.

`useGenera()` → `{ loading, error, list, speciesByGenus }`, loaded once per visit:

- valid genera, species, subfamilies and tribes below Syrphidae (taxon name 1095229),
  from `/taxon_names?descendants=true&validity=true&rank[]=…`;
- **species in Italy** = valid species of the genus in the catalogue;
- **subfamily**: walked up from the genus through tribes;
- **keys**: dichotomous keys (`/leads`) whose end points at the genus OTU; a key whose
  title contains "(EN)" is the English key, any other is the Italian key;
- **species worldwide, realms, written account**: from the genus account, if there is one
  (genera with an account are marked "Account" in the table).

If TaxonWorks cannot be reached, the table falls back to the hand-written accounts.

`accountFor(name)` returns the account of a genus (or `undefined`).

## Writing a genus account

Create `constants/taxa/<Genus>.js` (it is picked up automatically) with a default export:

```js
const Dasysyrphus = {
  otuId: 950163,               // TaxonWorks OTU of the genus
  taxonName: 'Dasysyrphus',    // must match the valid name in TaxonWorks
  author: 'Enderlein, 1938',
  numSpecies: '50',            // species worldwide
  distribution: ['Palearctic', 'Indomalayan'],   // realms, as in the realm filter
  introduction: `…`,           // the text fields accept HTML (<i>, <p>, <a>)
  diagnosis: `…`,
  description: `…`,
  biology: `…`,
  biodiversity: `…`,           // world richness and distribution
  italianBiodiversity: `…`,    // in Italy
  references: ['…', '…']
}
export default Dasysyrphus
```

Older fields still present in some files (`url`, `numSpeciesIta`, `keyUrl`, `keyUrlEN`)
are no longer used: the species count, links and keys now come from TaxonWorks.

## Genus profile (`[name].vue` + `TaxonProfile.vue`)

Header with author, subfamily, species worldwide and in Italy, realms and key buttons
(EN / IT); a map of the genus' records in SoI (`PanelDistribution`); "On this page" contents; the written account sections (or a note that the
account is in preparation); the list of Italian species, each linked to its species
page (OTUs looked up by `taxon_name_id`); the references; a link to the genus page in
the catalogue ("Names, records & data").
