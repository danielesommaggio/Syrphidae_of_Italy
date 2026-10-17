# PanelBiologicalAssociationsGraph (`panel:biological-associations-graph`)

A network drawing of a taxon's biological associations, shown under the
Biological associations table (`panel:biological-associations-v2`). Hidden when
the taxon has none.

- **Left:** what the hoverfly uses — flowers visited, plants fed on, prey.
- **Middle:** the hoverfly (or, on a genus page, its species with records).
- **Right:** natural enemies — e.g. parasitoids ("Host of").

Line colour = relationship (fixed per relationship name in
`../_shared/associationGraph.js` → `RELATIONSHIP_SLOTS`; any other relationship
is a grey dashed line). Line width and dot size grow with the number of records.
Hover highlights connections; clicking a name opens its taxon page.

**Layout:** hoverflies are ordered by their main kind of association and placed
beside the names they are linked to; aphid prey are followed by the plants they
feed on (an extra column, from aphid → plant associations in the project).

**Food chain:** besides the taxon's own associations, the panel loads its
partners' associations that do not involve other hoverflies (one extra
`GET /biological_associations` for the partner OTUs, `withPartnerAssociations`
in `../_shared/associationGraph.js`) — e.g. the host plants of the aphids an
*Episyrphus* eats.

**Download:** PNG (2× resolution) and SVG (vector, for papers) of the drawing,
with the legend and a credit line (site, page address, date).

**References:** below the drawing, the sources cited for the associations shown
(numbered, from `GET /citations?citation_object_type=BiologicalAssociation` and
`GET /sources`). Pointing at a reference highlights the associations it
documents; clicking keeps them highlighted. Tooltips list the sources too.

Data: `GET /biological_associations` with the same `otu_query` as the table
(`extend[]=subject,object,biological_relationship,taxonomy`), plus one
`GET /otus?taxon_name_id[]=…` to link specimens/plant parts to their taxon pages.

The drawing itself is `../_shared/AssociationGraph.vue`; `pages/interactions.vue`
uses the same component for the whole project.

**Controls** (same component on the Interactions page):
- the legend chips switch each kind of association on and off;
- **Group by family** folds names of the same family into one dot (click it to
  list them; click the family label to fold again). It switches on by itself
  when a section has more than 25 names;
- **↓ CSV** downloads the associations shown (consumer, relationship, resource,
  families, records, references);
- on the Interactions page, **Find a taxon** highlights a name and its whole
  food chain.

Families are written in a column beside the names, with a bracket per run; in a
column that also receives links from further out (the aphids, linked to their
host plants) they follow each name instead.

Related: the At a glance panel shows a one-line summary ("visits 24 plants ·
2 parasitoids"), the Help wanted page lists species without interactions, and
the Interactions page has a bar chart of plant families
(`pages/components/Interactions/PlantFamilyChart.vue`).

