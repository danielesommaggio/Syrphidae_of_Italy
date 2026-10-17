# PanelBiologicalAssociationsTable (`panel:biological-associations-table`)

Each biological association as a statement, the way an ontology reads it:

    [image]  Episyrphus balteatus [larva] — predator of → Aphis fabae · Aphididae   [1 · p. 473]

Replaces `panel:biological-associations-v2` in `config/taxa_page.yml` (the old
panel is kept, commented, and can be switched back there). Shown above the
Association network, and linked to it.

- **Subject — relationship → object**, always in the direction stored in
  TaxonWorks. The page's own taxon is shown dimmed (name and life stage only).
- **Properties** (life stages: `larva`, `adult`) are labels on the side they
  qualify. Hover: the definition from TaxonWorks; click: the Uberon term.
- **Relationship sections**, in the network's colours, with the definition from
  TaxonWorks and a link to the Relation Ontology term (`../_shared/ontology.js`).
- **An image on every row:** the association's own photo (marked ●), otherwise a
  photo of the partner taxon — SoI first, then iNaturalist (marked SoI / iNat).
- **Evidence:** numbered references, the same numbers as under the network
  (click to highlight there), plus Specimen ⓘ / Observation ⓘ record buttons.
- **Area** column only when some association has one.
- **Filters:** relationship and life-stage chips, a name filter (more than 8
  rows), CSV (with the RO term of each relationship).
- Rows with the same subject, relationship, object and properties are merged.
- Phones: each row becomes a card, image on the left.

## Ontology terms

Relationships → Relation Ontology, life stages → Uberon. The list is in
`../_shared/ontology.js`; a URI entered on a property in TaxonWorks (controlled
vocabulary term → URI) takes precedence. TaxonWorks has no URI field for
biological relationships, so their RO terms live only in that file.

Data: `/biological_associations` (+ `/basic` for properties), `/citations`,
`/sources`, `/depictions` + `/depictions/gallery` (associations and partner
OTUs), `/asserted_distributions`, `/controlled_vocabulary_terms`,
`/biological_relationships`; iNaturalist `/v1/taxa` for partner photos.

## Where it appears

On its own species tab, `associations` ("Biological associations"), together with the Association network; see `config/taxa_page.yml`. The "Recorded in" column draws a small map of Italy (`panels/_shared/ItalyAreaMap.vue`) from the asserted distributions attached to each association in TaxonWorks; areas outside Italy are listed as text only.
