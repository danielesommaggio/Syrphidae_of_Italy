# PaneliNaturalist (`panel:inaturalist`)

Tab **iNaturalist** (genus and species pages). Two parts:

- **Curated photos** — the representative photos chosen by iNaturalist curators for the
  taxon (`/v1/taxa/:id`, `taxon_photos`); click for the full-size viewer with credit
  and a link to the photo on iNaturalist.
- **Research-grade observations** — paginated photo grid (`/v1/observations`, 12 per page),
  with a link to all research-grade observations on iNaturalist.

The TaxonWorks name is first matched to an exact iNaturalist taxon id (by name and rank),
which is then used for both queries — searching by name could return the parent genus or a
similar name. Subgenera are looked up too; if iNaturalist does not have the subgenus,
nothing is shown rather than the whole genus. Details in the comment at the top of
`PaneliNaturalist.vue`. `inat-mark.svg` is the iNaturalist logo.

Data comes from the public iNaturalist API in the visitor's browser.
