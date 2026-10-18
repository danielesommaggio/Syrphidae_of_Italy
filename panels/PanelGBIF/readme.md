# PanelGBIF (`panel:gbif`)

Small card on the Overview tab with the GBIF logo and the name, linking to the
taxon's page on gbif.org. The GBIF taxon is found with the GBIF name matcher
(`api.gbif.org/v1/species/match?name=<full name>`); the card is hidden if GBIF has no match.

For GBIF images, map and type specimens see the **GBIF** tab (`PanelGbifImages`,
`PanelGbifMap`, `PanelGbifTypeSpecimens`, each with its own readme).
