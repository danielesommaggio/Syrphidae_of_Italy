# PanelKeys (`panel:keys`)

Overview tab. Lists the identification keys that concern the taxon:

- **keys to** this taxon (keys starting from it, e.g. key to the species of a genus);
- **keys in** which it is an end point.

Dichotomous keys open in the SoI key viewer (`/key/:id`, `modules/keys`); interactive
(matrix) keys in `/interactive-key/:id` (`modules/interactiveKeys`), image matrices in
the image-matrix viewer.

TaxonWorks only finds keys whose end points at *this exact* OTU
(`/otus/:id/inventory/keys`). Keys that end at another OTU of the same name (a
"coordinate" OTU) would be missed, so the panel also looks up the other OTUs of the
taxon name (`/otus?taxon_name_id[]=`) and merges their keys, without duplicates.
