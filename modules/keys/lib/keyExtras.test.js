// node modules/keys/lib/keyExtras.test.js
import assert from 'node:assert/strict'
import { taxaReached, versionStamp, notReached, feedbackMailto, speciesIndex, qrSvg } from './keyExtras.js'

const nodes = {
  1: { id: 1, parentId: null, isCouplet: true, coupletNumber: 1 },
  2: { id: 2, parentId: 1, isCouplet: true, coupletNumber: 2 },
  3: { id: 3, parentId: 1, isCouplet: false, targetType: '/api/v1/otus', targetId: 30, targetLabel: '<i>Eupeodes corollae</i> (Fabricius, 1794)' },
  4: { id: 4, parentId: 2, isCouplet: false, targetType: '/api/v1/otus', targetId: 40, targetLabel: 'Eupeodes bucculatus' },
  5: { id: 5, parentId: 2, isCouplet: false, targetType: '/api/v1/otus', targetId: 30, targetLabel: 'Eupeodes corollae' }
}
assert.deepEqual(taxaReached(nodes), [
  { otuId: 40, label: 'Eupeodes bucculatus', couplets: ['2'] },
  { otuId: 30, label: 'Eupeodes corollae (Fabricius, 1794)', couplets: ['1', '2'] }
])
assert.equal(versionStamp({ updatedAt: '2026-09-15T10:00:00Z', couplets: 26, taxa: 14 }), 'Version of 2026-09-15 · 26 couplets · 14 taxa')
assert.equal(versionStamp({ couplets: 3, lang: 'it' }), '3 coppie')
const report = {
  groups: [{ members: [{ status: 'missing', taxon: { name: 'Eupeodes nitens', authorYear: '(Zetterstedt, 1843)', otuId: 7 } }, { status: 'included', taxon: { name: 'E. a' } }] }],
  ungrouped: [{ status: 'missing', taxon: { name: 'Eupeodes abiskoensis', otuId: null } }]
}
assert.deepEqual(notReached(report).map((x) => x.name), ['Eupeodes abiskoensis', 'Eupeodes nitens'])
assert.deepEqual(notReached(null), [])
const m = feedbackMailto({ to: 'a@b.it', keyTitle: '<i>Eupeodes</i> (EN)', couplet: '5', url: 'https://x/#/key/1/5' })
assert.ok(m.startsWith('mailto:a@b.it?subject='))
assert.ok(decodeURIComponent(m).includes('[SoI] Eupeodes (EN) — couplet 5'))
assert.deepEqual(speciesIndex([
  { id: 1, title: 'Eupeodes (EN)', taxa: [{ otuId: 30, label: 'Eupeodes corollae' }] },
  { id: 2, title: 'Eupeodes (IT)', taxa: [{ otuId: 30, label: 'Eupeodes corollae' }, { otuId: 9, label: 'Dasysyrphus albostriatus' }] }
]), [
  { otuId: 9, label: 'Dasysyrphus albostriatus', keys: [{ id: 2, title: 'Eupeodes (IT)' }] },
  { otuId: 30, label: 'Eupeodes corollae', keys: [{ id: 1, title: 'Eupeodes (EN)' }, { id: 2, title: 'Eupeodes (IT)' }] }
])
const svg = qrSvg('https://syrphidaeitaly.com/#/key/1?format=full', 90)
assert.ok(svg.startsWith('<svg') && svg.includes('<path d="M'))
console.log('keyExtras: all tests passed')
