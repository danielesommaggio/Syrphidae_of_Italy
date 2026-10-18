# interactiveKeys — `/interactive-key/:id`

Shows a TaxonWorks **observation matrix** as an interactive (multi-access) key, using
the `VueInteractiveKey` component of `@sfgrp/distinguish`.

- Route `interactive-key` → `/interactive-key/:id`, where `:id` is the observation matrix id.
- `?otu_filter=12|34|56` limits the key to those OTUs.
- `components/ImageMatrixButton.vue` — "View Image Matrix" button: opens the taxa still selected in the key as an image matrix.
- Colours follow the site theme (CSS variables in `InteractiveKey.vue`).

Linked from species and genus pages by `panels/PanelKeys`. Dichotomous keys are a
separate module: `modules/keys` (see its README).
