<template>
  <VCard class="soi-glance">
    <VCardHeader class="flex items-center justify-between gap-3">
      <span>{{ t('title') }}</span>
      <RedListBadge
        v-if="redList"
        :category="redList"
        class="soi-glance-rl"
      />
    </VCardHeader>
    <VCardContent>
      <ClientOnly>
        <VSpinner v-if="loading" />
      </ClientOnly>

      <p
        v-if="!loading && !records.length && !hasContent"
        class="text-sm soi-muted"
      >
        {{ t('empty') }}
      </p>

      <div
        v-else-if="!loading"
        class="grid sm:grid-cols-[1fr_9.5rem] gap-6"
      >
        <div class="min-w-0">
          <!-- Key facts -->
          <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt class="soi-k">{{ t('records') }}</dt>
              <dd class="soi-v">{{ italian.length.toLocaleString('en-US') }}</dd>
              <dd
                v-if="years"
                class="text-xs soi-muted"
              >
                {{ years }}
              </dd>
            </div>
            <div>
              <dt class="soi-k">{{ t('elevation') }}</dt>
              <dd class="soi-v">{{ elevation || '—' }}</dd>
              <dd
                v-if="content.altSource"
                class="text-xs soi-muted"
              >
                {{ t('fromLit') }}
              </dd>
            </div>
            <div
              v-if="content.voltinism"
              class="col-span-2 sm:col-span-1"
            >
              <dt class="soi-k">{{ t('voltinism') }}</dt>
              <dd
                class="text-sm"
                v-html="content.voltinism"
              />
            </div>
            <div
              v-if="content.trophism"
              class="col-span-2 sm:col-span-1"
            >
              <dt class="soi-k">{{ t('larva') }}</dt>
              <dd
                class="text-sm"
                v-html="content.trophism"
              />
            </div>
            <div
              v-if="interactions.length"
              class="col-span-2"
            >
              <dt class="soi-k">{{ t('interactions') }}</dt>
              <dd class="text-sm">
                {{ interactions.join(' · ') }}
                <button
                  type="button"
                  class="ml-1 underline underline-offset-2 soi-muted hover:opacity-80"
                  @click="showNetwork"
                >
                  {{ t('seeNetwork') }}
                </button>
              </dd>
            </div>
          </dl>

          <!-- Flight season -->
          <div class="mt-6">
            <div class="flex items-baseline justify-between gap-3 mb-2">
              <span class="soi-k">{{ t('season') }}</span>
              <span
                v-if="peak"
                class="text-xs soi-muted"
                >{{ t('peak', { m: peak }) }}</span
              >
            </div>
            <SeasonBars
              v-if="months.some(Boolean)"
              :values="months"
              :height="70"
            />
            <p
              v-else
              class="text-sm soi-muted"
            >
              {{ t('noDates') }}
            </p>
            <p
              v-if="content.phenology"
              class="mt-2 text-xs soi-muted"
            >
              {{ t('litPhenology') }}: <span v-html="content.phenology" />
            </p>
          </div>
        </div>

        <!-- Regions -->
        <div>
          <span class="soi-k">{{ t('regions') }}</span>
          <svg
            :viewBox="VIEWBOX"
            class="w-full max-w-[11rem] h-auto mt-2"
            role="img"
            :aria-label="regionNames.join(', ') || t('noRegions')"
          >
            <path
              v-for="r in shapes"
              :key="r.name"
              :d="r.d"
              class="soi-mini"
              :class="{ on: regionSet.has(r.name) }"
            >
              <title>{{ r.name }}</title>
            </path>
          </svg>
          <p class="mt-1 text-xs soi-muted leading-snug">
            {{ regionNames.length ? t('nRegions', { n: regionNames.length }) : t('noRegions') }}
          </p>
        </div>
      </div>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { makeAPIRequest } from '@/utils'
import { useRouter } from 'vue-router'
import { fetchAssociations } from '~/panels/_shared/associationGraph.js'
import { lang, useT } from '@/utils/soiLang.js'
import shapes, { VIEWBOX } from '~/pages/components/Atlas/italyRegions.js'
import { REGION_ALIASES } from '~/pages/components/Atlas/useAtlas.js'
import SeasonBars from '~/pages/components/Atlas/SeasonBars.vue'
import RedListBadge from '~/pages/components/Atlas/RedListBadge.vue'

const props = defineProps({
  otuId: { type: Number, required: true }
})

const t = useT({
  en: {
    title: 'At a glance',
    records: 'Italian records',
    elevation: 'Elevation',
    fromLit: 'from literature',
    voltinism: 'Generations',
    larva: 'Larva',
    season: 'Flight season',
    peak: 'most records in {m}',
    noDates: 'No dated records yet.',
    litPhenology: 'Literature',
    regions: 'Regions',
    nRegions: 'Recorded in {n} regions',
    noRegions: 'No regional records yet',
    empty: 'No records or ecological data in SoI for this species yet.',
    interactions: 'Interactions',
    seeNetwork: 'see all associations →',
    visits: 'visits {n} plants',
    visits1: 'visits 1 plant',
    feeds: 'feeds on {n} plants',
    feeds1: 'feeds on 1 plant',
    preys: 'preys on {n} taxa',
    preys1: 'preys on 1 taxon',
    parasitoids: '{n} parasitoids',
    parasitoids1: '1 parasitoid',
    predators: '{n} predators',
    predators1: '1 predator'
  },
  it: {
    title: 'In sintesi',
    records: 'Record italiani',
    elevation: 'Altitudine',
    fromLit: 'da letteratura',
    voltinism: 'Generazioni',
    larva: 'Larva',
    season: 'Periodo di volo',
    peak: 'più record in {m}',
    noDates: 'Ancora nessun record datato.',
    litPhenology: 'Letteratura',
    regions: 'Regioni',
    nRegions: 'Presente in {n} regioni',
    noRegions: 'Nessun record regionale',
    empty: 'Ancora nessun record o dato ecologico in SoI per questa specie.',
    interactions: 'Interazioni',
    seeNetwork: 'vedi tutte le associazioni →',
    visits: 'visita {n} piante',
    visits1: 'visita 1 pianta',
    feeds: 'si nutre di {n} piante',
    feeds1: 'si nutre di 1 pianta',
    preys: 'preda {n} taxa',
    preys1: 'preda 1 taxon',
    parasitoids: '{n} parassitoidi',
    parasitoids1: '1 parassitoide',
    predators: '{n} predatori',
    predators1: '1 predatore'
  }
})

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
}

// Topic ids used by SoI for ecological content
const TOPIC = {
  phenology: 6433,
  altMin: 6434,
  altMax: 6435,
  voltinism: 6436,
  trophism: 6422,
  redList: 6440
}

const records = ref([])
const contents = ref([])
const loading = ref(true)
const controller = new AbortController()

const aliasToRegion = Object.fromEntries(
  Object.entries(REGION_ALIASES).flatMap(([region, aliases]) =>
    aliases.map((a) => [a.toLowerCase(), region])
  )
)

const italian = computed(() => records.value.filter((r) => !r.country || r.country === 'Italy'))

const months = computed(() => {
  const m = Array(12).fill(0)
  italian.value.forEach((r) => {
    const i = Number(r.month) - 1
    if (i >= 0 && i < 12) m[i] += 1
  })
  return m
})

const peak = computed(() => {
  const m = months.value
  const max = Math.max(...m)
  return max ? (MONTHS[lang.value] || MONTHS.en)[m.indexOf(max)] : ''
})

const years = computed(() => {
  const ys = italian.value
    .map((r) => Number(String(r.eventDate || r.year || '').slice(0, 4)))
    .filter((y) => y > 1700)
  if (!ys.length) return ''
  const lo = Math.min(...ys)
  const hi = Math.max(...ys)
  return lo === hi ? String(lo) : `${lo}–${hi}`
})

const regionSet = computed(
  () =>
    new Set(
      italian.value
        .map((r) => aliasToRegion[String(r.stateProvince || '').toLowerCase()])
        .filter(Boolean)
    )
)
const regionNames = computed(() => [...regionSet.value].sort())

function textOf(topic) {
  const c = contents.value.find((x) => x.topic_id === topic)
  return c ? String(c.text || '').trim() : ''
}

const content = computed(() => {
  const altMin = textOf(TOPIC.altMin)
  const altMax = textOf(TOPIC.altMax)
  return {
    phenology: textOf(TOPIC.phenology),
    voltinism: textOf(TOPIC.voltinism),
    trophism: textOf(TOPIC.trophism),
    altMin,
    altMax,
    altSource: !elevFromRecords.value && (altMin || altMax)
  }
})

const hasContent = computed(() => contents.value.length > 0)
const redList = computed(() => textOf(TOPIC.redList))

const elevFromRecords = computed(() => {
  const vals = italian.value
    .flatMap((r) => [r.minimumElevationInMeters, r.maximumElevationInMeters])
    .map(Number)
    .filter((v) => Number.isFinite(v) && v > 0)
  if (!vals.length) return ''
  const lo = Math.round(Math.min(...vals))
  const hi = Math.round(Math.max(...vals))
  return lo === hi ? `${lo} m` : `${lo}–${hi} m`
})

const elevation = computed(() => {
  if (elevFromRecords.value) return elevFromRecords.value
  const { altMin, altMax } = content.value
  if (altMin || altMax) return `${altMin || '?'}–${altMax || '?'} m`
  return ''
})

// Biological associations in one line: "visits 24 plants · 2 parasitoids"
const associations = ref([])
const interactions = computed(() => {
  const partners = new Map() // phrase key → Set of partner names
  const add = (key, name) => {
    if (!partners.has(key)) partners.set(key, new Set())
    partners.get(key).add(name)
  }
  associations.value.forEach((a) => {
    const rel = String(a.biological_relationship?.name || '').toLowerCase()
    const subjectIsUs = a.subject?.taxonomy?.family === 'Syrphidae' || a.subject?.id === props.otuId
    const partner = (subjectIsUs ? a.object : a.subject)?.object_label || ''
    if (subjectIsUs) {
      if (rel.includes('flower')) add('visits', partner)
      else if (rel.includes('phytophag')) add('feeds', partner)
      else if (rel.startsWith('predator')) add('preys', partner)
    } else if (rel.startsWith('parasitoid')) add('parasitoids', partner)
    else if (rel.startsWith('predator')) add('predators', partner)
  })
  return ['visits', 'feeds', 'preys', 'parasitoids', 'predators']
    .filter((k) => partners.has(k))
    .map((k) => {
      const n = partners.get(k).size
      return n === 1 ? t(`${k}1`) : t(k, { n })
    })
})
const router = useRouter()
// the table and network live in their own "Biological associations" tab
function showNetwork() {
  router.push({ name: 'otus-id-associations', params: { id: props.otuId } })
}

onMounted(async () => {
  fetchAssociations({ 'otu_query[coordinatify]': true, 'otu_query[otu_id][]': props.otuId })
    .then((rows) => (associations.value = rows))
    .catch(() => {})
  const [dwc, cont] = await Promise.allSettled([
    makeAPIRequest.get(`/otus/${props.otuId}/inventory/dwc.json`, { signal: controller.signal }),
    makeAPIRequest.get('/contents', {
      params: { otu_id: [props.otuId], topic_id: Object.values(TOPIC) },
      signal: controller.signal
    })
  ])
  records.value = dwc.status === 'fulfilled' && Array.isArray(dwc.value.data) ? dwc.value.data : []
  contents.value = cont.status === 'fulfilled' && Array.isArray(cont.value.data) ? cont.value.data : []
  loading.value = false
})

onBeforeUnmount(() => controller.abort())
</script>

<style scoped>
.soi-k {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--soi-ink-soft);
}
.soi-v {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.7rem;
  font-weight: 600;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
}
.soi-mini {
  fill: var(--soi-paper-2);
  stroke: var(--soi-rule);
  stroke-width: 2;
}
.soi-mini.on {
  fill: var(--soi-yellow);
  stroke: var(--soi-yellow-deep);
}
.soi-glance-rl :deep(.soi-rl-label) {
  font-family: 'Source Sans 3', system-ui, sans-serif;
  font-size: 0.78rem;
}
.soi-glance-rl :deep(.soi-rl-code) {
  width: 1.7rem;
  height: 1.7rem;
}
</style>
