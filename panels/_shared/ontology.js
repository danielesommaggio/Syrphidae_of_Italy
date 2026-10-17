/**
 * ontology.js
 *
 * Links SoI's biological relationships and properties to shared ontologies, so
 * every association reads as a standard statement:
 *
 *   Episyrphus balteatus [larval stage] — preys on (RO_0002439) → Aphis fabae
 *
 * Relationships → Relation Ontology (RO), the vocabulary GloBI uses.
 * Properties (life stages) → Uberon. A URI entered on the term in TaxonWorks
 * (controlled vocabulary term → URI) always wins over this list.
 *
 * Checked against RO (OBO) in October 2026. "Saprophagous on" has no exact RO
 * term; "eats" is the closest broader relation.
 */
const OBO = 'http://purl.obolibrary.org/obo/'

export const RELATIONSHIP_TERMS = {
  'flower visitation': { id: 'RO_0002622', label: 'visits flowers of', inverse: { id: 'RO_0002623', label: 'has flowers visited by' } },
  'phytophagous on': { id: 'RO_0002470', label: 'eats', inverse: { id: 'RO_0002471', label: 'is eaten by' } },
  'saprophagous on': { id: 'RO_0002470', label: 'eats', broader: true, inverse: { id: 'RO_0002471', label: 'is eaten by' } },
  'predator of': { id: 'RO_0002439', label: 'preys on', inverse: { id: 'RO_0002458', label: 'preyed upon by' } },
  'parasitoid of': { id: 'RO_0002208', label: 'parasitoid of', inverse: { id: 'RO_0002209', label: 'has parasitoid' } },
  'pollen transport': { id: 'RO_0002455', label: 'pollinates', broader: true, inverse: { id: 'RO_0002456', label: 'pollinated by' } },
  'pollination success': { id: 'RO_0002455', label: 'pollinates', inverse: { id: 'RO_0002456', label: 'pollinated by' } }
}

export const PROPERTY_TERMS = {
  larva: { id: 'UBERON_0000069', label: 'larval stage' },
  adult: { id: 'UBERON_0000113', label: 'post-juvenile adult stage' },
  pupa: { id: 'UBERON_0000070', label: 'pupal stage' },
  egg: { id: 'UBERON_0000068', label: 'embryo stage' }
}

export const termUrl = (id) => (id ? `${OBO}${id}` : null)

/** RO term for a relationship, read forwards or (when our taxon is the object) inverted. */
export function relationshipTerm(name, inverted = false) {
  const t = RELATIONSHIP_TERMS[String(name || '').toLowerCase()]
  if (!t) return null
  const term = inverted ? t.inverse : t
  return term ? { ...term, url: termUrl(term.id), broader: !!t.broader } : null
}

/** Ontology term for a property; `uri` from TaxonWorks wins when present. */
export function propertyTerm(name, uri = null) {
  if (uri) return { id: uri.split('/').pop(), label: name, url: uri }
  const t = PROPERTY_TERMS[String(name || '').toLowerCase()]
  return t ? { ...t, url: termUrl(t.id) } : null
}

/** "Larva, Adult" → ['Larva', 'Adult'] */
export const splitProperties = (s) =>
  String(s || '')
    .split(/[,;]/)
    .map((x) => x.trim())
    .filter(Boolean)
