// node panels/PanelBiology/traits.test.mjs
import assert from 'node:assert/strict'
import { flowerGroups, habitatGroups, habitatType, larvalLayers, parseMonths, splitList, toNumber, traitsOf, voltinism, migratory, overwintering, trophism } from './traits.js'

const months = (t) => parseMonths(t).map((v, i) => (v ? i + 1 : 0)).filter(Boolean)
assert.deepEqual(months('March to June'), [3, 4, 5, 6])
assert.deepEqual(months('May-June'), [5, 6])
assert.deepEqual(months('April, May, June, July, August, September'), [4, 5, 6, 7, 8, 9])
assert.deepEqual(months('May; June; July, August'), [5, 6, 7, 8])
assert.deepEqual(months('iv–vi'), [4, 5, 6])
assert.deepEqual(months('November to February'), [1, 2, 11, 12])
assert.deepEqual(months('da Maggio a Luglio'), [5, 6, 7])
assert.deepEqual(months(''), [])

assert.deepEqual(splitList('Canopy; on tall strong herbs'), ['Canopy', 'On tall strong herbs'])
assert.deepEqual(splitList('Foliage, Understorey Trees, Schrubs'), ['Foliage', 'Understorey Trees', 'Shrubs'])
assert.deepEqual(splitList('Apiaceae (Heracleum, Daucus), Asteraceae (Taraxacum)'), ['Apiaceae (Heracleum, Daucus)', 'Asteraceae (Taraxacum)'])
assert.deepEqual(splitList('Unknown'), [])

assert.equal(toNumber('08'), 8)
assert.equal(toNumber('9.5'), 9.5)
assert.equal(toNumber('Unknown'), null)

assert.deepEqual(voltinism('Bivolrine; Polyvoltine'), ['bi', 'poly'])
assert.deepEqual(voltinism('Univoltin'), ['uni'])
assert.equal(migratory('Strongly Migrant'), 'strong')
assert.equal(migratory('Non Migratory'), 'no')
assert.equal(migratory('No'), 'no')
assert.equal(migratory('Weakly Migratory'), 'weak')
assert.equal(migratory('Migratory'), 'yes')
assert.deepEqual(overwintering('Larvae'), ['larva'])
assert.deepEqual(overwintering('Puparium'), ['pupa'])
assert.deepEqual(overwintering('Larva; Adult'), ['larva', 'adult'])
assert.deepEqual(trophism('Zoophagous (Aphids)'), [{ key: 'zoophagous', label: 'Zoophagous', detail: 'aphids' }])
assert.equal(trophism('Zoophagus')[0].label, 'Zoophagous')

const t = traitsOf([
  { topic_id: 6424, text: '12' },
  { topic_id: 6423, text: '08' },
  { topic_id: 6434, text: '00' },
  { topic_id: 6435, text: '800' },
  { topic_id: 6432, text: 'Unknown' }
])
assert.deepEqual(t.length, { min: 8, max: 12 })
assert.deepEqual(t.altitude, { min: 0, max: 800 })
assert.equal(t.mouthparts, null)
assert.deepEqual(t.habitat, [])
const fg = flowerGroups(
  ['Apiaceae (Daucus, Heracleum)', 'Plantaginacee (Veronica)', 'Caltha', 'White umbellifers', 'Boraginaceae (Ancuhusa, Phacelia)'],
  [{ family: 'Ranunculaceae', genus: 'Caltha' }, { family: 'Apiaceae', genus: 'Daucus' }, { family: 'Rosaceae', genus: 'Rubus' }],
  'Other'
)
assert.deepEqual(fg.map((f) => f.family), ['Apiaceae', 'Boraginaceae', 'Plantaginaceae', 'Ranunculaceae', 'Rosaceae', 'Other'])
assert.deepEqual(fg[0].genera, [{ name: 'Daucus', isGenus: true, lit: true, soi: true }, { name: 'Heracleum', isGenus: true, lit: true, soi: false }])
assert.deepEqual(fg[1].genera.map((g) => g.name), ['Anchusa', 'Phacelia'])
assert.deepEqual(fg[3].genera, [{ name: 'Caltha', isGenus: true, lit: true, soi: true }])
assert.deepEqual(fg[5].genera, [{ name: 'White umbellifers', isGenus: false, lit: true, soi: false }])
assert.equal(splitList('Guarrigue; Sal Marsh; Filed Margin; Heavely Lowland Improved Grassland').join(' | '), 'Garrigue | Salt Marsh | Field Margin | Heavily Lowland Improved Grassland')
const H = {
  'Thermophilous Quercus Woods': 'woodland', 'Mediterranean Riparian Fraxinus': 'woodland', 'Salix swamp': 'wetland', 'Alnus glutinosa': 'woodland',
  'Scattered trees in open ground': 'woodland', 'Western karstic Quercus pubescens savanna': 'woodland', 'Salix alba/Populus gallery': 'woodland',
  'Maquis': 'scrub', 'Garrigue': 'scrub', 'Heath': 'scrub', 'Mediterranean Shrub Formations': 'scrub', 'Pinus Shrubs': 'scrub', 'Matorral': 'scrub',
  'Humid Grassland': 'grassland', 'Hay': 'grassland', 'Steppic Grasslands': 'grassland', 'Flower Meadow': 'grassland',
  'Lagoon': 'wetland', 'Salt Marsh': 'wetland', 'Ammophila Dunes': 'wetland', 'Coastal Beach': 'wetland', 'Grey Dunes': 'wetland',
  'Cereal Fields': 'farmland', 'Orchard': 'farmland', 'Vineyards': 'farmland', 'Field Margin': 'farmland', 'Urban Park': 'farmland',
  'Flower Bed': 'farmland', 'Garden Ornamental': 'farmland', 'Fallow': 'farmland', 'Conifer plantations': 'farmland'
}
for (const [n, ty] of Object.entries(H)) assert.equal(habitatType(n), ty, n)
assert.deepEqual(habitatGroups(['Maquis', 'Hay', 'Quercus ilex Woods']).map((g) => g.type), ['woodland', 'scrub', 'grassland'])
const L = (items) => { const r = larvalLayers(items); return [[...r.layers].sort().join(','), r.foliage, r.other.join('|')] }
assert.deepEqual(L(['Canopy', 'On tall strong herbs']), ['canopy,tallHerbs', false, ''])
assert.deepEqual(L(['Foliage']), ['', true, ''])
assert.deepEqual(L(['Foliage', 'Understorey Trees', 'Shrubs', 'Tall Strong Herbs', 'Low-growing Plants']), ['lowPlants,shrubs,tallHerbs,understorey', true, ''])
assert.deepEqual(L(['Tree foliage', 'Shrubs']), ['canopy,shrubs,understorey', true, ''])
assert.deepEqual(L(['Low shrubs', 'Tall Strong Herbs', 'Low Growing Plants']), ['lowPlants,shrubs,tallHerbs', false, ''])
assert.deepEqual(L(['Foliage trees', 'Foliage mature trees', 'Foliage understorey trees']), ['canopy,understorey', true, ''])
assert.deepEqual(L(['Shrub Foliage', 'Tall Strong Herbs']), ['shrubs,tallHerbs', true, ''])
assert.deepEqual(L(['Rot-holes', 'Submerged sediment', 'Ant nests', 'Something odd']), ['deadwood,nests,water', false, 'Something odd'])
console.log('traits: all tests passed')
