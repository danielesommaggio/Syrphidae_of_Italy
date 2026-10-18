<template>
  <div class="soi-dist">
    <ClientOnly>
      <div
        v-if="loading"
        class="min-h-32"
      >
        <VSpinner />
      </div>
    </ClientOnly>

    <template v-if="!loading">
      <!-- ITALY -->
      <VCard class="mb-6">
        <VCardHeader class="border-b border-base-muted">{{ t('italy') }}</VCardHeader>
        <VCardContent>
          <p class="ds-sentence">{{ sentence }}</p>
          <p
            v-if="italyWhole.length"
            class="text-sm mb-3"
          >
            {{ t('wholeItaly') }}
            <CiteChips :list="italyWhole" />
          </p>

          <div class="grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] items-start">
            <!-- map -->
            <div
              class="ds-map"
              @mouseleave="hover = ''"
            >
              <svg
                :viewBox="VIEWBOX"
                class="w-full h-auto block"
                role="img"
                :aria-label="sentence"
              >
                <defs>
                  <pattern
                    id="ds-both"
                    width="14"
                    height="14"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <rect
                      width="14"
                      height="14"
                      class="ds-rec"
                    />
                    <rect
                      width="7"
                      height="14"
                      class="ds-lit"
                    />
                  </pattern>
                </defs>
                <path
                  v-for="r in shapes"
                  :key="r.name"
                  :d="r.d"
                  class="ds-region"
                  :class="[stateOf(r.name), { hot: hover === r.name || picked === r.name, click: records[r.name] }]"
                  @mouseenter="hover = r.name"
                  @click="records[r.name] && (picked = picked === r.name ? '' : r.name)"
                />
              </svg>
              <div
                v-if="hover"
                class="ds-tip"
              >
                <strong>{{ hover }}</strong>
                <span>{{ regionSummary(hover) }}</span>
              </div>
              <p class="ds-legend">
                <span><i class="sw rec" /> {{ t('legRec') }}</span>
                <span><i class="sw lit" /> {{ t('legLit') }}</span>
                <span><i class="sw both" /> {{ t('legBoth') }}</span>
              </p>
            </div>

            <!-- region table -->
            <div class="min-w-0">
              <div
                v-for="g in GROUPS"
                :key="g.key"
                class="mb-4"
              >
                <p class="ds-group">{{ t('g_' + g.key) }}</p>
                <table class="ds-table">
                  <tbody>
                    <template
                      v-for="reg in g.regions"
                      :key="reg"
                    >
                      <tr
                        :class="{ empty: !records[reg] && !lit[reg], hot: hover === reg || picked === reg }"
                        @mouseenter="hover = reg"
                        @mouseleave="hover = ''"
                      >
                        <th scope="row">
                          <i
                            class="sw"
                            :class="stateOf(reg)"
                          />{{ reg }}
                        </th>
                        <td class="ds-rec-cell">
                          <button
                            v-if="records[reg]"
                            type="button"
                            class="ds-count"
                            :aria-expanded="picked === reg"
                            :title="t('listRecords')"
                            @click="picked = picked === reg ? '' : reg"
                          >
                            {{ recLabel(records[reg]) }}
                          </button>
                        </td>
                        <td>
                          <CiteChips
                            v-if="lit[reg]"
                            :list="lit[reg]"
                          />
                          <span
                            v-if="!records[reg] && !lit[reg]"
                            class="ds-muted"
                            >{{ t('none') }}</span
                          >
                        </td>
                      </tr>
                      <!-- the SoI records of the region -->
                      <tr
                        v-if="picked === reg"
                        class="ds-open"
                      >
                        <td colspan="3">
                          <RecordList :records="recordsIn(reg)" />
                          <RouterLink
                            v-if="speciesName"
                            :to="{ path: '/data', query: { species: speciesName, region: reg, view: 'records' } }"
                            class="ds-data-link"
                            >{{ t('onData') }} →</RouterLink
                          >
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <p class="ds-source">{{ t('source') }}</p>
        </VCardContent>
      </VCard>

      <!-- OUTSIDE ITALY -->
      <VCard
        v-if="abroad.length || gbif.countries"
        class="mb-6"
      >
        <VCardHeader class="border-b border-base-muted">{{ t('abroad') }}</VCardHeader>
        <VCardContent>
          <ul
            v-if="abroad.length"
            class="ds-abroad"
          >
            <li
              v-for="c in abroad"
              :key="c.country"
            >
              <span class="ds-country">{{ c.country }}</span>
              <span
                v-if="c.subAreas.length"
                class="ds-muted"
              >
                — {{ c.subAreas.join(', ') }}</span
              >
              <CiteChips
                :list="c.citations"
                class="ml-2"
              />
              <span
                v-if="c.absent"
                class="ds-absent"
                >{{ t('absent') }}</span
              >
            </li>
          </ul>
          <p
            v-if="gbif.countries"
            class="ds-gbif"
          >
            {{ t('gbif', { n: gbif.countries }) }}
            <a
              :href="gbif.url"
              target="_blank"
              rel="noopener"
              class="underline"
              >{{ t('gbifLink') }} ↗</a
            >
          </p>
        </VCardContent>
      </VCard>
    </template>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { makeAPIRequest } from '@/utils'
import { lang, useT } from '@/utils/soiLang.js'
import shapes, { VIEWBOX } from '~/pages/components/Atlas/italyRegions.js'
import { REGION_ALIASES } from '~/pages/components/Atlas/useAtlas.js'
import { regionOf } from '../_shared/italyAreas.js'
import { GBIF, matchTaxon } from '~/pages/components/Gbif/useGbif.js'
import RecordList from '../_shared/RecordList.vue'

const props = defineProps({
  otuId: { type: Number, required: true },
  taxon: { type: Object, required: true }
})

const t = useT({
  en: {
    italy: 'Distribution in Italy',
    abroad: 'Outside Italy',
    recorded: 'Recorded in {n} of 20 Italian regions.',
    recorded1: 'Recorded in 1 of 20 Italian regions.',
    noItaly: 'No Italian record in SoI yet.',
    wholeItaly: 'Reported for Italy without a region:',
    legRec: 'SoI records',
    legLit: 'literature',
    legBoth: 'both',
    g_north: 'North',
    g_centre: 'Centre',
    g_south: 'South',
    g_islands: 'Islands',
    rec1: '1 record',
    recN: '{n} records',
    none: 'no record yet',
    seeRecords: 'See these records on the Data page',
    listRecords: 'List these records',
    onData: 'Filter and download them on the Data page',
    sumRec: '{r}',
    sumLit: 'literature: {c}',
    sumNone: 'no record yet',
    absent: 'absent',
    gbif: 'From GBIF (not SoI data): this taxon is recorded from {n} countries by all GBIF publishers together.',
    gbifLink: 'See the map on GBIF',
    source: 'Source: everything in this box comes from the SoI database in TaxonWorks — "records" are the specimens and literature records entered in SoI (the same records SoI publishes on GBIF); "literature" is the distribution reported in the works cited. Records from other GBIF publishers are not included here; they are counted only in the GBIF line below.'
  },
  it: {
    italy: 'Distribuzione in Italia',
    abroad: 'Fuori dall’Italia',
    recorded: 'Segnalata in {n} regioni italiane su 20.',
    recorded1: 'Segnalata in 1 regione italiana su 20.',
    noItaly: 'Ancora nessun dato italiano in SoI.',
    wholeItaly: 'Segnalata per l’Italia senza indicare la regione:',
    legRec: 'record di SoI',
    legLit: 'letteratura',
    legBoth: 'entrambi',
    g_north: 'Nord',
    g_centre: 'Centro',
    g_south: 'Sud',
    g_islands: 'Isole',
    rec1: '1 record',
    recN: '{n} record',
    none: 'ancora nessun dato',
    seeRecords: 'Vedi questi record nella pagina Dati',
    listRecords: 'Elenca questi record',
    onData: 'Filtrali e scaricali nella pagina Dati',
    sumRec: '{r}',
    sumLit: 'letteratura: {c}',
    sumNone: 'ancora nessun dato',
    absent: 'assente',
    gbif: 'Da GBIF (non dati di SoI): questo taxon è registrato in {n} paesi dall’insieme di tutti i publisher GBIF.',
    gbifLink: 'Vedi la mappa su GBIF',
    source: 'Fonte: tutto ciò che è in questo riquadro proviene dal database di SoI in TaxonWorks — i «record» sono gli esemplari e i dati di letteratura inseriti in SoI (gli stessi che SoI pubblica su GBIF); la «letteratura» è la distribuzione riportata nei lavori citati. I record di altri publisher GBIF non sono inclusi qui; sono contati solo nella riga GBIF qui sotto.'
  }
})

const GROUPS = [
  { key: 'north', regions: ['Piemonte', "Valle d'Aosta", 'Lombardia', 'Trentino-Alto Adige', 'Veneto', 'Friuli-Venezia Giulia', 'Liguria', 'Emilia-Romagna'] },
  { key: 'centre', regions: ['Toscana', 'Umbria', 'Marche', 'Lazio'] },
  { key: 'south', regions: ['Abruzzo', 'Molise', 'Campania', 'Puglia', 'Basilicata', 'Calabria'] },
  { key: 'islands', regions: ['Sicilia', 'Sardegna'] }
]

const fmt = (n) => Number(n).toLocaleString(lang.value === 'it' ? 'it-IT' : 'en-US')
const recLabel = (n) => (n === 1 ? t('rec1') : t('recN', { n: fmt(n) }))

const loading = ref(true)
const dwc = ref([])
const assertions = ref([]) // { region, country, area, absent, citations: [{ short, q, full }] }
const gbif = ref({ countries: 0, url: '' })
const hover = ref('')
const picked = ref('')

// ---------- small component: author–year chips linking to the Bibliography ----------
const CiteChips = defineComponent({
  props: { list: { type: Array, default: () => [] } },
  setup(p) {
    return () =>
      h(
        'span',
        { class: 'ds-chips' },
        p.list.map((c) =>
          h(
            RouterLink,
            { to: { path: '/bibliography', query: { q: c.q } }, class: 'ds-chip', title: c.full },
            () => c.short
          )
        )
      )
  }
})

// ---------- Italy ----------
const ALIAS = new Map()
Object.entries(REGION_ALIASES).forEach(([region, aliases]) => aliases.forEach((a) => ALIAS.set(a.toLowerCase(), region)))

const records = computed(() => {
  const m = {}
  dwc.value.forEach((r) => {
    if (r.country && r.country !== 'Italy') return
    const reg = ALIAS.get(String(r.stateProvince || '').toLowerCase())
    if (reg) m[reg] = (m[reg] || 0) + 1
  })
  return m
})

const dedupe = (list) => {
  const seen = new Set()
  return list.filter((c) => (seen.has(c.short) ? false : seen.add(c.short)))
}
const lit = computed(() => {
  const m = {}
  assertions.value
    .filter((a) => a.region && a.region !== '*' && !a.absent)
    .forEach((a) => (m[a.region] = dedupe([...(m[a.region] || []), ...a.citations])))
  return m
})
const italyWhole = computed(() => dedupe(assertions.value.filter((a) => a.region === '*' && !a.absent).flatMap((a) => a.citations)))

function recordsIn(reg) {
  return dwc.value
    .filter((r) => (!r.country || r.country === 'Italy') && ALIAS.get(String(r.stateProvince || '').toLowerCase()) === reg)
    .sort((a, b) => String(b.eventDate || '').localeCompare(String(a.eventDate || '')))
}

function stateOf(reg) {
  const r = !!records.value[reg]
  const l = !!lit.value[reg]
  return r && l ? 'both' : r ? 'rec' : l ? 'lit' : 'none'
}
const regionCount = computed(() => GROUPS.flatMap((g) => g.regions).filter((reg) => stateOf(reg) !== 'none').length)
const sentence = computed(() => {
  const n = regionCount.value
  if (!n) return t('noItaly')
  return n === 1 ? t('recorded1') : t('recorded', { n })
})
function regionSummary(reg) {
  const parts = []
  if (records.value[reg]) parts.push(recLabel(records.value[reg]))
  if (lit.value[reg]) parts.push(t('sumLit', { c: lit.value[reg].map((c) => c.short).join('; ') }))
  return parts.length ? parts.join(' · ') : t('sumNone')
}

const speciesName = computed(() => {
  const r = dwc.value.find((x) => x.genus && x.specificEpithet)
  return r ? `${r.genus} ${r.specificEpithet}` : ''
})

// ---------- outside Italy ----------
const abroad = computed(() => {
  const by = new Map()
  assertions.value
    .filter((a) => !a.region)
    .forEach((a) => {
      const country = a.parent && a.parent !== 'Earth' ? a.parent : a.area
      if (!by.has(country)) by.set(country, { country, subAreas: [], citations: [], absent: false })
      const c = by.get(country)
      if (a.area !== country && !c.subAreas.includes(a.area)) c.subAreas.push(a.area)
      c.citations = dedupe([...c.citations, ...a.citations])
      if (a.absent) c.absent = true
    })
  return [...by.values()].sort((a, b) => a.country.localeCompare(b.country))
})

// ---------- data ----------
// "Bartsch, Binkiewicz, Rådén & Nasibov, 2009:244" → "Bartsch et al. 2009" (+ search "Bartsch 2009")
function shortCite(body) {
  const m = String(body || '').match(/^(.*?),\s*(\d{4}[a-z]?)/)
  if (!m) return { short: body, q: body }
  const authors = m[1].split(/\s*(?:,|&)\s*/).filter(Boolean)
  const first = authors[0].trim()
  const who = authors.length > 2 ? `${first} et al.` : authors.length === 2 ? `${first} & ${authors[1].trim()}` : first
  return { short: `${who} ${m[2]}`, q: `${first} ${m[2].slice(0, 4)}` }
}

async function loadAssertions() {
  const { data } = await makeAPIRequest.get('/asserted_distributions', {
    params: { 'taxon_name_id[]': props.taxon.id, descendants: true, per: 500 }
  })
  const rows = Array.isArray(data) ? data : []
  const cites = new Map()
  if (rows.length) {
    const p = new URLSearchParams({ citation_object_type: 'AssertedDistribution', per: '1000' })
    rows.forEach((r) => p.append('citation_object_id[]', r.id))
    p.append('extend[]', 'source')
    try {
      const { data: cs } = await makeAPIRequest.get(`/citations?${p}`)
      ;(cs || []).forEach((c) => {
        const s = shortCite(c.citation_source_body)
        const full = String(c.source?.cached || c.citation_source_body || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')
        if (!cites.has(c.citation_object_id)) cites.set(c.citation_object_id, [])
        cites.get(c.citation_object_id).push({ ...s, full })
      })
    } catch {
      /* chips stay empty */
    }
  }
  assertions.value = rows.map((r) => {
    const shape = r.asserted_distribution_shape || {}
    const area = shape.name || ''
    const parent = shape.parent?.name || 'Earth'
    return {
      area,
      parent,
      region: regionOf(area) || (regionOf(parent) && regionOf(parent) !== '*' ? regionOf(parent) : null),
      absent: !!r.is_absent,
      citations: cites.get(r.id) || []
    }
  })
}

async function loadGbif() {
  const name = props.taxon.expanded_name || props.taxon.cached || props.taxon.name
  const key = await matchTaxon(name)
  if (!key) return
  try {
    const r = await fetch(`${GBIF.api}/occurrence/search?taxonKey=${key}&limit=0&facet=country&facetLimit=300`)
    const d = await r.json()
    const n = d.facets?.[0]?.counts?.length || 0
    gbif.value = { countries: n, url: `${GBIF.site}/occurrence/search?taxon_key=${key}&view=MAP` }
  } catch {
    /* no GBIF line */
  }
}

onMounted(async () => {
  await Promise.allSettled([
    makeAPIRequest.get(`/otus/${props.otuId}/inventory/dwc.json`).then(({ data }) => (dwc.value = Array.isArray(data) ? data : [])),
    loadAssertions()
  ])
  loading.value = false
  loadGbif()
})
</script>

<style scoped>
.soi-dist {
  --ds-rec: var(--soi-olive, #4f5d2f);
  --ds-lit: var(--soi-yellow, #f0b81f);
  --ds-none: var(--soi-rule, #ddd4bf);
  --ds-rule: var(--soi-rule, #ddd4bf);
  --ds-ink: var(--soi-ink, #22281c);
  --ds-muted: var(--soi-ink-soft, #5b5e4c);
}
.ds-sentence {
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: var(--ds-ink);
}
.ds-muted {
  color: var(--ds-muted);
}
.ds-map {
  position: relative;
  max-width: 18rem;
}
.ds-region {
  stroke: var(--soi-card, #fffdf8);
  stroke-width: 1.5;
  stroke-linejoin: round;
  transition: opacity 0.15s;
}
.ds-region.none {
  fill: var(--ds-none);
}
.ds-region.rec,
.ds-rec {
  fill: var(--ds-rec);
}
.ds-region.lit,
.ds-lit {
  fill: var(--ds-lit);
}
.ds-region.both {
  fill: url(#ds-both);
}
.ds-region.click {
  cursor: pointer;
}
.ds-region.hot {
  stroke: var(--ds-ink);
  stroke-width: 3;
}
.ds-tip {
  position: absolute;
  left: 0.5rem;
  top: 0.5rem;
  z-index: 5;
  max-width: 14rem;
  padding: 0.35rem 0.6rem;
  border-radius: 4px;
  background: var(--ds-ink);
  color: var(--soi-paper, #faf7ef);
  font-size: 0.75rem;
  line-height: 1.4;
  pointer-events: none;
}
.ds-tip strong {
  display: block;
}
.ds-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.9rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--ds-muted);
}
.sw {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  margin-right: 0.35rem;
  vertical-align: -1px;
  border-radius: 2px;
  border: 1px solid var(--ds-rule);
  background: var(--ds-none);
}
.sw.rec {
  background: var(--ds-rec);
  border-color: var(--ds-rec);
}
.sw.lit {
  background: var(--ds-lit);
  border-color: var(--ds-lit);
}
.sw.both {
  background: repeating-linear-gradient(135deg, var(--ds-rec) 0 3px, var(--ds-lit) 3px 6px);
  border-color: var(--ds-rec);
}
.ds-group {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ds-muted);
  margin-bottom: 0.2rem;
}
.ds-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.ds-table th,
.ds-table td {
  padding: 0.3rem 0.4rem;
  border-bottom: 1px solid var(--ds-rule);
  text-align: left;
  vertical-align: top;
}
.ds-table th {
  width: 12rem;
  font-weight: 600;
  white-space: nowrap;
}
.ds-rec-cell {
  width: 7rem;
  white-space: nowrap;
}
.ds-table tr.empty th {
  font-weight: 400;
  color: var(--ds-muted);
}
.ds-table tr.hot {
  background: var(--soi-paper-2, #f2ecdd);
}
.ds-open td {
  padding: 0.5rem 0.6rem 0.7rem 1.4rem;
  background: var(--soi-paper-2, #f2ecdd);
  font-size: 0.82rem;
}
.ds-data-link {
  display: inline-block;
  margin-top: 0.5rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.ds-count {
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.ds-abroad {
  display: grid;
  gap: 0.45rem;
  font-size: 0.9rem;
}
.ds-country {
  font-weight: 600;
}
.ds-absent {
  margin-left: 0.4rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--soi-terra, #b4532f);
}
.ds-source {
  margin-top: 0.4rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--ds-rule);
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--ds-muted);
}
.ds-gbif {
  margin-top: 0.9rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--ds-rule);
  font-size: 0.85rem;
  color: var(--ds-muted);
}
:deep(.ds-chips) {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  vertical-align: middle;
}
:deep(.ds-chip) {
  padding: 0.05rem 0.5rem;
  border: 1px solid var(--ds-rule);
  border-radius: 999px;
  font-size: 0.75rem;
  white-space: nowrap;
  color: var(--ds-ink);
}
:deep(.ds-chip:hover) {
  border-color: var(--ds-ink);
}
</style>
