# PanelBiology (`panel:biology`)

The whole **Biology** tab of species pages: the ecological texts entered in TaxonWorks
as content (OTU → content, by topic), with the European Red List category as an icon.

Layout:

- first the Red List (topic 6440, shown with its icon from `public/images/redlist/`)
  and topic 6429;
- then two groups, **Adult** (topics 6424, 6423, 6432, 6433, 6436, 6438, 6434, 6435,
  6439, 6431, 6437) and **Larva** (6422, 6430);
- any other topic after these, by id.

Topic names and definitions are read from TaxonWorks (`/controlled_vocabulary_terms?type=Topic`),
so renaming a topic there renames it here. To move a topic between groups or change
the order, edit `topicGroups` / `topicOrder` in `PanelBiology.vue`. Texts are Markdown;
depictions attached to a content are shown with it.

Data: `/controlled_vocabulary_terms`, `/contents?otu_id[]&topic_id[]&extend[]=depiction`.
Placed in `config/taxa_page.yml` → `biology` tab (`topic_id` can be bound there to
show only some topics).
