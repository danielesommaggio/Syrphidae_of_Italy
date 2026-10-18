// Data for the Bibliography page: every source in the SoI project, loaded once,
// plus helpers to clean the citations and export them (CSV, BibTeX, RIS).
import { makeAPIRequest } from '@/utils/request'

const PER = 1000

// Language names as written in the citations ("[in German]") → Italian
export const LANG_IT = {
  English: 'Inglese',
  German: 'Tedesco',
  French: 'Francese',
  Latin: 'Latino',
  Russian: 'Russo',
  Italian: 'Italiano',
  Spanish: 'Spagnolo',
  Swedish: 'Svedese',
  Dutch: 'Olandese',
  Danish: 'Danese',
  Norwegian: 'Norvegese',
  Finnish: 'Finlandese',
  Polish: 'Polacco',
  Czech: 'Ceco',
  Slovak: 'Slovacco',
  Hungarian: 'Ungherese',
  Japanese: 'Giapponese',
  Chinese: 'Cinese',
  Portuguese: 'Portoghese',
  Croatian: 'Croato',
  Slovenian: 'Sloveno',
  Serbian: 'Serbo',
  Greek: 'Greco',
  Turkish: 'Turco',
  Romanian: 'Rumeno',
  Bulgarian: 'Bulgaro',
  Ukrainian: 'Ucraino',
  Estonian: 'Estone',
  Latvian: 'Lettone',
  Lithuanian: 'Lituano',
  Icelandic: 'Islandese',
  Korean: 'Coreano',
  Persian: 'Persiano',
  Arabic: 'Arabo',
  Hebrew: 'Ebraico',
  Catalan: 'Catalano'
}

const ALLOWED = /^\/?(i|em|b|strong|sup|sub)$/i

/** Keep only harmless formatting tags in a TaxonWorks citation. */
export function safeHtml(s) {
  return String(s || '')
    .replace(/<\s*(\/?)\s*([a-z0-9]+)[^>]*>/gi, (m, slash, tag) => (ALLOWED.test(slash + tag) ? `<${slash}${tag.toLowerCase()}>` : ''))
    .replace(/\s*\[in [^\]]+\]\s*$/i, '')
    .trim()
}

const decode = (s) =>
  String(s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const plain = (s) => decode(s).replace(/\s*\[in [^\]]+\]\s*$/i, '')

const fold = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

export function toEntry(s) {
  const cached = s.cached || s.object_label || ''
  const language = cached.match(/\[in ([^\]]+)\]\s*$/i)?.[1]?.trim() || ''
  const year = Number(s.year) || null
  const url = s.url || ''
  const doi = String(s.doi || '')
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim()
  const authorKey = fold(s.cached_author_string || decode(cached)).replace(/^[^a-z]+/, '')
  const kind = s.bibtex_type === 'article' ? 'article' : s.bibtex_type === 'inbook' || s.bibtex_type === 'incollection' ? 'chapter' : 'book'
  return {
    id: s.id,
    html: safeHtml(cached),
    text: plain(cached),
    search: fold(`${decode(cached)} ${doi}`),
    year,
    decade: year ? Math.floor(year / 10) * 10 : null,
    letter: (authorKey[0] || '#').toUpperCase(),
    authorKey,
    authors: s.cached_author_string || '',
    language,
    kind,
    doi,
    url,
    bhl: /biodiversitylibrary\.org|biostor\.org/i.test(url),
    raw: s
  }
}

export async function fetchSources() {
  const out = []
  for (let page = 1; page < 20; page++) {
    const { data } = await makeAPIRequest.get('/sources', { params: { in_project: true, per: PER, page } })
    const rows = Array.isArray(data) ? data : []
    out.push(...rows)
    if (rows.length < PER) break
  }
  return out.map(toEntry)
}

/**
 * Taxon names cited in one source → [{ id, name, author, rank, valid, original, otuId }]
 * plus a count of the other things the source is cited for.
 */
export async function fetchCitedNames(sourceId) {
  const { data } = await makeAPIRequest.get('/citations', { params: { source_id: sourceId, per: 1000 } })
  const cits = Array.isArray(data) ? data : []
  const nameCits = cits.filter((c) => c.citation_object_type === 'TaxonName')
  const ids = [...new Set(nameCits.map((c) => c.citation_object_id))]
  const original = new Set(nameCits.filter((c) => c.is_original).map((c) => c.citation_object_id))
  const other = {}
  cits
    .filter((c) => c.citation_object_type !== 'TaxonName')
    .forEach((c) => (other[c.citation_object_type] = (other[c.citation_object_type] || 0) + 1))

  const names = []
  const otus = new Map()
  for (let i = 0; i < ids.length; i += 50) {
    const p = new URLSearchParams({ per: '100' })
    ids.slice(i, i + 50).forEach((id) => p.append('taxon_name_id[]', id))
    const [tn, ot] = await Promise.all([
      makeAPIRequest.get(`/taxon_names?${p}`).then((r) => r.data || []),
      makeAPIRequest.get(`/otus?${p}`).then((r) => r.data || []).catch(() => [])
    ])
    ot.forEach((o) => !otus.has(o.taxon_name_id) && otus.set(o.taxon_name_id, o.id))
    names.push(...tn)
  }
  const RANK_ORDER = ['Family', 'Subfamily', 'Tribe', 'Subtribe', 'Genus', 'Subgenus', 'Species', 'Subspecies']
  const rankIdx = (r) => (RANK_ORDER.includes(r) ? RANK_ORDER.indexOf(r) : 99)
  const list = names
    .filter((t) => t.rank_string || t.cached)
    .map((t) => {
      const rank = String(t.rank_string || '').split('::').pop() || ''
      return {
        id: t.id,
        name: t.cached || t.name,
        author: t.cached_author_year || '',
        rank,
        italic: ['Genus', 'Subgenus', 'Species', 'Subspecies'].includes(rank),
        valid: t.cached_is_valid !== false,
        original: original.has(t.id),
        otuId: otus.get(t.id) || otus.get(t.cached_valid_taxon_name_id) || null
      }
    })
    .filter((t) => !['Kingdom', 'Phylum', 'Class', 'Order'].includes(t.rank))
    .sort((a, b) => b.original - a.original || rankIdx(a.rank) - rankIdx(b.rank) || a.name.localeCompare(b.name))
  return { names: list, other }
}

// ---------- exports ----------

function save(text, name, type) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

const stamp = () => new Date().toISOString().slice(0, 10)

export function exportCsv(entries) {
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = [
    ['id', 'citation', 'authors', 'year', 'title', 'journal', 'volume', 'issue', 'pages', 'publisher', 'language', 'doi', 'url'],
    ...entries.map((e) => [
      e.id,
      e.text,
      decode(e.raw.author),
      e.year ?? '',
      decode(e.raw.title),
      decode(e.raw.journal),
      e.raw.volume,
      e.raw.number,
      e.raw.pages,
      decode(e.raw.publisher),
      e.language,
      e.doi,
      e.url
    ])
  ]
  save('﻿' + rows.map((r) => r.map(cell).join(',')).join('\r\n'), `SoI_bibliography_${stamp()}.csv`, 'text/csv;charset=utf-8')
}

function bibKey(e, used) {
  const first = fold(e.authors.split(/[ ,&]/)[0] || 'anon').replace(/[^a-z]/g, '') || 'anon'
  let k = `${first}${e.year || 'nd'}`
  let n = 0
  while (used.has(k)) k = `${first}${e.year || 'nd'}${String.fromCharCode(97 + n++)}`
  used.add(k)
  return k
}

export function exportBibtex(entries) {
  const used = new Set()
  const esc = (s) => decode(s).replace(/[{}]/g, '')
  const out = entries.map((e) => {
    const r = e.raw
    const type = ['article', 'book', 'inbook', 'incollection', 'booklet', 'phdthesis', 'misc'].includes(r.bibtex_type) ? r.bibtex_type : 'misc'
    const f = {
      author: r.author,
      title: r.title,
      journal: r.journal,
      booktitle: r.booktitle,
      year: e.year,
      volume: r.volume,
      number: r.number,
      pages: r.pages && String(r.pages).replace(/[-–]/, '--'),
      publisher: r.publisher,
      address: r.address,
      doi: e.doi,
      url: e.url,
      language: e.language
    }
    const body = Object.entries(f)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `  ${k} = {${esc(v)}}`)
      .join(',\n')
    return `@${type}{${bibKey(e, used)},\n${body || `  note = {${esc(e.text)}}`}\n}`
  })
  save(out.join('\n\n') + '\n', `SoI_bibliography_${stamp()}.bib`, 'application/x-bibtex;charset=utf-8')
}

export function exportRis(entries) {
  const lines = []
  entries.forEach((e) => {
    const r = e.raw
    const ty = { article: 'JOUR', chapter: 'CHAP', book: 'BOOK' }[e.kind] || 'GEN'
    lines.push(`TY  - ${ty}`)
    const authors = decode(r.author).split(/\s+and\s+/).filter(Boolean)
    if (authors.length) authors.forEach((a) => lines.push(`AU  - ${a}`))
    else if (e.authors) lines.push(`AU  - ${e.authors}`)
    if (r.title) lines.push(`TI  - ${decode(r.title)}`)
    else lines.push(`TI  - ${e.text}`)
    if (r.journal) lines.push(`JO  - ${decode(r.journal)}`)
    if (r.booktitle) lines.push(`T2  - ${decode(r.booktitle)}`)
    if (e.year) lines.push(`PY  - ${e.year}`)
    if (r.volume) lines.push(`VL  - ${r.volume}`)
    if (r.number) lines.push(`IS  - ${r.number}`)
    const [sp, ep] = String(r.pages || '').split(/[-–]+/)
    if (sp) lines.push(`SP  - ${sp.trim()}`)
    if (ep) lines.push(`EP  - ${ep.trim()}`)
    if (r.publisher) lines.push(`PB  - ${decode(r.publisher)}`)
    if (e.language) lines.push(`LA  - ${e.language}`)
    if (e.doi) lines.push(`DO  - ${e.doi}`)
    if (e.url) lines.push(`UR  - ${e.url}`)
    lines.push('ER  - ', '')
  })
  save(lines.join('\r\n'), `SoI_bibliography_${stamp()}.ris`, 'application/x-research-info-systems;charset=utf-8')
}
