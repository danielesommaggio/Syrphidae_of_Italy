/**
 * associationGraph.js
 *
 * Turns TaxonWorks biological associations into a food-web graph with one
 * column per trophic level, hoverflies in the middle:
 *
 *   aphids' host plants  ←  flowers, plants, prey  ←  hoverflies  ←  parasitoids, predators
 *        level −2                 level −1              level 0          level +1
 *
 * Every relationship used in SoI reads "consumer — relationship — resource"
 * (Flower visitation, Phytophagous on, Predator of, Parasitoid of), so the
 * object of an association sits one level below its subject. Levels are worked
 * out outwards from the hoverflies (family Syrphidae); a name can appear in two
 * columns (e.g. a plant visited by a hoverfly and fed on by an aphid).
 *
 * Used by panels/PanelBiologicalAssociationsGraph (one taxon) and
 * pages/interactions.vue (the whole project).
 */
import { makeAPIRequest } from '@/utils'

const EXTEND = ['object', 'subject', 'biological_relationship', 'taxonomy']
const FOCAL_FAMILY = 'Syrphidae'

// Relationship → colour slot (1–3). Fixed by name so a colour never changes
// meaning between pages. Anything else is drawn as a neutral dashed line.
export const RELATIONSHIP_SLOTS = [
  { match: /flower/i, slot: 1 },
  { match: /phytophag|feeds on plant|herbivor/i, slot: 2 },
  { match: /^predator of|^preys on/i, slot: 3 }
]
export const slotOf = (label) => RELATIONSHIP_SLOTS.find((r) => r.match.test(label))?.slot || 0

// Italian names of the relationships used in SoI (TaxonWorks stores them in English)
export const RELATIONSHIP_IT = {
  'flower visitation': 'Visita fiori',
  'phytophagous on': 'Fitofago su',
  'predator of': 'Predatore di',
  'parasitoid of': 'Parassitoide di',
  'host of': 'Ospite di',
  'prey of': 'Preda di'
}
export const relationshipLabel = (label, italian = false) =>
  italian ? RELATIONSHIP_IT[String(label).toLowerCase()] || label : label

/** All associations for a query (handles pagination). */
export async function fetchAssociations(params = {}, { max = 3000 } = {}) {
  const out = []
  for (let page = 1; page <= 20; page++) {
    const { data, headers } = await makeAPIRequest.get('/biological_associations', {
      params: { ...params, extend: EXTEND, per: 500, page }
    })
    const rows = Array.isArray(data) ? data : []
    out.push(...rows)
    const total = Number(headers['pagination-total'])
    if (!rows.length || !total || out.length >= total || out.length >= max) break
  }
  return out
}

/**
 * Properties of each association (e.g. "Larva" on the hoverfly side), from the
 * /basic endpoint. → Map<associationId, { subject: string|null, object: string|null }>
 */
export async function fetchProperties(ids) {
  const out = new Map()
  const list = [...new Set(ids)]
  try {
    for (let i = 0; i < list.length; i += 100) {
      const params = new URLSearchParams({ per: '500' })
      list.slice(i, i + 100).forEach((id) => params.append('biological_association_id[]', id))
      ;['subject', 'object', 'biological_relationship_types'].forEach((e) => params.append('extend[]', e))
      const { data } = await makeAPIRequest.get(`/biological_associations/basic?${params}`)
      ;(data || []).forEach((b) => out.set(b.id, { subject: b.subject?.properties || null, object: b.object?.properties || null }))
    }
  } catch {
    /* properties are optional */
  }
  return out
}

/** Associations of several OTUs at once (batched; each OTU with its coordinate OTUs). */
export async function fetchAssociationsOf(otuIds) {
  const out = []
  const ids = [...new Set(otuIds)]
  for (let i = 0; i < ids.length; i += 40) {
    for (let page = 1; page <= 10; page++) {
      const params = new URLSearchParams({ 'otu_query[coordinatify]': 'true', per: '500', page: String(page) })
      ids.slice(i, i + 40).forEach((id) => params.append('otu_query[otu_id][]', id))
      EXTEND.forEach((e) => params.append('extend[]', e))
      const { data, headers } = await makeAPIRequest.get(`/biological_associations?${params}`)
      const rows = Array.isArray(data) ? data : []
      out.push(...rows)
      const total = Number(headers['pagination-total'])
      if (!rows.length || !total || rows.length < 500) break
    }
  }
  return out
}

/**
 * Adds the next step of the food web for a single taxon's page: what its partners
 * feed on or are attacked by (e.g. the aphids' host plants). Associations of the
 * partners with other hoverflies are left out, so the page stays about this taxon.
 */
export async function withPartnerAssociations(rows) {
  const partnerIds = new Set()
  rows.forEach((a) =>
    [a.subject, a.object].forEach((e) => {
      if (e?.base_class === 'Otu' && !isFocal(e)) partnerIds.add(e.id)
    })
  )
  if (!partnerIds.size) return rows
  const seen = new Set(rows.map((a) => a.id))
  try {
    const more = await fetchAssociationsOf([...partnerIds])
    const extra = more.filter((a) => !seen.has(a.id) && !isFocal(a.subject) && !isFocal(a.object) && seen.add(a.id))
    return [...rows, ...extra]
  } catch {
    return rows
  }
}

const taxonNameIdOf = (tag) => Number(String(tag || '').match(/otu_tag_taxon_name[^>]*?title="(\d+)"/)?.[1]) || null

/** Resolve OTU ids for non-OTU entities (specimens, anatomical parts) via their taxon name. */
export async function otuIdsForTaxonNames(ids) {
  if (!ids.length) return new Map()
  const params = new URLSearchParams()
  ids.forEach((id) => params.append('taxon_name_id[]', id))
  try {
    const { data } = await makeAPIRequest.get(`/otus?${params}`)
    return new Map(data.map((o) => [o.taxon_name_id, o.id]))
  } catch {
    return new Map()
  }
}

export function nameParts(entity) {
  const t = entity.taxonomy || {}
  const genus = t.genus?.[1]
  const species = t.species?.[1]
  const plain = genus && species ? `${genus} ${species}` : genus ? `${genus} sp.` : null
  if (plain) return { plain, html: genus && species ? `<i>${plain}</i>` : `<i>${genus}</i> sp.` }
  // Higher taxa or entities without taxonomy: name part of the tag, without author
  const tag = String(entity.object_tag || '')
  const italic = tag.match(/<i>[\s\S]*<\/i>/)?.[0]
  if (italic) return { plain: italic.replace(/<[^>]+>/g, ''), html: italic }
  const label = String(entity.object_label || '').replace(/^[^:]+:\s*/, '')
  return { plain: label, html: label.replace(/[<>&]/g, '') }
}

function makeNode(entity, otuByTaxonName) {
  const { plain, html } = nameParts(entity)
  const t = entity.taxonomy || {}
  const otuId = entity.base_class === 'Otu' ? entity.id : otuByTaxonName.get(taxonNameIdOf(entity.object_tag)) || null
  return {
    name: plain,
    key: plain.toLowerCase(),
    italic: html.startsWith('<i>'),
    family: t.family || t.order || null,
    subfamily: t.subfamily || null,
    otuId
  }
}

const isFocal = (entity) => entity?.taxonomy?.family === FOCAL_FAMILY

/**
 * associations → {
 *   columns: [{ level, nodes: Node[] }]            left (resources) → right (enemies)
 *   links:   [{ from, to, relationship, slot, count }]   node ids; from = consumer
 *   relationships: [{ label, slot, count }]
 * }
 * Node: { id, level, name, italic, family, otuId, count, group }   group = relationship that
 *       places the node in its column (used for the section headings)
 */
export async function buildGraph(associations, { focalOtuId = null } = {}) {
  const taxonNameIds = new Set()
  associations.forEach((a) =>
    [a.subject, a.object].forEach((e) => {
      if (e && e.base_class !== 'Otu') {
        const id = taxonNameIdOf(e.object_tag)
        if (id) taxonNameIds.add(id)
      }
    })
  )
  const otuByTaxonName = await otuIdsForTaxonNames([...taxonNameIds])

  const edges = associations
    .filter((a) => a.subject && a.object)
    .map((a) => ({
      id: a.id,
      consumer: makeNode(a.subject, otuByTaxonName),
      resource: makeNode(a.object, otuByTaxonName),
      consumerIsFocal: isFocal(a.subject),
      resourceIsFocal: isFocal(a.object),
      consumerOtu: a.subject.base_class === 'Otu' ? a.subject.id : null,
      resourceOtu: a.object.base_class === 'Otu' ? a.object.id : null,
      relationship: a.biological_relationship?.name || 'Associated with'
    }))

  // Seed level 0: hoverflies; otherwise the page's own taxon; otherwise the first subject
  const level = new Map() // name key → level
  edges.forEach((e) => {
    if (e.consumerIsFocal) level.set(e.consumer.key, 0)
    if (e.resourceIsFocal) level.set(e.resource.key, 0)
  })
  if (!level.size && edges.length) {
    const own = edges.find((e) => e.consumerOtu === focalOtuId) || edges.find((e) => e.resourceOtu === focalOtuId)
    level.set(own ? (own.consumerOtu === focalOtuId ? own.consumer.key : own.resource.key) : edges[0].consumer.key, 0)
  }

  // Walk outwards: resource = consumer − 1. A name keeps the level closest to 0.
  const placed = [] // { edge, cLevel, rLevel }
  const done = new Set()
  for (let pass = 0; pass < 6; pass++) {
    let changed = false
    for (const e of edges) {
      if (done.has(e.id)) continue
      const c = level.get(e.consumer.key)
      const r = level.get(e.resource.key)
      let cl, rl
      if (c !== undefined && c <= 0) [cl, rl] = [c, c - 1] // consumer is a hoverfly or one of its resources
      else if (r !== undefined && r >= 0) [cl, rl] = [r + 1, r] // resource is a hoverfly or one of its enemies
      else if (c !== undefined) [cl, rl] = [c, c - 1]
      else if (r !== undefined) [cl, rl] = [r + 1, r]
      else continue
      if (!level.has(e.consumer.key)) level.set(e.consumer.key, cl)
      if (!level.has(e.resource.key)) level.set(e.resource.key, rl)
      placed.push({ edge: e, cLevel: cl, rLevel: rl })
      done.add(e.id)
      changed = true
    }
    if (!changed) break
  }

  // Nodes per (level, name); links aggregated per pair + relationship
  const nodes = new Map()
  const links = new Map()
  const nodeFor = (n, lvl, group) => {
    const id = `${lvl}|${n.key}`
    if (!nodes.has(id)) nodes.set(id, { ...n, id, level: lvl, count: 0, groups: new Map() })
    const node = nodes.get(id)
    node.count++
    if (group) node.groups.set(group, (node.groups.get(group) || 0) + 1)
    return node
  }
  for (const { edge: e, cLevel, rLevel } of placed) {
    // The relationship that puts a node in its column: for resources the link to their consumer,
    // for enemies the link to their prey/host.
    const c = nodeFor(e.consumer, cLevel, cLevel > 0 ? e.relationship : null)
    const r = nodeFor(e.resource, rLevel, rLevel < 0 ? e.relationship : null)
    const lk = `${c.id}>${r.id}>${e.relationship}`
    if (!links.has(lk)) links.set(lk, { from: c.id, to: r.id, relationship: e.relationship, slot: slotOf(e.relationship), count: 0, ids: [] })
    links.get(lk).count++
    links.get(lk).ids.push(e.id)
  }

  // References and properties (life stage on each side) of each association
  const assocIds = placed.map((p) => p.edge.id)
  const [{ byAssociation, sources }, properties] = await Promise.all([fetchReferences(assocIds), fetchProperties(assocIds)])
  links.forEach((l) => {
    const stages = { from: new Set(), to: new Set() }
    l.ids.forEach((id) => {
      const p = properties.get(id)
      if (!p) return
      if (p.subject) stages.from.add(p.subject) // subject = consumer = link.from
      if (p.object) stages.to.add(p.object)
    })
    l.stages = { from: [...stages.from], to: [...stages.to] }
  })
  links.forEach((l) => {
    l.sources = [...new Set(l.ids.flatMap((id) => byAssociation.get(id) || []))]
  })
  sources.forEach((src) => {
    src.links = [...links.values()].filter((l) => l.sources.includes(src.id)).length
  })

  const relOrder = (r) => slotOf(r) || 9
  const columns = [...new Set([...nodes.values()].map((n) => n.level))]
    .sort((a, b) => a - b)
    .map((lvl) => ({
      level: lvl,
      nodes: [...nodes.values()]
        .filter((n) => n.level === lvl)
        .map((n) => ({
          ...n,
          group: [...n.groups.entries()].sort((a, b) => b[1] - a[1] || relOrder(a[0]) - relOrder(b[0]))[0]?.[0] || null
        }))
        .sort(
          (a, b) =>
            relOrder(a.group || '') - relOrder(b.group || '') ||
            (a.group || '').localeCompare(b.group || '') ||
            (a.family || '~').localeCompare(b.family || '~') ||
            a.name.localeCompare(b.name)
        )
    }))

  const relCounts = new Map()
  links.forEach((l) => relCounts.set(l.relationship, (relCounts.get(l.relationship) || 0) + l.count))

  return {
    columns,
    links: [...links.values()],
    relationships: [...relCounts.entries()]
      .map(([label, count]) => ({ label, count, slot: slotOf(label) }))
      .sort((a, b) => (a.slot || 9) - (b.slot || 9) || b.count - a.count),
    total: placed.length,
    sources
  }
}

/**
 * Citations of the associations, with their sources.
 * → { byAssociation: Map<associationId, sourceId[]>, sources: [{ id, n, short, html, url }] }
 *   sources are numbered 1…n in author/year order.
 */
export async function fetchReferences(associationIds) {
  const byAssociation = new Map()
  const pages = new Map() // `${associationId}|${sourceId}` → pages cited
  const ids = [...new Set(associationIds)]
  try {
    for (let i = 0; i < ids.length; i += 100) {
      const params = new URLSearchParams({ citation_object_type: 'BiologicalAssociation', per: 500 })
      ids.slice(i, i + 100).forEach((id) => params.append('citation_object_id[]', id))
      const { data } = await makeAPIRequest.get(`/citations?${params}`)
      ;(data || []).forEach((c) => {
        if (!byAssociation.has(c.citation_object_id)) byAssociation.set(c.citation_object_id, [])
        byAssociation.get(c.citation_object_id).push(c.source_id)
        if (c.pages) pages.set(`${c.citation_object_id}|${c.source_id}`, c.pages)
      })
    }
    const sourceIds = [...new Set([...byAssociation.values()].flat())]
    const sources = []
    for (let i = 0; i < sourceIds.length; i += 100) {
      const params = new URLSearchParams()
      sourceIds.slice(i, i + 100).forEach((id) => params.append('source_id[]', id))
      const { data } = await makeAPIRequest.get(`/sources?${params}`)
      sources.push(...(data || []))
    }
    const list = sources
      .map((s) => ({
        id: s.id,
        short: [s.cached_author_string, s.year].filter(Boolean).join(', ') || String(s.cached || '').replace(/<[^>]+>/g, '').slice(0, 40),
        html: String(s.cached || '').replace(/<(?!\/?i>)[^>]+>/g, ''), // keep only <i>
        url: s.doi ? `https://doi.org/${s.doi}` : String(s.cached || '').match(/https?:\/\/\S+[^\s.,;)]/)?.[0] || null,
        authors: s.cached_author_string || '',
        yearLabel: s.year || '',
        year: s.year || 9999
      }))
      .sort((a, b) => a.short.localeCompare(b.short) || a.year - b.year)
      .map((s, i) => ({ ...s, n: i + 1 }))
    return { byAssociation, sources: list, pages }
  } catch {
    return { byAssociation, sources: [], pages }
  }
}
