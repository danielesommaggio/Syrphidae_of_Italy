const GBIF_API = 'https://api.gbif.org/v1'
const GBIF_SITE = 'https://www.gbif.org'

// Pagination is owned by the widget, never by its filters
// (the GBIF widget drops `from` the same way).
const IGNORED_PARAMS = ['from', 'offset', 'limit', 'locale']

export function makeSearchParams(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value]

    values
      .filter((v) => v !== null && v !== undefined && v !== '')
      .forEach((v) => searchParams.append(key, v))
  })

  return searchParams
}

// Accepts what the GBIF widget generator gives: the iframe URL
// (https://www.gbif.org/api/widgets/literature/latest?gbifTaxonKey=...)
// or just its query string. Repeated parameters become arrays.
export function parseWidgetQuery(query) {
  if (!query) return {}

  const search = query.includes('?') ? query.slice(query.indexOf('?')) : query
  const filters = {}

  new URLSearchParams(search).forEach((value, key) => {
    if (IGNORED_PARAMS.includes(key)) return

    filters[key] = key in filters ? [].concat(filters[key], value) : value
  })

  return filters
}

// REST equivalent of the widget's LiteratureWidgetSearch GraphQL query:
// same filters, same ordering, results carry the same fields.
export async function searchLiterature({ filters, offset, limit }) {
  const response = await fetch(
    `${GBIF_API}/literature/search?${makeSearchParams({ ...filters, offset, limit })}`
  )

  if (!response.ok) {
    throw new Error(`GBIF literature search failed: ${response.status}`)
  }

  return response.json()
}

export function makeLiteratureSearchUrl(filters) {
  return `${GBIF_SITE}/literature/search?${makeSearchParams(filters)}`
}
