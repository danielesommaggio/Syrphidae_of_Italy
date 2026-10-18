# PanelEtymology (`panel:etymology`)

Overview tab, genus and species pages. Shows:

- the **etymology** text of the name (Markdown, from the taxon name's etymology field);
- its **grammar** from the name's "Latinized" classifications: gender (masculine,
  feminine, neuter) and part of speech (adjective, participle, noun in apposition,
  noun in genitive case);
- for adjectives and participles in the species group, the masculine, feminine and
  neuter forms entered on the name.

Data: the taxon object of the page, `/taxon_name_classifications?taxon_name_id[]=`.
The panel is hidden when there is nothing to show.
