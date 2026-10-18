<template>
  <section>
    <h3 class="bio-h">{{ t('title') }}</h3>
    <p
      v-if="sentence"
      class="lh-sentence"
    >
      {{ sentence }}
    </p>

    <!-- Height scale: vegetation layers from the canopy down to the ground -->
    <div
      v-if="hasLayers"
      class="lh-chart"
      role="group"
      :aria-label="t('axis')"
    >
      <p class="lh-axis-title">{{ t('axis') }}</p>
      <div
        v-for="r in rows"
        :key="r.key"
        class="lh-row"
        :class="{ ground: r.key === 'ground' }"
      >
        <span class="lh-tick">{{ r.key === 'ground' ? '0 m' : fmtM(r.top) }}</span>
        <button
          type="button"
          class="lh-band"
          :class="{ on: r.on, first: r.first, last: r.last, hot: hover === r.key || picked === r.key }"
          :disabled="!r.on"
          :aria-pressed="picked === r.key"
          :aria-label="`${t('L_' + r.key)}, ${heightOf(r.key)}: ${r.on ? t('larvaeHere') : t('notHere')}`"
          @mouseenter="hover = r.key"
          @mouseleave="hover = ''"
          @focus="hover = r.key"
          @blur="hover = ''"
          @click="pick(r.key)"
        >
          <span
            v-if="hover === r.key"
            class="lh-tip"
            role="tooltip"
            ><strong>{{ t('L_' + r.key) }}</strong> · {{ heightOf(r.key) }} · {{ r.on ? t('larvaeHere') : t('notHere') }}</span
          >
        </button>
        <span
          class="lh-label"
          :class="{ on: r.on }"
          >{{ t('L_' + r.key) }}</span
        >
      </div>

      <!-- places that are not a height: dead wood, water, nests -->
      <div
        v-if="specials.length"
        class="lh-specials"
      >
        <button
          v-for="k in specials"
          :key="k"
          type="button"
          class="lh-chip"
          :class="{ hot: picked === k }"
          :aria-pressed="picked === k"
          @click="pick(k)"
        >
          {{ t('L_' + k) }}
        </button>
      </div>
      <p class="lh-note">{{ t('notToScale') }}</p>
    </div>

    <!-- Other species with larvae in the chosen layer -->
    <div
      v-if="picked"
      class="lh-who"
      role="region"
      :aria-label="t('who', { l: t('L_' + picked).toLowerCase() })"
    >
      <p class="font-semibold">{{ t('who', { l: t('L_' + picked).toLowerCase() }) }}</p>
      <p
        v-if="sharing.loading"
        class="bio-muted text-sm mt-1"
      >
        {{ t('loading') }}
      </p>
      <p
        v-else-if="!sharing.list.length"
        class="bio-muted text-sm mt-1"
      >
        {{ t('onlyThis') }}
      </p>
      <ul
        v-else
        class="lh-visitors"
      >
        <li
          v-for="v in sharing.list"
          :key="v.id"
        >
          <RouterLink
            :to="{ name: 'otus-id-biology', params: { id: v.id } }"
            v-html="v.html"
          />
        </li>
      </ul>
    </div>

    <p
      v-if="parsed.other.length"
      class="text-sm mt-2"
    >
      {{ parsed.other.join('; ') }}
    </p>
    <p
      v-if="hasLayers"
      class="bio-legend"
    >
      <span class="lh-key" /> {{ t('legend') }}
    </p>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { makeAPIRequest } from '@/utils'
import { useT } from '@/utils/soiLang.js'
import { LARVAL_LAYERS, LARVAL_SPECIAL, TOPIC, larvalLayers, splitList } from '../traits.js'

const props = defineProps({
  otuId: { type: Number, required: true },
  // microhabitat entries, already split and cleaned (traits.microhabitat)
  items: { type: Array, default: () => [] }
})

const t = useT({
  en: {
    title: 'Where larvae live',
    L_canopy: 'Tree canopy',
    L_understorey: 'Understorey trees',
    L_shrubs: 'Shrubs',
    L_tallHerbs: 'Tall herbs',
    L_lowPlants: 'Low-growing plants',
    L_ground: 'Ground and litter',
    L_deadwood: 'Dead wood',
    L_water: 'Water',
    L_nests: 'Nests of ants or other insects',
    S_canopy: 'Canopy',
    S_understorey: 'Understorey',
    S_shrubs: 'Shrubs',
    S_tallHerbs: 'Tall herbs',
    S_lowPlants: 'Low plants',
    S_ground: 'Ground',
    S_deadwood: 'Dead wood',
    S_water: 'Water',
    S_nests: 'Nests',
    s_canopy: 'the tree canopy',
    s_understorey: 'understorey trees',
    s_shrubs: 'shrubs',
    s_tallHerbs: 'tall herbs',
    s_lowPlants: 'low-growing plants',
    s_ground: 'the ground and litter',
    s_deadwood: 'dead wood',
    s_water: 'water',
    s_nests: 'nests of ants or other insects',
    f_canopy: 'the tree canopy',
    t_canopy: 'the tree canopy',
    f_understorey: 'understorey trees',
    t_understorey: 'understorey trees',
    f_shrubs: 'shrubs',
    t_shrubs: 'shrubs',
    f_tallHerbs: 'tall herbs',
    t_tallHerbs: 'tall herbs',
    f_lowPlants: 'low-growing plants',
    t_lowPlants: 'low-growing plants',
    f_ground: 'the ground and litter',
    t_ground: 'the ground and litter',
    onFoliage: 'Larvae live on foliage',
    live: 'Larvae live',
    range: 'from {a} down to {b}',
    on: 'on {x}',
    and: 'and',
    in: 'in {x}',
    larvaeHere: 'larvae live here — click for other species',
    notHere: 'no larvae recorded here',
    typically: 'typically {r}',
    atGround: 'at ground level',
    dec: '.',
    axis: 'Height above ground',
    notToScale: 'Typical heights of each layer; the scale is stretched near the ground.',
    who: 'Other hoverflies with larvae in {l}',
    loading: 'Looking for other species…',
    onlyThis: 'No other hoverfly in SoI has larvae recorded here yet.',
    legend: 'where the larvae live. Click a yellow layer for the other hoverflies whose larvae live there.'
  },
  it: {
    title: 'Dove vivono le larve',
    L_canopy: 'Chioma degli alberi',
    L_understorey: 'Alberi del sottobosco',
    L_shrubs: 'Arbusti',
    L_tallHerbs: 'Erbe alte',
    L_lowPlants: 'Piante basse',
    L_ground: 'Suolo e lettiera',
    L_deadwood: 'Legno morto',
    L_water: 'Acqua',
    L_nests: 'Nidi di formiche o altri insetti',
    S_canopy: 'Chioma',
    S_understorey: 'Sottobosco',
    S_shrubs: 'Arbusti',
    S_tallHerbs: 'Erbe alte',
    S_lowPlants: 'Piante basse',
    S_ground: 'Suolo',
    S_deadwood: 'Legno morto',
    S_water: 'Acqua',
    S_nests: 'Nidi',
    s_canopy: 'la chioma degli alberi',
    s_understorey: 'gli alberi del sottobosco',
    s_shrubs: 'gli arbusti',
    s_tallHerbs: 'le erbe alte',
    s_lowPlants: 'le piante basse',
    s_ground: 'il suolo e la lettiera',
    s_deadwood: 'legno morto',
    s_water: 'acqua',
    s_nests: 'nidi di formiche o altri insetti',
    f_canopy: 'dalla chioma degli alberi',
    t_canopy: 'alla chioma degli alberi',
    f_understorey: 'dagli alberi del sottobosco',
    t_understorey: 'agli alberi del sottobosco',
    f_shrubs: 'dagli arbusti',
    t_shrubs: 'agli arbusti',
    f_tallHerbs: 'dalle erbe alte',
    t_tallHerbs: 'alle erbe alte',
    f_lowPlants: 'dalle piante basse',
    t_lowPlants: 'alle piante basse',
    f_ground: 'dal suolo e dalla lettiera',
    t_ground: 'al suolo e alla lettiera',
    onFoliage: 'Le larve vivono sul fogliame',
    live: 'Le larve vivono',
    range: '{a} fino {b}',
    on: 'su {x}',
    and: 'e',
    in: 'in {x}',
    larvaeHere: 'qui vivono le larve — clicca per le altre specie',
    notHere: 'nessuna larva registrata qui',
    typically: 'di solito {r}',
    atGround: 'al livello del suolo',
    dec: ',',
    axis: 'Altezza dal suolo',
    notToScale: 'Altezze tipiche di ogni strato; la scala è dilatata vicino al suolo.',
    who: 'Altri sirfidi con larve qui: {l}',
    loading: 'Cerco altre specie…',
    onlyThis: 'Nessun altro sirfide in SoI ha ancora larve registrate qui.',
    legend: 'dove vivono le larve. Clicca uno strato giallo per gli altri sirfidi le cui larve vivono lì.'
  }
})

const parsed = computed(() => larvalLayers(props.items))
const hasLayers = computed(() => parsed.value.layers.size > 0)

// ---------- height scale ----------
// typical height of each layer, in metres (the scale is stretched near the ground so
// that low layers stay visible: every layer gets the same height on screen)
const HEIGHTS = {
  canopy: [12, 25],
  understorey: [5, 12],
  shrubs: [1.5, 5],
  tallHerbs: [0.3, 1.5],
  lowPlants: [0, 0.3],
  ground: [0, 0]
}
const TOP_DOWN = ['canopy', 'understorey', 'shrubs', 'tallHerbs', 'lowPlants', 'ground']
const rows = computed(() =>
  TOP_DOWN.map((key, i) => {
    const on = parsed.value.layers.has(key)
    const prevOn = i > 0 && parsed.value.layers.has(TOP_DOWN[i - 1])
    const nextOn = i < TOP_DOWN.length - 1 && parsed.value.layers.has(TOP_DOWN[i + 1])
    return { key, on, first: on && !prevOn, last: on && !nextOn, top: HEIGHTS[key][1] }
  })
)
const specials = computed(() => LARVAL_SPECIAL.filter((k) => parsed.value.layers.has(k)))
const fmtM = (m) => `${String(m).replace('.', t('dec'))} m`
function heightOf(key) {
  const [lo, hi] = HEIGHTS[key]
  if (key === 'ground') return t('atGround')
  return t('typically', { r: `${fmtM(lo)}–${fmtM(hi)}`.replace(' m–', '–') })
}

const hover = ref('')

// "Larvae live on foliage, from understorey trees down to low-growing plants."
const sentence = computed(() => {
  const { layers, foliage } = parsed.value
  const veg = LARVAL_LAYERS.filter((l) => layers.has(l))
  const special = LARVAL_SPECIAL.filter((l) => layers.has(l))
  const parts = []
  if (veg.length) {
    const idx = veg.map((l) => LARVAL_LAYERS.indexOf(l))
    const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1)
    if (veg.length === 1) parts.push(t('on', { x: t('s_' + veg[0]) }))
    else if (contiguous) parts.push(t('range', { a: t('f_' + veg[0]), b: t('t_' + veg[veg.length - 1]) }))
    else parts.push(t('on', { x: joinAnd(veg.map((l) => t('s_' + l))) }))
  }
  if (special.length) parts.push(t('in', { x: joinAnd(special.map((l) => t('s_' + l))) }))
  if (!parts.length) return foliage ? `${t('onFoliage')}.` : ''
  return `${foliage ? t('onFoliage') + ',' : t('live')} ${parts.join(` ${t('and')} `)}.`
})
function joinAnd(list) {
  return list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} ${t('and')} ${list[list.length - 1]}`
}

// ---------- other species with larvae in a layer (loaded on the first click) ----------
const picked = ref('')
const sharing = reactive({ loading: false, list: [] })
let project = null

function loadProject() {
  project ||= makeAPIRequest
    .get('/contents', { params: { topic_id: [TOPIC.microhabitat], per: 1000 } })
    .then(async ({ data }) => {
      const rows = (data || []).map((c) => ({ otu: c.otu_id, layers: larvalLayers(splitList(c.text)).layers }))
      const names = new Map()
      const ids = [...new Set(rows.map((r) => r.otu))]
      for (let i = 0; i < ids.length; i += 50) {
        const p = new URLSearchParams({ per: '100' })
        ids.slice(i, i + 50).forEach((id) => p.append('otu_id[]', id))
        try {
          const { data: otus } = await makeAPIRequest.get(`/otus?${p}`)
          ;(otus || []).forEach((o) => names.set(o.id, o.object_tag || o.object_label))
        } catch {
          /* names stay unknown */
        }
      }
      return { rows, names }
    })
    .catch(() => ({ rows: [], names: new Map() }))
  return project
}

async function pick(layer) {
  if (picked.value === layer) {
    picked.value = ''
    return
  }
  picked.value = layer
  sharing.loading = true
  sharing.list = []
  const { rows, names } = await loadProject()
  if (picked.value !== layer) return
  sharing.list = [...new Set(rows.filter((r) => r.layers.has(layer) && r.otu !== props.otuId).map((r) => r.otu))]
    .filter((id) => names.has(id))
    .map((id) => ({ id, html: String(names.get(id)).replace(/<(?!\/?i>)[^>]*>/gi, '') }))
    .sort((a, b) => a.html.replace(/<[^>]+>/g, '').localeCompare(b.html.replace(/<[^>]+>/g, '')))
  sharing.loading = false
}
</script>

<style scoped>
/* same look as the other sections of PanelBiology (its styles are scoped) */
.bio-h {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bio-muted);
  margin-bottom: 0.4rem;
}
.bio-muted {
  color: var(--bio-muted);
}
.bio-legend {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--bio-muted);
}
.lh-sentence {
  margin-bottom: 0.7rem;
  font-weight: 600;
  color: var(--bio-ink);
}
.lh-chart {
  max-width: 26rem;
}
.lh-axis-title {
  margin: 0 0 0.3rem 3.6rem;
  font-size: 0.7rem;
  color: var(--bio-muted);
}
.lh-row {
  display: grid;
  grid-template-columns: 3.2rem 2.2rem 1fr;
  align-items: stretch;
  column-gap: 0.6rem;
  height: 2.1rem;
}
.lh-row.ground {
  height: 1rem;
}
/* the height at the top edge of each layer, like an axis tick */
.lh-tick {
  position: relative;
  top: -0.45rem;
  text-align: right;
  font-size: 0.7rem;
  line-height: 1;
  color: var(--bio-muted);
  font-variant-numeric: tabular-nums;
}
.lh-band {
  position: relative;
  display: block;
  padding: 0;
  border: 1px solid var(--bio-rule);
  border-bottom-width: 0;
  background: var(--soi-paper-2, #f2ecdd);
  cursor: default;
  outline: none;
}
.lh-row:first-of-type .lh-band {
  border-radius: 999px 999px 0 0;
}
.lh-row.ground .lh-band {
  border-bottom-width: 1px;
  border-radius: 0 0 4px 4px;
  background: repeating-linear-gradient(135deg, var(--bio-rule) 0 3px, transparent 3px 7px);
}
.lh-band.on {
  background: var(--soi-yellow, #f0b81f);
  border-color: var(--soi-yellow-deep, #9a6a12);
  cursor: pointer;
}
.lh-row.ground .lh-band.on {
  background: var(--soi-yellow, #f0b81f);
}
.lh-band.on.first {
  border-top-width: 2px;
}
.lh-band.on.last {
  border-bottom: 2px solid var(--soi-yellow-deep, #9a6a12);
}
.lh-band.hot,
.lh-band:focus-visible {
  box-shadow: inset 0 0 0 2px var(--bio-ink);
}
.lh-label {
  align-self: center;
  font-size: 0.85rem;
  color: var(--bio-muted);
}
.lh-label.on {
  color: var(--bio-ink);
  font-weight: 700;
}
.lh-tip {
  position: absolute;
  left: calc(100% + 0.5rem);
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  width: max-content;
  max-width: 16rem;
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  background: var(--bio-ink);
  color: var(--soi-paper, #faf7ef);
  font-size: 0.75rem;
  line-height: 1.35;
  text-align: left;
  pointer-events: none;
}
.lh-note {
  margin: 0.4rem 0 0 3.6rem;
  font-size: 0.7rem;
  color: var(--bio-muted);
}
.lh-specials {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.6rem 0 0 3.6rem;
}
.lh-chip {
  padding: 0.15rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--soi-yellow, #f0b81f);
  color: #22281c;
  border: 1px solid var(--soi-yellow-deep, #9a6a12);
}
.lh-chip.hot {
  box-shadow: 0 0 0 2px var(--bio-ink);
}
.lh-key {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  margin-right: 0.2rem;
  vertical-align: -1px;
  border-radius: 3px;
  background: var(--soi-yellow, #f0b81f);
}
.lh-who {
  margin-top: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-left: 3px solid var(--soi-yellow, #f0b81f);
  background: var(--soi-paper-2, #f2ecdd);
  border-radius: 0 6px 6px 0;
  font-size: 0.85rem;
}
.lh-visitors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.2rem 1rem;
  margin-top: 0.35rem;
}
.lh-visitors a:hover {
  text-decoration: underline;
}
</style>
