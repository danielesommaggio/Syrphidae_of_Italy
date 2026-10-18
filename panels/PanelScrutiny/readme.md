# PanelScrutiny (`panel:scrutiny`)

Overview tab. Shows the **taxonomic scrutiny** statements of the name — data
attributes with the predicate "Scrutiny" (controlled vocabulary term id **3102**),
each followed by its citations (e.g. "Valid species. Speight, 2020").

Data: `/data_attributes.json?attribute_subject_id=<taxon name>&controlled_vocabulary_term_id=3102`,
then `/citations.json` for each attribute. Hidden when there are none.
