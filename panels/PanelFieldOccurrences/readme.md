# PanelFieldOccurrences (`panel:field-occurrences`)

Tab **Field occurrences** (species pages): observations entered in TaxonWorks as
*field occurrences* (not specimens), each as a one-line label (count and sex,
locality, coordinates, date, collector) with its photos; click a photo for the
full-size viewer. Records with photos come first.

Data: `/otus/:id/inventory/dwc.json` (only `FieldOccurrence` records) and, for photos,
the `associatedMedia` links of each record. `components/ListOccurrences.vue` renders the list.
Placed in `config/taxa_page.yml` → `field_occurrences`.
