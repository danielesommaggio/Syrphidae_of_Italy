// Pure helpers for the extras around a key: the list of taxa reached (with the couplets
// where they come out), the version stamp, the taxa not yet reached, the feedback e-mail,
// the species → keys index of the Keys page, and the QR code. No Vue, no network.
import qrcode from './vendor/qrcode.js'

const plain = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

// Every taxon the key leads to, alphabetical, with the couplet number(s) it comes out at.
// nodes: buildNodes() output. → [{ otuId, label, couplets: ['5', '12'] }]
export function taxaReached(nodes) {
  const byOtu = new Map()
  for (const n of Object.values(nodes || {})) {
    if (n.isCouplet || n.targetType !== '/api/v1/otus' || n.targetId == null) continue
    const parent = nodes[n.parentId]
    const at = parent?.coupletNumber != null ? String(parent.coupletNumber) : null
    if (!byOtu.has(n.targetId)) byOtu.set(n.targetId, { otuId: n.targetId, label: plain(n.targetLabel), couplets: [] })
    const t = byOtu.get(n.targetId)
    if (at && !t.couplets.includes(at)) t.couplets.push(at)
  }
  const num = (x) => (/^\d+$/.test(x) ? Number(x) : Infinity)
  return [...byOtu.values()]
    .map((t) => ({ ...t, couplets: t.couplets.sort((a, b) => num(a) - num(b) || a.localeCompare(b)) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

// "Version of 2026-09-15 · 26 couplets · 14 taxa"
export function versionStamp({ updatedAt = '', couplets = 0, taxa = 0, lang = 'en' } = {}) {
  const day = updatedAt ? String(updatedAt).slice(0, 10) : ''
  const it = lang === 'it'
  return [
    day ? `${it ? 'Versione del' : 'Version of'} ${day}` : '',
    couplets ? `${couplets} ${it ? 'coppie' : 'couplets'}` : '',
    taxa ? `${taxa} ${it ? 'taxa' : 'taxa'}` : ''
  ].filter(Boolean).join(' · ')
}

// Valid taxa in the key's scope (at the key's rank) that the key does not reach yet.
// report: buildCompletenessReport() output. → [{ name, authorYear, otuId }]
export function notReached(report) {
  if (!report) return []
  const members = [...(report.groups || []).flatMap((g) => g.members), ...(report.ungrouped || [])]
  return members
    .filter((m) => m.status === 'missing')
    .map((m) => ({ name: plain(m.taxon.name), authorYear: plain(m.taxon.authorYear), otuId: m.taxon.otuId ?? null }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// mailto: link to report a problem with one couplet (or with the key)
export function feedbackMailto({ to = '', keyTitle = '', couplet = '', url = '', lang = 'en' }) {
  const it = lang === 'it'
  const what = couplet ? `${it ? 'coppia' : 'couplet'} ${couplet}` : (it ? 'chiave' : 'key')
  const subject = `[SoI] ${plain(keyTitle)} — ${what}`
  const body = it
    ? `Chiave: ${plain(keyTitle)}\nCoppia: ${couplet || '—'}\nLink: ${url}\n\nIl problema (cosa non è chiaro, che specie avevi, foto se possibile):\n\n`
    : `Key: ${plain(keyTitle)}\nCouplet: ${couplet || '—'}\nLink: ${url}\n\nThe problem (what is unclear, which species you had, photos if possible):\n\n`
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// Keys page: every taxon reached by the keys, with the keys that reach it.
// keys: [{ id, title, taxa: [{ otuId, label }] }] → [{ otuId, label, keys: [{ id, title }] }]
export function speciesIndex(keys) {
  const byOtu = new Map()
  for (const k of keys || []) {
    for (const t of k.taxa || []) {
      if (!byOtu.has(t.otuId)) byOtu.set(t.otuId, { otuId: t.otuId, label: plain(t.label), keys: [] })
      const e = byOtu.get(t.otuId)
      if (!e.keys.some((x) => x.id === k.id)) e.keys.push({ id: k.id, title: plain(k.title) })
    }
  }
  return [...byOtu.values()].sort((a, b) => a.label.localeCompare(b.label))
}

// QR code of a URL as an SVG string (black on white, `size` px square)
export function qrSvg(text, size = 96) {
  const q = qrcode(0, 'M')
  q.addData(String(text))
  q.make()
  const n = q.getModuleCount()
  const cell = size / (n + 2)
  let path = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (q.isDark(r, c)) path += `M${((c + 1) * cell).toFixed(2)} ${((r + 1) * cell).toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR code"><rect width="${size}" height="${size}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`
}
