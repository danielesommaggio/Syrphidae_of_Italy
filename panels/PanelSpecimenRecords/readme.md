# PanelSpecimenRecords (`panel:specimen-records`)

**Not used at the moment** — the "Specimen & Occurrence Records" tab uses
`PanelSpecimenOccurrences` instead. Kept as a simpler alternative.

Lists the specimens of the taxon in two groups, **type specimens** and other
specimens, each as a label-like line (count and sex, institution, catalog number,
locality, coordinates, collector), with photos from the records' `associatedMedia`.

Data: `/otus/:id/inventory/dwc.json` (`CollectionObject` records). To use it, add
`panel:specimen-records` to a tab in `config/taxa_page.yml`.
