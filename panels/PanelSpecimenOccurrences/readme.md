# PanelSpecimenOccurrences (`panel:specimen-occurrences`)

Replaces the separate `PanelSpecimenRecords` + `PanelFieldOccurrences`. Shows the
CollectionObject / FieldOccurrence records for an OTU (or, above species rank, a
per-species aggregate view).

- `PanelSpecimenOccurrences.vue` — rank switch: species/subspecies →
  `SingleSpeciesOccurrences`, anything higher → `SpeciesBars`.
- `SingleSpeciesOccurrences.vue` — one OTU. Single `dwc.json` fetch, records
  grouped/collapsed by shared collecting event via `lib/groupRecords.js`.
  Country / collector / type / media filters, List vs Phenology view.
- `SpeciesBars.vue` — per-species bars for a higher taxon; expanding one mounts
  `SingleSpeciesOccurrences` for that species.
- `ListRecords.vue`, `MultiSelect.vue` — presentational.

## Shared dependencies

- `../../_shared/DwcTable.vue` — the CO/FO detail modal, opened from the ⓘ button
  on a record row (`SingleSpeciesOccurrences.vue`).
- `../../_shared/ImageLightbox.vue` — the project-wide fullscreen image viewer,
  opened from a record's media thumbnails. Specimen `associatedMedia` images carry
  CO/FO depiction types, so the lightbox also shows the type-status line and its
  own ⓘ back into `DwcTable`.
- `../../_shared/specimenRef.js` — resolves a biological-association participant to
  the physical CO/FO it refers to (used to show the primary association inline on
  each row).

See [`../../_shared/readme.md`](../../_shared/readme.md).

## Site settings (`config.js`)

- `HOME_COUNTRY` (SoI: `'Italy'`) — types collected elsewhere (e.g. syntypes of
  synonyms) go to a collapsible "Type material from outside Italy" block above the
  list; home-country records are listed before the rest; a **region** filter
  (stateProvince) replaces the country filter, which only appears when records come
  from more than one country. Leave it empty on other sites to keep the old layout.
- `KIND_COLORS` — colours of the record kinds (type / specimen / field occurrence)
  for the card labels and the map.

## Map view

`RecordsMap.vue` — a fourth view (List · Map · Phenology · Timeline): one dot per
georeferenced record, coloured by kind, following the active filters; clicking a
dot opens the record. Uses the site's base map (`config/maps.yml`).

## Host requirements

The panel uses `VButton` (`variant`/`size`/`ghost`), `VToggle`, and Tailwind's
`bg-secondary`/`text-secondary` mapped to `--color-ui-accent`
(`config/vendor/tailwind.config.cjs` + `config/style/theme.css`). Without these the
view buttons, switches and bars render unstyled.
