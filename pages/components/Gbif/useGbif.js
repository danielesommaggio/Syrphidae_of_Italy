// Syrphidae of Italy on GBIF: the publisher, the occurrence dataset, and helpers
// to link records and taxa to GBIF. Everything is read live from the public GBIF API.
import { reactive } from 'vue'

export const GBIF = {
  publisherKey: '2728e1fe-5c6d-486d-97ef-2adae33dc5b1',
  datasetKey: '83c91ce0-3fd9-42dd-a920-20feafe541f8',
  doi: '10.15468/faryxm',
  api: 'https://api.gbif.org/v1',
  site: 'https://www.gbif.org'
}

export const LINKS = {
  publisher: `${GBIF.site}/publisher/${GBIF.publisherKey}`,
  dataset: `${GBIF.site}/dataset/${GBIF.datasetKey}`,
  doi: `https://doi.org/${GBIF.doi}`,
  occurrences: `${GBIF.site}/occurrence/search?dataset_key=${GBIF.datasetKey}`,
  cc0: 'https://creativecommons.org/publicdomain/zero/1.0/'
}

// Used until (or if) GBIF answers
const FALLBACK_CITATION = `Sommaggio D, Dal Pos D (2026). Syrphidae of Italy (SoI). Occurrence dataset https://doi.org/${GBIF.doi}`

const LICENCES = {
  'publicdomain/zero': { code: 'CC0 1.0', url: LINKS.cc0 },
  'licenses/by/': { code: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  'licenses/by-nc/': { code: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/' }
}

const state = reactive({
  loaded: false,
  failed: false,
  records: null,
  species: null,
  updated: '', // YYYY-MM-DD, last time GBIF processed the dataset
  licence: { code: 'CC0 1.0', url: LINKS.cc0 },
  endorsedBy: '', // e.g. GBIF-US
  citation: FALLBACK_CITATION // without the "accessed …" part
})

const getJson = (path) =>
  fetch(`${GBIF.api}/${path}`).then((r) => {
    if (!r.ok) throw new Error(`GBIF ${r.status}`)
    return r.json()
  })

/**
 * GBIF writes "Publisher (year). Title. Occurrence dataset … accessed via GBIF.org on date."
 * Our publisher and dataset share the name, so the title appears twice: remove the
 * repeat and the access date (added again by `datasetCitation`).
 */
export function cleanCitation(text = '') {
  let s = String(text).replace(/\s*accessed via GBIF\.org on [\d-]+\.?\s*$/i, '').trim()
  s = s.replace(/([^.]+\.)\s*\1/g, '$1')
  return s
}

const today = () => new Date().toISOString().slice(0, 10)

/** The dataset citation with today's date. `via` = where it was accessed. */
export function datasetCitation(via = 'GBIF.org') {
  return `${state.citation} accessed via ${via} on ${today()}.`
}

let started = false

/** Live numbers about the SoI dataset on GBIF, loaded once and shared. */
export function useGbif() {
  if (started || import.meta.env.SSR) return state
  started = true
  Promise.all([
    getJson(`dataset/${GBIF.datasetKey}`).then((d) => {
      if (d.citation?.text) state.citation = cleanCitation(d.citation.text)
      const lic = Object.entries(LICENCES).find(([k]) => String(d.license || '').includes(k))
      if (lic) state.licence = lic[1]
    }),
    getJson(`dataset/${GBIF.datasetKey}/process?limit=1`)
      .then((d) => (state.updated = String(d.results?.[0]?.finishedCrawling || d.results?.[0]?.startedCrawling || '').slice(0, 10)))
      .catch(() => {}),
    getJson(`occurrence/search?datasetKey=${GBIF.datasetKey}&limit=0&facet=speciesKey&facetLimit=5000`).then((d) => {
      state.records = d.count ?? null
      state.species = d.facets?.[0]?.counts?.length ?? null
    }),
    getJson(`organization/${GBIF.publisherKey}`)
      .then((o) => (o.endorsingNodeKey ? getJson(`node/${o.endorsingNodeKey}`) : null))
      .then((n) => (state.endorsedBy = n?.title || ''))
      .catch(() => {})
  ])
    .catch(() => (state.failed = true))
    .finally(() => (state.loaded = true))
  return state
}

/** GBIF taxon key for a name (GBIF backbone), or null. */
export async function matchTaxon(name) {
  try {
    const d = await getJson(`species/match?kingdom=Animalia&name=${encodeURIComponent(name)}`)
    // HIGHERRANK = only a parent was found (e.g. the genus for a species): not this taxon
    return d.usageKey && !['NONE', 'HIGHERRANK'].includes(d.matchType) ? d.usageKey : null
  } catch {
    return null
  }
}

/** Record counts on GBIF for a taxon: from SoI, from Italy, everywhere. */
export async function taxonCounts(taxonKey) {
  const count = (q) => getJson(`occurrence/search?taxonKey=${taxonKey}&limit=0${q}`).then((d) => d.count ?? 0)
  const [soi, italy, world] = await Promise.all([count(`&datasetKey=${GBIF.datasetKey}`), count('&country=IT'), count('')])
  return { soi, italy, world }
}

export const taxonLinks = (taxonKey) => ({
  soi: `${GBIF.site}/occurrence/search?dataset_key=${GBIF.datasetKey}&taxon_key=${taxonKey}`,
  italy: `${GBIF.site}/occurrence/search?country=IT&taxon_key=${taxonKey}`,
  species: `${GBIF.site}/species/${taxonKey}`
})

/**
 * Opens one SoI record on GBIF, found by its occurrenceID. The tab is opened at
 * once (so pop-up blockers allow it) and sent to the record when GBIF answers;
 * if the record is not on GBIF yet, it lands on the dataset's occurrence search.
 */
export async function openRecordOnGbif(occurrenceID) {
  const tab = window.open('about:blank', '_blank')
  let url = LINKS.occurrences
  try {
    const d = await getJson(`occurrence/search?datasetKey=${GBIF.datasetKey}&occurrenceId=${encodeURIComponent(occurrenceID)}&limit=1`)
    if (d.results?.[0]?.key) url = `${GBIF.site}/occurrence/${d.results[0].key}`
  } catch {
    /* keep the search */
  }
  if (tab) tab.location.href = url
  else window.location.href = url
}

export function fmtDate(iso, it = false) {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString(it ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
