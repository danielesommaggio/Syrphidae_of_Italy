// Data for the Atlas page: occurrence records per Italian region and per month,
// species per region (on demand) and the European Red List assessments.
import { makeAPIRequest } from '@/utils/request'
import { reactive } from 'vue'

// Region names on the map → spellings used in the SoI stateProvince field
export const REGION_ALIASES = {
  Piemonte: ['Piemonte', 'Piedmont'],
  "Valle d'Aosta": ["Valle d'Aosta", 'Aosta Valley'],
  Liguria: ['Liguria'],
  Lombardia: ['Lombardia', 'Lombardy'],
  'Trentino-Alto Adige': ['Trentino-Alto Adige', 'Trentino-South Tyrol', 'Trentino-Alto Adige/Südtirol'],
  Veneto: ['Veneto'],
  'Friuli-Venezia Giulia': ['Friuli-Venezia Giulia', 'Friuli Venezia Giulia'],
  'Emilia-Romagna': ['Emilia-Romagna'],
  Marche: ['Marche'],
  Toscana: ['Toscana', 'Tuscany'],
  Umbria: ['Umbria'],
  Lazio: ['Lazio'],
  Campania: ['Campania'],
  Abruzzo: ['Abruzzo'],
  Molise: ['Molise'],
  Puglia: ['Puglia', 'Apulia'],
  Basilicata: ['Basilicata'],
  Calabria: ['Calabria'],
  Sicilia: ['Sicilia', 'Sicily'],
  Sardegna: ['Sardegna', 'Sardinia']
}

export const RED_LIST_ORDER = [
  'Critically Endangered',
  'Endangered',
  'Vulnerable',
  'Near Threatened',
  'Least Concern',
  'Data Deficient'
]

async function countRecords(params) {
  const { headers } = await makeAPIRequest.get('/dwc_occurrences.json', {
    params: { country: 'Italy', per: 1, ...params }
  })
  return Number(headers['pagination-total']) || 0
}

const state = reactive({
  regions: {}, // name -> { records, aliases: { alias: n } }
  months: Array(12).fill(null),
  total: null,
  redList: [],
  loadingRegions: true,
  loadingMonths: true,
  loadingRedList: true,
  species: {} // region -> { loading, list, error }
})

let started = false

export function useAtlas() {
  if (started || import.meta.env.SSR) return state
  started = true

  countRecords({})
    .then((n) => (state.total = n))
    .catch(() => {})

  Promise.all(
    Object.entries(REGION_ALIASES).map(async ([name, aliases]) => {
      const counts = await Promise.all(
        aliases.map((a) => countRecords({ stateProvince: a }).catch(() => 0))
      )
      state.regions[name] = {
        records: counts.reduce((a, b) => a + b, 0),
        aliases: Object.fromEntries(aliases.map((a, i) => [a, counts[i]]))
      }
    })
  ).finally(() => (state.loadingRegions = false))

  Promise.all(
    state.months.map((_, i) =>
      countRecords({ month: i + 1 })
        .then((n) => (state.months[i] = n))
        .catch(() => (state.months[i] = 0))
    )
  ).finally(() => (state.loadingMonths = false))

  loadRedList().finally(() => (state.loadingRedList = false))

  return state
}

async function loadRedList() {
  try {
    const { data } = await makeAPIRequest.get('/contents', {
      params: { 'topic_id[]': 6440, per: 500 }
    })
    const rows = (data || []).filter((c) => c.otu_id && c.text)
    if (!rows.length) return

    const { data: otus } = await makeAPIRequest.get('/otus', {
      params: { otu_id: rows.map((r) => r.otu_id), per: 500 }
    })
    const tagById = new Map((otus || []).map((o) => [o.id, o.object_tag]))

    state.redList = rows
      .map((r) => ({
        otuId: r.otu_id,
        category: r.text.trim(),
        html: (tagById.get(r.otu_id) || '').replace(/<\/?span[^>]*>/g, '')
      }))
      .sort(
        (a, b) =>
          RED_LIST_ORDER.indexOf(a.category) - RED_LIST_ORDER.indexOf(b.category) ||
          a.html.localeCompare(b.html)
      )
  } catch {
    state.redList = []
  }
}

// Species with at least one record in a region (slow query: loaded on click)
export async function loadRegionSpecies(name) {
  const entry = state.regions[name]
  if (!entry || state.species[name]?.list || state.species[name]?.loading) return
  state.species[name] = { loading: true, list: null, error: false }

  try {
    const aliases = Object.entries(entry.aliases)
      .filter(([, n]) => n > 0)
      .map(([a]) => a)

    const lists = await Promise.all(
      aliases.map((a) =>
        makeAPIRequest
          .get('/otus.json', {
            params: {
              'dwc_occurrence_query[country]': 'Italy',
              'dwc_occurrence_query[stateProvince]': a,
              per: 1000
            }
          })
          .then(({ data }) => data || [])
      )
    )

    const byId = new Map()
    lists.flat().forEach((o) => byId.set(o.id, o))

    state.species[name] = {
      loading: false,
      error: false,
      list: [...byId.values()]
        .map((o) => ({
          id: o.id,
          html: (o.object_tag || '').replace(/<\/?span[^>]*>/g, '')
        }))
        .sort((a, b) => a.html.replace(/<[^>]*>/g, '').localeCompare(b.html.replace(/<[^>]*>/g, '')))
    }
  } catch {
    state.species[name] = { loading: false, list: null, error: true }
  }
}
