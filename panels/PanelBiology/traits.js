// Ecological traits of a hoverfly, read from TaxonWorks contents (free text, one
// content per topic) and cleaned up for display. Pure functions, no Vue, no API:
// unit-tested in traits.test.mjs.

// SoI topic ids (TaxonWorks → Topic)
export const TOPIC = {
  minLength: 6424,
  maxLength: 6423,
  mouthparts: 6432,
  phenology: 6433,
  altMin: 6434,
  altMax: 6435,
  voltinism: 6436,
  commensalism: 6437,
  overwintering: 6438,
  migratory: 6439,
  flowers: 6431,
  habitat: 6429,
  trophism: 6422,
  microhabitat: 6430,
  redList: 6440
}

// Spelling fixes for words found in the SoI contents (lower case → fixed)
const SPELLING = {
  schrubs: 'shrubs',
  shbrus: 'shrubs',
  thermophilus: 'thermophilous',
  zoophagus: 'zoophagous',
  polivoltine: 'polyvoltine',
  bivolrine: 'bivoltine',
  univoltin: 'univoltine',
  guarrigue: 'garrigue',
  heavely: 'heavily',
  filed: 'field',
  sal: 'salt',
  leodonton: 'leontodon',
  ancuhusa: 'anchusa',
  sisybrium: 'sisymbrium',
  convolvolus: 'convolvulus',
  plantaginacee: 'plantaginaceae',
  larvae: 'larva',
  pupae: 'pupa',
  puparium: 'pupa'
}

export function fixSpelling(s) {
  return String(s).replace(/[A-Za-z]+/g, (w) => {
    const fixed = SPELLING[w.toLowerCase()]
    if (!fixed) return w
    return w[0] === w[0].toUpperCase() ? fixed[0].toUpperCase() + fixed.slice(1) : fixed
  })
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

/** "A; B, C (x, y)" → ["A", "B", "C (x, y)"]: splits on ; and on commas outside brackets. */
export function splitList(text) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of String(text || '')) {
    if (ch === '(' || ch === '[') depth++
    if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1)
    if ((ch === ';' || (ch === ',' && depth === 0)) && depth === 0) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  const seen = new Set()
  return out
    .map((s) => cap(fixSpelling(s.trim().replace(/\.$/, ''))))
    .filter((s) => s && !/^unknown$/i.test(s))
    .filter((s) => {
      const k = s.toLowerCase()
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
}

/** "08" → 8, "9.5" → 9.5, "Unknown" → null */
export function toNumber(text) {
  const m = String(text ?? '').replace(',', '.').match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

const MONTH_RE = [
  /^jan|^gen/i,
  /^feb/i,
  /^mar/i,
  /^apr/i,
  /^ma[yg]/i,
  /^jun|^giu/i,
  /^jul|^lug/i,
  /^aug|^ago/i,
  /^sep|^set/i,
  /^oct|^ott/i,
  /^nov/i,
  /^dec|^dic/i
]

/**
 * Months named in a phenology text → array of 12 booleans.
 * "March to June", "May-June", "April, May, June" and "iv–vi" all work.
 */
export function parseMonths(text) {
  const on = Array(12).fill(false)
  const s = String(text || '')
  const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii']
  const tokens = [] // { m, start, end }
  const re = /[A-Za-z]+/g
  let x
  while ((x = re.exec(s))) {
    const w = x[0]
    let m = w.length >= 3 ? MONTH_RE.findIndex((r) => r.test(w)) : -1
    if (m < 0 && /^[ivx]+$/i.test(w) && w.length <= 4) m = ROMAN.indexOf(w.toLowerCase())
    if (m >= 0) tokens.push({ m, start: x.index, end: x.index + w.length })
  }
  tokens.forEach((tk, i) => {
    on[tk.m] = true
    const prev = tokens[i - 1]
    if (prev && /^\s*(to|a|-|–|—|until|till)\s*$/i.test(s.slice(prev.end, tk.start))) {
      for (let k = prev.m; k !== tk.m; k = (k + 1) % 12) on[k] = true
    }
  })
  return on
}

// Fixed-answer traits → { key, label } (key is used for translation and icons)
export function voltinism(text) {
  const keys = splitList(text)
    .map((v) => (/^uni/i.test(v) ? 'uni' : /^bi/i.test(v) ? 'bi' : /^(poly|multi|pluri)/i.test(v) ? 'poly' : null))
    .filter(Boolean)
  return [...new Set(keys)]
}

export function migratory(text) {
  const s = String(text || '').toLowerCase()
  if (!s || /unknown/.test(s)) return null
  if (/^\s*(no|non)\b/.test(s)) return 'no'
  if (/strong/.test(s)) return 'strong'
  if (/weak|partial/.test(s)) return 'weak'
  if (/migr/.test(s)) return 'yes'
  return null
}

export function overwintering(text) {
  const keys = splitList(text)
    .map((v) => (/larv/i.test(v) ? 'larva' : /pup/i.test(v) ? 'pupa' : /adult|imago/i.test(v) ? 'adult' : /egg|uov/i.test(v) ? 'egg' : null))
    .filter(Boolean)
  return [...new Set(keys)]
}

export function yesNo(text) {
  const s = String(text || '').trim().toLowerCase()
  if (/^(yes|si|sì|y)\b/.test(s)) return 'yes'
  if (/^no\b/.test(s)) return 'no'
  return null
}

/** "Zoophagous (Aphids)" → { key: 'zoophagous', label: 'Zoophagous', detail: 'aphids' } */
export function trophism(text) {
  return splitList(text).map((v) => {
    const detail = v.match(/\(([^)]+)\)/)?.[1]?.trim().toLowerCase() || ''
    const head = v.replace(/\([^)]*\)/, '').trim()
    const key = /zoophag|predat/i.test(head)
      ? 'zoophagous'
      : /phytophag/i.test(head)
        ? 'phytophagous'
        : /saprophag|saproxyl/i.test(head)
          ? 'saprophagous'
          : /mycophag/i.test(head)
            ? 'mycophagous'
            : /microphag|filter/i.test(head)
              ? 'microphagous'
              : null
    return { key, label: head, detail }
  })
}

/**
 * All traits of one species from its contents ([{ topic_id, text }]).
 * Fields that are missing are null / empty.
 */
export function traitsOf(contents = []) {
  const text = (id) =>
    contents
      .filter((c) => c.topic_id === id)
      .map((c) => String(c.text || '').trim())
      .filter(Boolean)
      .join('; ')
  const num = (id) => toNumber(text(id))
  let minLen = num(TOPIC.minLength)
  let maxLen = num(TOPIC.maxLength)
  if (minLen !== null && maxLen !== null && minLen > maxLen) [minLen, maxLen] = [maxLen, minLen]
  const altMinText = text(TOPIC.altMin)
  const altMaxText = text(TOPIC.altMax)
  const mouth = num(TOPIC.mouthparts)
  return {
    length: minLen !== null || maxLen !== null ? { min: minLen ?? maxLen, max: maxLen ?? minLen } : null,
    mouthparts: mouth,
    phenologyText: text(TOPIC.phenology),
    months: parseMonths(text(TOPIC.phenology)),
    altitude: altMinText || altMaxText ? { min: toNumber(altMinText) ?? 0, max: toNumber(altMaxText) } : null,
    voltinism: voltinism(text(TOPIC.voltinism)),
    overwintering: overwintering(text(TOPIC.overwintering)),
    migratory: migratory(text(TOPIC.migratory)),
    commensalism: yesNo(text(TOPIC.commensalism)),
    habitat: splitList(text(TOPIC.habitat)),
    flowers: splitList(text(TOPIC.flowers)),
    trophism: trophism(text(TOPIC.trophism)),
    microhabitat: splitList(text(TOPIC.microhabitat)),
    redList: text(TOPIC.redList)
  }
}

const FAMILY = /^([A-Z][a-z]+ace(?:ae|e))$/
const FAMILY_WITH_GENERA = /^([A-Z][a-z]+ace(?:ae|e))\s*\((.*)\)$/
const GENUS_OR_SPECIES = /^([A-Z][a-z-]+)(\s+[a-z-]+)*$/

/**
 * Flowers visited, grouped by plant family.
 *   items: literature entries, e.g. ["Apiaceae (Daucus, Heracleum)", "Caltha", "White umbellifers"]
 *   soi:   flower visits recorded in SoI, [{ family, genus }]
 * → [{ family, genera: [{ name, isGenus, lit, soi }] }], biggest families first;
 *   entries with no family (and no SoI record giving one) go under `otherLabel`, last.
 */
export function flowerGroups(items = [], soi = [], otherLabel = 'Other') {
  const fams = new Map() // family → Map(lower-case name → entry)
  const familyOfGenus = new Map(soi.filter((x) => x.family).map((x) => [x.genus, x.family]))
  const add = (family, name, src) => {
    const fam = family || familyOfGenus.get(name) || ''
    if (!fams.has(fam)) fams.set(fam, new Map())
    const m = fams.get(fam)
    const key = name.toLowerCase()
    const e = m.get(key) || { name, isGenus: /^[A-Z][a-z-]+$/.test(name), lit: false, soi: false }
    e[src] = true
    m.set(key, e)
  }
  // "Daucus carota" → "Daucus"; descriptions such as "White umbellifers" stay as they are
  const DESCRIPTION = /^(white|yellow|blue|purple|red|pink|small|large|tall|low|various|many|other|wild|garden)\b/i
  const genusOf = (s) => (GENUS_OR_SPECIES.test(s) && !DESCRIPTION.test(s) ? s.split(/\s+/)[0] : s)
  items.forEach((raw) => {
    const s = fixSpelling(String(raw).trim())
    const withGenera = s.match(FAMILY_WITH_GENERA)
    if (withGenera) {
      const fam = withGenera[1].replace(/acee$/, 'aceae')
      withGenera[2]
        .split(/[,;]/)
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((g) => add(fam, cap(genusOf(g)), 'lit'))
    } else if (FAMILY.test(s)) {
      if (!fams.has(s.replace(/acee$/, 'aceae'))) fams.set(s.replace(/acee$/, 'aceae'), new Map())
    } else if (s) add('', genusOf(s), 'lit')
  })
  soi.forEach((x) => x.genus && add(x.family, x.genus, 'soi'))

  return [...fams.entries()]
    .map(([family, m]) => ({
      family: family || otherLabel,
      other: !family,
      genera: [...m.values()].sort((a, b) => b.isGenus - a.isGenus || a.name.localeCompare(b.name))
    }))
    .filter((f) => f.genera.length || !f.other)
    .sort((a, b) => a.other - b.other || b.genera.length - a.genera.length || a.family.localeCompare(b.family))
}

// Broad habitat types, recognised from words in the (Syrph the Net style) habitat names.
// Order matters: the first rule that matches wins.
export const HABITAT_TYPES = ['woodland', 'scrub', 'grassland', 'wetland', 'farmland', 'other']
const HABITAT_RULES = [
  ['wetland', /lagoon|marsh|dune|beach|swamp|\bbog\b|\bfen\b|lake|pond|reed|saltmarsh|coast|estuar|spring|stream bank/i],
  ['scrub', /shrub|scrub|maquis|matorral|garrigue|heath|phrygana|bush|thicket/i],
  ['farmland', /field|fallow|orchard|vineyard|olive grove|crop|cereal|maize|arable|garden|\bpark\b|urban|flower bed|hedge|margin|plantation|cultivat|rice/i],
  ['grassland', /grassland|meadow|\bhay\b|pasture|steppe|steppic|prairie|lawn|grass/i],
  ['woodland', /wood|forest|quercus|fagus|picea|pinus|abies|betula|fraxinus|alnus|salix|populus|castanea|carpinus|acer\b|ulmus|larix|conifer|taiga|trees|savanna|gallery|riparian|floodplain/i]
]
export function habitatType(name) {
  return HABITAT_RULES.find(([, re]) => re.test(name))?.[0] || 'other'
}
/** habitat names → [{ type, items }] in HABITAT_TYPES order, empty types left out */
export function habitatGroups(names = []) {
  const by = new Map(HABITAT_TYPES.map((t) => [t, []]))
  names.forEach((n) => by.get(habitatType(n)).push(n))
  return HABITAT_TYPES.map((type) => ({ type, items: by.get(type) })).filter((g) => g.items.length)
}

// Where larvae live, as layers of the vegetation (top to bottom) plus special places.
export const LARVAL_LAYERS = ['canopy', 'understorey', 'shrubs', 'tallHerbs', 'lowPlants', 'ground']
export const LARVAL_SPECIAL = ['deadwood', 'water', 'nests']
const LAYER_RULES = [
  ['understorey', /understor/i],
  ['canopy', /canopy|crown|mature trees/i],
  [['canopy', 'understorey'], /\btrees?\b/i],
  ['shrubs', /shrub|bush/i],
  ['tallHerbs', /tall\b.*herb/i],
  ['lowPlants', /low[\s-]*growing|low herbs?|herb layer|field layer/i],
  ['ground', /litter|soil|ground|moss/i],
  ['deadwood', /dead ?wood|rot[\s-]?hole|sap[\s-]?run|saproxyl|decay|stump|log\b/i],
  ['water', /water|aquatic|pond|submerged|\bmud\b|stream|ditch|pool/i],
  ['nests', /nest|\bants?\b|wasp|bumble/i]
]

/**
 * "Foliage, Understorey Trees, Shrubs" → { layers: Set(['understorey', 'shrubs']), foliage: true, other: [] }
 * An item may name several layers ("Tree foliage" → canopy + understorey); "Foliage" alone
 * sets `foliage` (larvae on leaves) without a layer; items that match nothing go to `other`.
 */
export function larvalLayers(items = []) {
  const layers = new Set()
  const other = []
  let foliage = false
  items.forEach((raw) => {
    const s = fixSpelling(String(raw))
    if (/foliage|leaves|leaf/i.test(s)) foliage = true
    let hit = false
    for (const [layer, re] of LAYER_RULES) {
      if (!re.test(s)) continue
      ;[layer].flat().forEach((l) => layers.add(l))
      hit = true
      // "Low shrubs" is a shrub, not also a low plant
      if (layer === 'shrubs') break
      if (layer === 'understorey') break
    }
    if (!hit && !/^\s*(foliage|leaves)\s*$/i.test(s)) other.push(s.trim())
  })
  return { layers, foliage, other }
}
