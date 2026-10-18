<template>
  <div class="soi-bio">
    <ClientOnly>
      <div
        v-if="loading"
        class="min-h-48"
      >
        <VSpinner />
      </div>
    </ClientOnly>

    <template v-if="!loading">
      <!-- Life cycle -->
      <VCard
        v-if="cycle.length"
        class="mb-6"
      >
        <VCardHeader class="border-b border-base-muted">{{ t('lifeCycle') }}</VCardHeader>
        <VCardContent>
          <dl class="bio-cycle">
            <div
              v-for="c in cycle"
              :key="c.key"
            >
              <dt>{{ c.label }}</dt>
              <dd>
                <RedListBadge
                  v-if="c.key === 'redList'"
                  :category="c.value"
                  class="bio-rl"
                />
                <template v-else>
                  <span
                    v-if="c.dots"
                    class="bio-dots"
                    aria-hidden="true"
                    ><i
                      v-for="n in c.dots"
                      :key="n"
                  /></span>
                  {{ c.value }}
                </template>
              </dd>
            </div>
          </dl>
        </VCardContent>
      </VCard>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Adult -->
        <VCard v-if="hasAdult">
          <VCardHeader class="border-b border-base-muted">{{ t('adult') }}</VCardHeader>
          <VCardContent class="space-y-6">
            <!-- Size -->
            <section v-if="traits.length">
              <h3 class="bio-h">
                {{ t('size') }} <span class="bio-val">{{ range(traits.length, 'mm') }}</span>
              </h3>
              <div
                class="bio-scale"
                role="img"
                :aria-label="`${t('size')}: ${range(traits.length, 'mm')}`"
              >
                <span
                  class="bio-band"
                  :style="band(traits.length.min, traits.length.max, sizeMax)"
                />
              </div>
              <div class="bio-axis">
                <span>0</span><span>{{ sizeMax / 2 }} mm</span><span>{{ sizeMax }} mm</span>
              </div>
              <p
                v-if="traits.mouthparts !== null"
                class="mt-2 text-sm"
              >
                {{ t('mouthparts') }}: <strong>{{ traits.mouthparts }} mm</strong>
              </p>
            </section>

            <!-- Flight season -->
            <section v-if="hasSeason">
              <h3 class="bio-h">
                {{ t('season') }}
                <span
                  v-if="traits.phenologyText"
                  class="bio-val"
                  >{{ seasonText }}</span
                >
              </h3>
              <div
                class="bio-season"
                role="group"
                :aria-label="t('season')"
              >
                <div
                  v-for="(m, i) in monthsShort"
                  :key="i"
                  class="bio-month"
                  :class="{ lit: traits.months[i], on: hoverMonth === i }"
                  tabindex="0"
                  :aria-label="monthTitle(i)"
                  @mouseenter="hoverMonth = i"
                  @mouseleave="hoverMonth = null"
                  @focus="hoverMonth = i"
                  @blur="hoverMonth = null"
                >
                  <span
                    v-if="recordMonths[i]"
                    class="bio-bar"
                    :style="{ height: Math.max(12, (recordMonths[i] / maxMonth) * 100) + '%' }"
                  />
                  <span
                    v-if="hoverMonth === i"
                    class="bio-tip"
                    :class="{ end: i > 8, start: i < 3 }"
                    role="tooltip"
                    >{{ monthTitle(i) }}</span
                  >
                </div>
              </div>
              <div class="bio-months">
                <span
                  v-for="(m, i) in monthsShort"
                  :key="i"
                  >{{ m }}</span
                >
              </div>
              <p class="bio-legend">
                <span v-if="traits.months.some(Boolean)"><i class="sw lit" /> {{ t('litSeason') }}</span>
                <span v-if="recordsWithMonth"><i class="sw bar" /> {{ t('fromRecords', { n: fmt(recordsWithMonth) }) }}</span>
              </p>
              <p
                v-if="seasonNote"
                class="bio-note"
              >
                {{ seasonNote }}
              </p>
            </section>

            <!-- Altitude -->
            <section v-if="traits.altitude || recordElevations.length">
              <h3 class="bio-h">
                {{ t('altitude') }}
                <span
                  v-if="traits.altitude"
                  class="bio-val"
                  >{{ range(traits.altitude, 'm') }}</span
                >
              </h3>
              <div
                class="bio-scale"
                role="group"
                :aria-label="altAria"
              >
                <span
                  v-if="traits.altitude"
                  class="bio-band"
                  :style="band(traits.altitude.min, traits.altitude.max ?? traits.altitude.min, altMax)"
                />
                <span
                  v-for="e in recordElevations"
                  :key="e"
                  class="bio-tick"
                  :class="{ on: hoverElev === e || pickedElev === e }"
                  :style="{ left: (e / altMax) * 100 + '%' }"
                  tabindex="0"
                  role="button"
                  :aria-pressed="pickedElev === e"
                  :aria-label="`${elevLabel(e)} — ${t('clickList')}`"
                  @mouseenter="hoverElev = e"
                  @mouseleave="hoverElev = null"
                  @focus="hoverElev = e"
                  @blur="hoverElev = null"
                  @click="pickElev(e)"
                  @keydown.enter.prevent="pickElev(e)"
                  @keydown.space.prevent="pickElev(e)"
                >
                  <span
                    v-if="hoverElev === e"
                    class="bio-tip"
                    :class="{ end: e / altMax > 0.8, start: e / altMax < 0.2 }"
                    role="tooltip"
                    >{{ elevLabel(e) }} · {{ t('clickList') }}</span
                  >
                </span>
              </div>
              <div class="bio-axis">
                <span>0</span><span>{{ fmt(altMax / 2) }} m</span><span>{{ fmt(altMax) }} m</span>
              </div>
              <p class="bio-legend">
                <span v-if="traits.altitude"><i class="sw lit" /> {{ t('litAltitude', { r: range(traits.altitude, 'm') }) }}</span>
                <span v-if="recordElevations.length"><i class="sw tick" /> {{ t('elevRecords', { r: elevRange }) }}</span>
              </p>
              <p
                v-if="altNote"
                class="bio-note"
              >
                {{ altNote }}
              </p>

              <!-- the records at the chosen elevation -->
              <div
                v-if="pickedElev !== null"
                class="bio-recs"
                role="region"
                :aria-label="t('recsAt', { e: fmt(pickedElev) })"
              >
                <div class="flex items-baseline justify-between gap-3">
                  <p class="font-semibold">{{ t('recsAt', { e: fmt(pickedElev) }) }}</p>
                  <button
                    type="button"
                    class="bio-close"
                    :aria-label="t('close')"
                    @click="pickedElev = null"
                  >
                    ×
                  </button>
                </div>
                <RecordList
                  :key="pickedElev"
                  :records="recordsAt(pickedElev)"
                  class="mt-1"
                />
              </div>
            </section>

            <!-- Habitat -->
            <HabitatProfile
              v-if="traits.habitat.length"
              :otu-id="otuId"
              :items="traits.habitat"
            />

            <!-- Flowers -->
            <FlowersVisited
              v-if="traits.flowers.length || flowerFamilies.length"
              :otu-id="otuId"
              :items="traits.flowers"
              :associations="associations"
            />
          </VCardContent>
        </VCard>

        <!-- Larva -->
        <VCard v-if="hasLarva">
          <VCardHeader class="border-b border-base-muted">{{ t('larva') }}</VCardHeader>
          <VCardContent class="space-y-6">
            <section v-if="traits.trophism.length || prey.length || foodPlants.length">
              <h3 class="bio-h">{{ t('feeding') }}</h3>
              <p
                v-for="tr in traits.trophism"
                :key="tr.label"
                class="text-base"
              >
                <strong>{{ trophLabel(tr) }}</strong>
                <span
                  v-if="tr.detail"
                  class="bio-muted"
                >
                  — {{ tr.detail }}</span
                >
              </p>
              <template v-if="prey.length">
                <p class="text-xs bio-muted mt-3 mb-1.5">{{ t('preyRecords', { n: fmt(prey.length) }) }}</p>
                <ul class="bio-chips">
                  <li
                    v-for="p in prey.slice(0, 16)"
                    :key="p"
                    class="assoc"
                  >
                    <i>{{ p }}</i>
                  </li>
                  <li
                    v-if="prey.length > 16"
                    class="more"
                  >
                    +{{ prey.length - 16 }}
                  </li>
                </ul>
              </template>
              <template v-if="foodPlants.length">
                <p class="text-xs bio-muted mt-3 mb-1.5">{{ t('plantRecords', { n: fmt(foodPlants.length) }) }}</p>
                <ul class="bio-chips">
                  <li
                    v-for="p in foodPlants.slice(0, 16)"
                    :key="p"
                    class="assoc"
                  >
                    <i>{{ p }}</i>
                  </li>
                </ul>
              </template>
            </section>

            <LarvalHabitat
              v-if="traits.microhabitat.length"
              :otu-id="otuId"
              :items="traits.microhabitat"
            />
          </VCardContent>
        </VCard>
      </div>

      <p
        v-if="!traits.habitat.length && !hasLarvaContent"
        class="bio-empty"
      >
        {{ t('noData') }}
      </p>

      <!-- Where the facts come from -->
      <div
        v-if="hasAnything"
        class="bio-foot"
      >
        <p>
          <template v-if="contents.length">{{ t('footLit') + ' ' }}</template>
          <template v-if="recordsWithMonth || recordElevations.length">{{ t('footRecords') + ' ' }}</template>
          <template v-if="associations.length">
            {{ t('footAssoc') }}
            <RouterLink
              :to="{ name: 'otus-id-associations', params: { id: otuId } }"
              class="underline"
              >{{ t('seeAssoc') }}</RouterLink
            >.
          </template>
        </p>
        <template v-if="sources.length">
          <p class="mt-2 font-semibold">{{ t('sources') }}</p>
          <ul class="mt-1 space-y-1">
            <li
              v-for="s in sources"
              :key="s.id"
              v-html="s.html"
            />
          </ul>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { makeAPIRequest } from '@/utils'
import { lang, useT } from '@/utils/soiLang.js'
import RedListBadge from '~/pages/components/Atlas/RedListBadge.vue'
import { fetchAssociations } from '../_shared/associationGraph.js'
import { TOPIC, traitsOf } from './traits.js'
import RecordList from '../_shared/RecordList.vue'
import FlowersVisited from './components/FlowersVisited.vue'
import HabitatProfile from './components/HabitatProfile.vue'
import LarvalHabitat from './components/LarvalHabitat.vue'

const props = defineProps({
  otuId: { type: Number, required: true },
  // optional: only these topics (config/taxa_page.yml → biology → bind → topic_id)
  topic_id: { type: [Array, Number], default: undefined }
})

const t = useT({
  en: {
    lifeCycle: 'Life cycle',
    generations: 'Generations per year',
    overwinters: 'Overwinters as',
    migration: 'Migration',
    commensal: 'Lives with social insects',
    redList: 'European Red List',
    adult: 'Adult',
    larva: 'Larva',
    size: 'Body length',
    mouthparts: 'Mouthpart length',
    season: 'Flight season',
    altitude: 'Altitude',
    habitat: 'Preferred habitat',
    flowers: 'Flowers visited',
    feeding: 'Larval food',
    microhabitat: 'Where larvae live',
    fromLit: 'literature',
    clickList: 'click to list them',
    recsAt: 'SoI records at {e} m',
    close: 'Close',
    noDate: 'no date',
    onGbif: 'Open this record on GBIF',
    litSeason: 'Flight season given in the literature',
    litAltitude: 'Range given in the literature ({r})',
    fromRecords: 'SoI records per month ({n})',
    elevRecords: 'SoI records ({r})',
    notLitMonth: 'not in the literature season',
    seasonInside: 'All dated SoI records fall within the flight season given in the literature.',
    seasonOutside: '{r} in SoI were collected outside the flight season given in the literature ({m}).',
    altInside: 'All SoI records fall within the altitude range given in the literature.',
    altAbove: '{r} in SoI lie above the literature range (up to {e}; the literature gives a maximum of {lim}).',
    altBelow: '{r} in SoI lie below the literature range (down to {e}; the literature gives a minimum of {lim}).',
    flowerRecords: 'Recorded flower visits in SoI, by plant family ({n} plants)',
    preyRecords: 'Recorded prey in SoI ({n})',
    plantRecords: 'Recorded food plants in SoI ({n})',
    noData: 'No habitat or larval data yet.',
    footLit: 'Ranges and traits come from the literature entered in SoI.',
    footRecords: 'Bars and ticks show the dated and georeferenced SoI records of this taxon.',
    footAssoc: 'Prey, food plants and flowers recorded in SoI are listed in full under',
    seeAssoc: 'Biological associations',
    sources: 'Sources',
    uni: '1 (univoltine)',
    bi: '2 (bivoltine)',
    poly: '3 or more (polyvoltine)',
    larvaS: 'larva',
    pupaS: 'pupa',
    adultS: 'adult',
    eggS: 'egg',
    mig_no: 'Not migratory',
    mig_weak: 'Weakly migratory',
    mig_yes: 'Migratory',
    mig_strong: 'Strongly migratory',
    yes: 'Yes',
    no: 'No',
    tr_zoophagous: 'Zoophagous (predator)',
    tr_phytophagous: 'Phytophagous (feeds on plants)',
    tr_saprophagous: 'Saprophagous (decaying matter)',
    tr_mycophagous: 'Mycophagous (fungi)',
    tr_microphagous: 'Microphagous (filter-feeder)',
    noRecordsMonth: 'no records',
    litMonth: 'in the literature season',
    recs: '{n} records',
    rec1: '1 record'
  },
  it: {
    lifeCycle: 'Ciclo vitale',
    generations: 'Generazioni all’anno',
    overwinters: 'Sverna come',
    migration: 'Migrazione',
    commensal: 'Vive con insetti sociali',
    redList: 'Lista Rossa europea',
    adult: 'Adulto',
    larva: 'Larva',
    size: 'Lunghezza del corpo',
    mouthparts: 'Lunghezza dell’apparato boccale',
    season: 'Periodo di volo',
    altitude: 'Altitudine',
    habitat: 'Habitat preferito',
    flowers: 'Fiori visitati',
    feeding: 'Alimentazione larvale',
    microhabitat: 'Dove vivono le larve',
    fromLit: 'letteratura',
    clickList: 'clicca per vederli',
    recsAt: 'Record di SoI a {e} m',
    close: 'Chiudi',
    noDate: 'senza data',
    onGbif: 'Apri questo record su GBIF',
    litSeason: 'Periodo di volo indicato in letteratura',
    litAltitude: 'Intervallo indicato in letteratura ({r})',
    fromRecords: 'record di SoI per mese ({n})',
    elevRecords: 'record di SoI ({r})',
    notLitMonth: 'fuori dal periodo indicato in letteratura',
    seasonInside: 'Tutti i record datati di SoI cadono nel periodo di volo indicato in letteratura.',
    seasonOutside: '{r} di SoI sono stati raccolti fuori dal periodo di volo indicato in letteratura ({m}).',
    altInside: 'Tutti i record di SoI cadono nell’intervallo altitudinale indicato in letteratura.',
    altAbove: '{r} di SoI si trovano sopra l’intervallo della letteratura (fino a {e}; la letteratura indica un massimo di {lim}).',
    altBelow: '{r} di SoI si trovano sotto l’intervallo della letteratura (fino a {e}; la letteratura indica un minimo di {lim}).',
    flowerRecords: 'Visite ai fiori registrate in SoI, per famiglia ({n} piante)',
    preyRecords: 'Prede registrate in SoI ({n})',
    plantRecords: 'Piante alimentari registrate in SoI ({n})',
    noData: 'Ancora nessun dato su habitat o larve.',
    footLit: 'Intervalli e caratteri provengono dalla letteratura inserita in SoI.',
    footRecords: 'Barre e tacche mostrano i record datati e georeferenziati di SoI per questo taxon.',
    footAssoc: 'Prede, piante alimentari e fiori registrati in SoI sono elencati per intero in',
    seeAssoc: 'Associazioni biologiche',
    sources: 'Fonti',
    uni: '1 (univoltina)',
    bi: '2 (bivoltina)',
    poly: '3 o più (polivoltina)',
    larvaS: 'larva',
    pupaS: 'pupa',
    adultS: 'adulto',
    eggS: 'uovo',
    mig_no: 'Non migratrice',
    mig_weak: 'Debolmente migratrice',
    mig_yes: 'Migratrice',
    mig_strong: 'Fortemente migratrice',
    yes: 'Sì',
    no: 'No',
    tr_zoophagous: 'Zoofaga (predatrice)',
    tr_phytophagous: 'Fitofaga (si nutre di piante)',
    tr_saprophagous: 'Saprofaga (materiale in decomposizione)',
    tr_mycophagous: 'Micofaga (funghi)',
    tr_microphagous: 'Microfaga (filtratrice)',
    noRecordsMonth: 'nessun record',
    litMonth: 'nel periodo indicato in letteratura',
    recs: '{n} record',
    rec1: '1 record'
  }
})

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
}
const monthsLong = computed(() => MONTHS[lang.value] || MONTHS.en)
const monthsShort = computed(() => monthsLong.value.map((m) => m[0]))
const fmt = (n) => Number(n).toLocaleString(lang.value === 'it' ? 'it-IT' : 'en-US')

const loading = ref(true)
const contents = ref([])
const records = ref([])
const associations = ref([])
const sources = ref([])
const controller = new AbortController()

const traits = computed(() => traitsOf(contents.value))

// ---------- life cycle ----------
const cycle = computed(() => {
  const tr = traits.value
  const out = []
  if (tr.voltinism.length) {
    const max = tr.voltinism.includes('poly') ? 3 : tr.voltinism.includes('bi') ? 2 : 1
    out.push({ key: 'volt', label: t('generations'), value: tr.voltinism.map((k) => t(k)).join(lang.value === 'it' ? ' o ' : ' or '), dots: max })
  }
  if (tr.overwintering.length) out.push({ key: 'winter', label: t('overwinters'), value: tr.overwintering.map((k) => t(k + 'S')).join(', ') })
  if (tr.migratory) out.push({ key: 'mig', label: t('migration'), value: t('mig_' + tr.migratory) })
  if (tr.commensalism === 'yes') out.push({ key: 'comm', label: t('commensal'), value: t('yes') })
  if (tr.redList) out.push({ key: 'redList', label: t('redList'), value: tr.redList })
  return out
})

// ---------- adult ----------
const recordMonths = computed(() => {
  const m = Array(12).fill(0)
  records.value.forEach((r) => {
    const i = Number(r.month || String(r.eventDate || '').slice(5, 7)) - 1
    if (i >= 0 && i < 12) m[i]++
  })
  return m
})
const recordsWithMonth = computed(() => recordMonths.value.reduce((a, b) => a + b, 0))
const maxMonth = computed(() => Math.max(1, ...recordMonths.value))
const hasSeason = computed(() => traits.value.months.some(Boolean) || recordsWithMonth.value > 0)

// Elevation of each record (min, or max when only that is given) → number of records
const elevCounts = computed(() => {
  const m = new Map()
  records.value.forEach((r) => {
    const v = [r.minimumElevationInMeters, r.maximumElevationInMeters].map(Number).find((x) => Number.isFinite(x) && x > 0)
    if (v) m.set(Math.round(v), (m.get(Math.round(v)) || 0) + 1)
  })
  return m
})
const recordElevations = computed(() => [...elevCounts.value.keys()].sort((a, b) => a - b))
const hoverElev = ref(null)
const pickedElev = ref(null)
function pickElev(e) {
  pickedElev.value = pickedElev.value === e ? null : e
}
// records at one elevation (same rule as elevCounts), dated ones first, newest first
const elevOf = (r) => {
  const v = [r.minimumElevationInMeters, r.maximumElevationInMeters].map(Number).find((x) => Number.isFinite(x) && x > 0)
  return v ? Math.round(v) : null
}
function recordsAt(e) {
  return records.value
    .filter((r) => elevOf(r) === e)
    .sort((a, b) => String(b.eventDate || '').localeCompare(String(a.eventDate || '')))
}
function elevText(r) {
  const lo = Number(r.minimumElevationInMeters)
  const hi = Number(r.maximumElevationInMeters)
  if (Number.isFinite(lo) && lo > 0 && Number.isFinite(hi) && hi > lo) return `${fmt(lo)}–${fmt(hi)} m`
  return r.verbatimElevation || ''
}
function elevLabel(e) {
  const n = elevCounts.value.get(e) || 0
  return `${fmt(e)} m · ${n === 1 ? t('rec1') : t('recs', { n: fmt(n) })}`
}
const elevRange = computed(() => {
  const e = recordElevations.value
  if (!e.length) return ''
  return e.length === 1 ? `${fmt(e[0])} m` : `${fmt(e[0])}–${fmt(e[e.length - 1])} m`
})
// Scales: round up to a readable maximum
const altMax = computed(() => {
  const top = Math.max(traits.value.altitude?.max || 0, traits.value.altitude?.min || 0, ...recordElevations.value, 1000)
  return Math.ceil(top / 500) * 500
})
const sizeMax = computed(() => Math.max(20, Math.ceil((traits.value.length?.max || 0) / 5) * 5))

function band(min, max, scale) {
  const lo = Math.max(0, Math.min(min, max))
  const hi = Math.max(min, max)
  const width = Math.max(((hi - lo) / scale) * 100, 1.5)
  return { left: (lo / scale) * 100 + '%', width: width + '%' }
}
const range = (r, unit) => (r.min === r.max || r.max === null || r.max === undefined ? `${fmt(r.min)} ${unit}` : `${fmt(r.min)}–${fmt(r.max)} ${unit}`)

const seasonText = computed(() => {
  const on = traits.value.months
  const idx = on.map((v, i) => (v ? i : -1)).filter((i) => i >= 0)
  if (!idx.length) return traits.value.phenologyText
  // contiguous run (also across the new year) → "March–June"
  const names = monthsLong.value
  const runs = []
  idx.forEach((i) => {
    const last = runs[runs.length - 1]
    if (last && last[1] === i - 1) last[1] = i
    else runs.push([i, i])
  })
  if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1][1] === 11) {
    const first = runs.shift()
    runs[runs.length - 1][1] = first[1]
  }
  return runs.map(([a, b]) => (a === b ? names[a] : `${names[a]}–${names[b]}`)).join(', ')
})
const hoverMonth = ref(null)
function monthTitle(i) {
  const n = recordMonths.value[i]
  const parts = [monthsLong.value[i]]
  if (traits.value.months.some(Boolean)) parts.push(traits.value.months[i] ? t('litMonth') : t('notLitMonth'))
  parts.push(n ? (n === 1 ? t('rec1') : t('recs', { n: fmt(n) })) : t('noRecordsMonth'))
  return parts.join(' · ')
}

const recs = (n) => (n === 1 ? t('rec1') : t('recs', { n: fmt(n) }))

// Literature and SoI records compared, in one sentence (only when both exist)
const seasonNote = computed(() => {
  const lit = traits.value.months
  if (!lit.some(Boolean) || !recordsWithMonth.value) return ''
  const outside = recordMonths.value.map((n, i) => (lit[i] ? 0 : n))
  const n = outside.reduce((a, b) => a + b, 0)
  if (!n) return t('seasonInside')
  const months = outside.map((v, i) => (v ? monthsLong.value[i] : '')).filter(Boolean).join(', ')
  return t('seasonOutside', { r: recs(n), m: months })
})
const altNote = computed(() => {
  const lit = traits.value.altitude
  if (!lit || !recordElevations.value.length) return ''
  const lo = Math.min(lit.min ?? 0, lit.max ?? lit.min)
  const hi = Math.max(lit.min ?? 0, lit.max ?? lit.min)
  let above = 0
  let below = 0
  let top = 0
  let bottom = Infinity
  elevCounts.value.forEach((n, e) => {
    if (e > hi) {
      above += n
      top = Math.max(top, e)
    }
    if (e < lo) {
      below += n
      bottom = Math.min(bottom, e)
    }
  })
  if (!above && !below) return t('altInside')
  return [
    above ? t('altAbove', { r: recs(above), e: `${fmt(top)} m`, lim: `${fmt(hi)} m` }) : '',
    below ? t('altBelow', { r: recs(below), e: `${fmt(bottom)} m`, lim: `${fmt(lo)} m` }) : ''
  ]
    .filter(Boolean)
    .join(' ')
})
const altAria = computed(() =>
  [traits.value.altitude ? `${t('fromLit')}: ${range(traits.value.altitude, 'm')}` : '', elevRange.value ? `${t('elevRecords', { r: elevRange.value })}` : '']
    .filter(Boolean)
    .join('; ')
)

// ---------- associations ----------
const strip = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()
const ourSide = (a) => a.subject?.id === props.otuId || a.subject?.taxonomy?.family === 'Syrphidae'
function partnersOf(test) {
  const set = new Map()
  associations.value.forEach((a) => {
    const rel = String(a.biological_relationship?.name || '').toLowerCase()
    if (!ourSide(a) || !test(rel)) return
    // name without its author and year ("Aphis fabae Scopoli, 1763" → "Aphis fabae")
    const name = strip(a.object?.object_label).replace(/\s+\(?[A-ZÀ-ÖØ-Þ][^()]*?,\s*\d{4}\)?\s*$/, '')
    if (name && !set.has(name)) set.set(name, a.object?.taxonomy?.family || '')
  })
  return set
}
const flowerMap = computed(() => partnersOf((r) => r.includes('flower')))
const flowerCount = computed(() => flowerMap.value.size)
const flowerFamilies = computed(() => {
  const byFam = new Map()
  flowerMap.value.forEach((fam, name) => {
    const k = fam || '—'
    if (!byFam.has(k)) byFam.set(k, [])
    byFam.get(k).push(name)
  })
  return [...byFam.entries()].map(([family, plants]) => ({ family, plants: plants.sort() })).sort((a, b) => b.plants.length - a.plants.length || a.family.localeCompare(b.family))
})
const prey = computed(() => [...partnersOf((r) => r.startsWith('predator')).keys()].sort())
const foodPlants = computed(() => [...partnersOf((r) => r.includes('phytophag')).keys()].sort())

// ---------- what to show ----------
const hasAdult = computed(
  () =>
    !!traits.value.length ||
    hasSeason.value ||
    !!traits.value.altitude ||
    recordElevations.value.length > 0 ||
    traits.value.habitat.length > 0 ||
    traits.value.flowers.length > 0 ||
    flowerFamilies.value.length > 0
)
const hasLarvaContent = computed(() => traits.value.trophism.length > 0 || traits.value.microhabitat.length > 0)
const hasLarva = computed(() => hasLarvaContent.value || prey.value.length > 0 || foodPlants.value.length > 0)
const hasAnything = computed(() => cycle.value.length > 0 || hasAdult.value || hasLarva.value)

function trophLabel(tr) {
  return tr.key ? t('tr_' + tr.key) : tr.label
}

// ---------- data ----------
onMounted(async () => {
  const topics = props.topic_id ? [props.topic_id].flat() : Object.values(TOPIC)
  const [cont, dwc, assoc] = await Promise.allSettled([
    makeAPIRequest.get('/contents', { params: { otu_id: [props.otuId], topic_id: topics, per: 200 }, signal: controller.signal }),
    makeAPIRequest.get(`/otus/${props.otuId}/inventory/dwc.json`, { signal: controller.signal }),
    fetchAssociations({ 'otu_query[coordinatify]': true, 'otu_query[otu_id][]': props.otuId })
  ])
  contents.value = cont.status === 'fulfilled' && Array.isArray(cont.value.data) ? cont.value.data : []
  records.value = dwc.status === 'fulfilled' && Array.isArray(dwc.value.data) ? dwc.value.data : []
  associations.value = assoc.status === 'fulfilled' ? assoc.value : []
  loading.value = false
  loadSources()
})

// Citations attached to the contents in TaxonWorks (shown when there are any)
async function loadSources() {
  const ids = contents.value.map((c) => c.id)
  if (!ids.length) return
  try {
    const p = new URLSearchParams({ citation_object_type: 'Content', per: '200' })
    ids.forEach((id) => p.append('citation_object_id[]', id))
    p.append('extend[]', 'source')
    const { data } = await makeAPIRequest.get(`/citations?${p}`, { signal: controller.signal })
    const seen = new Map()
    ;(data || []).forEach((c) => {
      const s = c.source
      if (s && !seen.has(s.id)) {
        const html = String(s.cached || s.object_tag || '').replace(/<(?!\/?(i|em|b|strong)>)[^>]*>/gi, '')
        seen.set(s.id, { id: s.id, html })
      }
    })
    sources.value = [...seen.values()]
  } catch {
    sources.value = []
  }
}

onBeforeUnmount(() => controller.abort())
</script>

<style scoped>
.soi-bio {
  --bio-lit: color-mix(in srgb, var(--soi-yellow, #f0b81f) 45%, transparent);
  --bio-ink: var(--soi-ink, #22281c);
  --bio-bar: var(--soi-olive, #4f5d2f);
  --bio-rule: var(--soi-rule, #ddd4bf);
  --bio-muted: var(--soi-ink-soft, #5b5e4c);
}
.bio-muted {
  color: var(--bio-muted);
}
.bio-cycle {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1rem 1.5rem;
}
.bio-cycle dt,
.bio-h {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--bio-muted);
}
.bio-cycle dd {
  margin: 0.3rem 0 0;
  font-weight: 600;
}
.bio-h {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.6rem;
  margin-bottom: 0.6rem;
}
.bio-val {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: none;
  color: var(--bio-ink);
}
.bio-dots {
  display: inline-flex;
  gap: 3px;
  margin-right: 0.4rem;
  vertical-align: middle;
}
.bio-dots i {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  background: var(--bio-bar);
}
.bio-rl :deep(.soi-rl-code) {
  width: 1.7rem;
  height: 1.7rem;
}
/* range scales */
.bio-scale {
  position: relative;
  height: 0.9rem;
  border-radius: 999px;
  background: var(--soi-paper-2, #f2ecdd);
  border: 1px solid var(--bio-rule);
}
.bio-band {
  position: absolute;
  top: -1px;
  bottom: -1px;
  border-radius: 999px;
  background: var(--soi-yellow, #f0b81f);
}
/* a 12 px wide hit area around a 2 px line, so ticks are easy to hover */
.bio-tick {
  position: absolute;
  top: -6px;
  bottom: -6px;
  width: 12px;
  margin-left: -6px;
  cursor: default;
  outline: none;
}
.bio-tick::before {
  content: '';
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 5px;
  width: 2px;
  background: var(--bio-bar);
  box-shadow: 0 0 0 1px var(--soi-card, #fff);
}
.bio-tick.on::before,
.bio-tick:focus-visible::before {
  left: 4px;
  width: 4px;
  background: var(--bio-ink);
}
.bio-tip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  white-space: nowrap;
  padding: 0.3rem 0.55rem;
  border-radius: 4px;
  background: var(--bio-ink);
  color: var(--soi-paper, #faf7ef);
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}
.bio-tip.end {
  left: auto;
  right: 0;
  transform: none;
}
.bio-tip.start {
  left: 0;
  transform: none;
}
.bio-axis,
.bio-months {
  display: flex;
  justify-content: space-between;
  margin-top: 0.3rem;
  font-size: 0.7rem;
  color: var(--bio-muted);
  font-variant-numeric: tabular-nums;
}
/* flight season */
.bio-season {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2px;
  height: 4.5rem;
}
.bio-month {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-radius: 4px;
  background: var(--soi-paper-2, #f2ecdd);
}
.bio-month {
  cursor: default;
  outline: none;
}
.bio-month.lit {
  background: var(--bio-lit);
}
.bio-month.on,
.bio-month:focus-visible {
  box-shadow: inset 0 0 0 2px var(--bio-ink);
}
.bio-recs {
  margin-top: 0.6rem;
  padding: 0.6rem 0.8rem;
  border-left: 3px solid var(--bio-bar);
  background: var(--soi-paper-2, #f2ecdd);
  border-radius: 0 6px 6px 0;
  font-size: 0.82rem;
}
.bio-recs ul {
  display: grid;
  gap: 0.35rem;
  margin-top: 0.35rem;
}
.bio-recs li {
  display: flex;
  flex-wrap: wrap;
  gap: 0.15rem 0.6rem;
  align-items: baseline;
}
.bio-rec-date {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.bio-close {
  font-size: 1.1rem;
  line-height: 1;
  color: var(--bio-muted);
}
.bio-gbif {
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 2px;
  color: var(--bio-ink);
}
.bio-tick {
  cursor: pointer;
}
.bio-note {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--bio-ink);
}
.bio-bar {
  width: 55%;
  border-radius: 4px 4px 0 0;
  background: var(--bio-bar);
}
.bio-months {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  text-align: center;
}
.bio-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--bio-muted);
}
.sw {
  display: inline-block;
  width: 0.8rem;
  height: 0.8rem;
  margin-right: 0.25rem;
  vertical-align: -1px;
  border-radius: 3px;
}
.sw.lit {
  background: var(--soi-yellow, #f0b81f);
}
.sw.bar {
  background: var(--bio-bar);
}
.sw.tick {
  width: 2px;
  border-radius: 0;
  background: var(--bio-bar);
}
/* chips */
.bio-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.bio-chips li {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.82rem;
  background: var(--soi-paper-2, #f2ecdd);
  border: 1px solid var(--bio-rule);
}
.bio-chips li.assoc {
  background: transparent;
  border-style: dashed;
}
.bio-chips li.more {
  background: transparent;
  border: 0;
  color: var(--bio-muted);
}
.bio-empty {
  margin: 1.5rem 0;
  font-size: 1.05rem;
  color: var(--bio-muted);
  text-align: center;
}
.bio-foot {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bio-rule);
  font-size: 0.8rem;
  color: var(--bio-muted);
  line-height: 1.5;
}
</style>
