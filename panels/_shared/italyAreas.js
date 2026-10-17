// Match a TaxonWorks geographic area name to an Italian region on the SoI map.
// Returns the map's region name, '*' for the whole of Italy, or null (not in Italy).
import { REGION_ALIASES } from '~/pages/components/Atlas/useAtlas.js'

const norm = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim()

const LOOKUP = new Map()
Object.entries(REGION_ALIASES).forEach(([region, aliases]) => {
  ;[region, ...aliases].forEach((a) => LOOKUP.set(norm(a), region))
})
// a few more spellings found in literature / gazetteers
;[
  ['Aosta', "Valle d'Aosta"],
  ["Valle d'Aosta/Vallée d'Aoste", "Valle d'Aosta"],
  ['Trentino', 'Trentino-Alto Adige'],
  ['Alto Adige', 'Trentino-Alto Adige'],
  ['South Tyrol', 'Trentino-Alto Adige'],
  ['Südtirol', 'Trentino-Alto Adige'],
  ['Friuli', 'Friuli-Venezia Giulia'],
  ['Emilia Romagna', 'Emilia-Romagna'],
  ['The Marches', 'Marche']
].forEach(([a, region]) => LOOKUP.set(norm(a), region))

export function regionOf(name) {
  const n = norm(name)
  if (n === 'italy' || n === 'italia' || n === 'italian republic') return '*'
  return LOOKUP.get(n) || null
}

export const isItalian = (name) => regionOf(name) !== null
