<template>
  <div class="soi min-h-screen">
    <SoiMasthead
      :eyebrow="t('eyebrow')"
      :title="t('title')"
      :lede="t('lede')"
    />

    <section class="container mx-auto box-border px-4 py-10 sm:py-14">
      <!-- Same data as the GBIF dataset -->
      <div class="dt-gbif mb-6">
        <span
          class="dt-gbif-mark"
          aria-hidden="true"
          ><GbifLogoIcon
        /></span>
        <p class="flex-1 min-w-0 text-sm leading-relaxed">
          <strong>{{ t('gbifTitle') }}</strong>
          {{ t('gbifText') }}
          <template v-if="gbif.updated">{{ t('gbifUpdated', { d: fmtDate(gbif.updated, isIt) }) }}</template>
        </p>
        <div class="flex flex-wrap gap-2">
          <a
            :href="LINKS.occurrences"
            target="_blank"
            rel="noopener"
            class="soi-btn soi-btn-ink !py-1.5 !px-3.5 text-sm"
            >{{ t('gbifOpen') }} ↗</a
          >
          <a
            :href="LINKS.dataset"
            target="_blank"
            rel="noopener"
            class="soi-btn soi-btn-line !py-1.5 !px-3.5 text-sm"
            >{{ t('gbifDataset') }} ↗</a
          >
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="s in stats"
          :key="s.key"
          class="soi-card p-5"
        >
          <p class="soi-eyebrow">{{ s.label }}</p>
          <p class="soi-serif mt-1 text-3xl font-semibold tabular-nums">
            <span :class="{ 'soi-skel': !loaded }">{{ loaded ? s.value : '0000' }}</span>
          </p>
        </div>
      </div>

      <!-- Search -->
      <form
        class="soi-search mt-8"
        role="search"
        @submit.prevent
      >
        <svg
          viewBox="0 0 24 24"
          class="w-5 h-5 shrink-0 soi-muted"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M10 4a6 6 0 1 0 3.7 10.7l4.8 4.8 1.4-1.4-4.8-4.8A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
          />
        </svg>
        <input
          v-model="q"
          type="search"
          class="flex-1 min-w-0 py-2"
          :placeholder="t('searchPh')"
          :aria-label="t('searchPh')"
        />
        <span
          v-if="loaded"
          class="hidden sm:inline pr-3 text-sm soi-muted tabular-nums whitespace-nowrap"
          >{{ t('countOf', { n: fmt(filtered.length), total: fmt(scoped.length) }) }}</span
        >
      </form>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <div
          class="dt-seg"
          role="group"
          :aria-label="t('scope')"
        >
          <button
            type="button"
            :class="{ on: italyOnly }"
            :aria-pressed="italyOnly"
            @click="italyOnly = true"
          >
            {{ t('italy') }}
          </button>
          <button
            type="button"
            :class="{ on: !italyOnly }"
            :aria-pressed="!italyOnly"
            @click="italyOnly = false"
          >
            {{ t('everywhere') }}
          </button>
        </div>
        <button
          v-for="a in active"
          :key="a.key"
          type="button"
          class="dt-pill"
          :title="t('remove')"
          @click="clear(a.key)"
        >
          {{ a.label }} <span aria-hidden="true">×</span>
        </button>
        <button
          v-if="active.length"
          type="button"
          class="soi-link text-sm"
          @click="clearAll"
        >
          {{ t('clearAll') }}
        </button>
      </div>

      <p
        v-if="!loaded"
        class="mt-10 soi-muted"
      >
        {{ progress.total ? t('loadingN', { n: fmt(progress.n), total: fmt(progress.total) }) : t('loading') }}
      </p>
      <p
        v-else-if="failed"
        class="mt-10 soi-card p-6 soi-muted"
      >
        {{ t('failed') }}
      </p>

      <div
        v-else
        class="mt-8 grid lg:grid-cols-12 gap-8"
      >
        <!-- Filters -->
        <aside class="lg:col-span-3 min-w-0">
          <button
            type="button"
            class="dt-toggle lg:hidden"
            :aria-expanded="showFilters"
            @click="showFilters = !showFilters"
          >
            {{ showFilters ? t('hideFilters') : t('showFilters') }}
          </button>
          <div :class="['space-y-7', { 'hidden lg:block': !showFilters }]">
            <div v-if="italyOnly">
              <p class="dt-legend">{{ t('region') }}</p>
              <AtlasMap
                :counts="regionCounts"
                :selected="sel.region || null"
                @select="(r) => setFacet('region', r)"
              />
            </div>

            <div>
              <p class="dt-legend">{{ t('season') }}</p>
              <SeasonBars
                :values="monthCounts"
                :height="90"
              />
            </div>

            <fieldset
              v-for="f in shownFacets"
              v-show="facetValues(f.key).length"
              :key="f.key"
              class="dt-facet"
            >
              <legend class="dt-legend">{{ t('f_' + f.key) }}</legend>
              <ul>
                <li
                  v-for="v in facetValues(f.key).slice(0, open[f.key] ? 400 : 8)"
                  :key="v.name"
                >
                  <button
                    type="button"
                    :class="{ on: sel[f.key] === v.name }"
                    :aria-pressed="sel[f.key] === v.name"
                    @click="setFacet(f.key, v.name)"
                  >
                    <span class="truncate"
                      ><i v-if="f.italic">{{ v.name }}</i
                      ><template v-else>{{ valueLabel(f.key, v.name) }}</template></span
                    >
                    <span class="tabular-nums">{{ fmt(v.n) }}</span>
                  </button>
                </li>
              </ul>
              <button
                v-if="facetValues(f.key).length > 8"
                type="button"
                class="dt-more"
                @click="open[f.key] = !open[f.key]"
              >
                {{ open[f.key] ? t('fewer') : t('allN', { n: facetValues(f.key).length }) }}
              </button>
            </fieldset>

            <fieldset
              v-if="yearSpan"
              class="dt-facet"
            >
              <legend class="dt-legend">{{ t('years') }}</legend>
              <div class="flex items-center gap-2 text-sm">
                <input
                  v-model.number="from"
                  type="number"
                  :min="yearSpan[0]"
                  :max="yearSpan[1]"
                  :placeholder="String(yearSpan[0])"
                  :aria-label="t('fromYear')"
                  class="dt-year"
                />
                <span>–</span>
                <input
                  v-model.number="to"
                  type="number"
                  :min="yearSpan[0]"
                  :max="yearSpan[1]"
                  :placeholder="String(yearSpan[1])"
                  :aria-label="t('toYear')"
                  class="dt-year"
                />
              </div>
            </fieldset>

            <fieldset class="dt-facet">
              <legend class="dt-legend">{{ t('only') }}</legend>
              <label class="dt-check">
                <input
                  v-model="onlyMapped"
                  type="checkbox"
                />
                {{ t('mapped') }}
              </label>
              <label class="dt-check">
                <input
                  v-model="onlyTypes"
                  type="checkbox"
                />
                {{ t('types') }}
              </label>
            </fieldset>
          </div>
        </aside>

        <!-- Results -->
        <div class="lg:col-span-9 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div
              class="dt-seg"
              role="tablist"
            >
              <button
                v-for="v in VIEWS"
                :key="v"
                type="button"
                role="tab"
                :aria-selected="view === v"
                :class="{ on: view === v }"
                @click="view = v"
              >
                {{ t('view_' + v, { n: fmt(v === 'species' ? speciesRows.length : v === 'map' ? points.length : filtered.length) }) }}
              </button>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm">
              <label
                v-if="view !== 'map'"
                class="flex items-center gap-2"
              >
                {{ t('sort') }}
                <select
                  v-model="sort"
                  class="dt-select"
                >
                  <option value="name">{{ t('sortName') }}</option>
                  <option value="count">{{ view === 'species' ? t('sortCount') : t('sortRegion') }}</option>
                  <option value="new">{{ t('sortNew') }}</option>
                  <option value="old">{{ t('sortOld') }}</option>
                </select>
              </label>
              <button
                type="button"
                class="soi-link"
                :disabled="!filtered.length"
                @click="download"
              >
                {{ t('csv') }}
              </button>
              <button
                type="button"
                class="soi-link"
                @click="copyLink"
              >
                {{ copied ? t('linkCopied') : t('copyLink') }}
              </button>
            </div>
          </div>

          <p
            v-if="!filtered.length"
            class="soi-card p-6 soi-muted"
          >
            {{ t('none') }}
          </p>

          <!-- Species -->
          <template v-else-if="view === 'species'">
            <div class="dt-table-wrap">
              <table class="dt-table">
                <thead>
                  <tr>
                    <th>{{ t('colSpecies') }}</th>
                    <th class="text-right">{{ t('colRecords') }}</th>
                    <th>{{ t('colRegions') }}</th>
                    <th>{{ t('colYears') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="s in speciesSorted.slice(0, limit)"
                    :key="s.name"
                  >
                    <td>
                      <component
                        :is="s.otu ? 'RouterLink' : 'span'"
                        :to="s.otu ? { name: 'otus-id-overview', params: { id: s.otu } } : undefined"
                        class="dt-name"
                        ><i v-if="s.italic">{{ s.name }}</i
                        ><template v-else>{{ s.name }}</template></component
                      >
                      <span class="block text-xs soi-muted">{{ s.subfamily }}</span>
                    </td>
                    <td class="text-right">
                      <button
                        type="button"
                        class="dt-count"
                        :title="t('seeRecords')"
                        @click="showRecordsOf(s)"
                      >
                        {{ fmt(s.n) }}
                      </button>
                    </td>
                    <td class="text-sm">
                      <span
                        v-if="italyOnly"
                        :title="s.regions.join(', ')"
                        >{{ s.regions.length ? s.regions.slice(0, 4).join(', ') + (s.regions.length > 4 ? ` +${s.regions.length - 4}` : '') : '—' }}</span
                      >
                      <span v-else>{{ s.countries.slice(0, 4).join(', ') + (s.countries.length > 4 ? ` +${s.countries.length - 4}` : '') || '—' }}</span>
                    </td>
                    <td class="text-sm whitespace-nowrap tabular-nums">
                      {{ s.first ? (s.first === s.last ? s.first : `${s.first}–${s.last}`) : '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-if="speciesSorted.length > limit"
              class="mt-5 text-center"
            >
              <button
                type="button"
                class="soi-btn soi-btn-line"
                @click="limit += 100"
              >
                {{ t('more', { n: fmt(speciesSorted.length - limit) }) }}
              </button>
            </div>
          </template>

          <!-- Map -->
          <template v-else-if="view === 'map'">
            <ClientOnly>
              <SoiPointMap
                :points="points"
                :label="t('mapLabel')"
              />
            </ClientOnly>
            <p class="mt-2 text-xs soi-muted">{{ t('mapNote', { n: fmt(points.length), total: fmt(filtered.length) }) }}</p>
          </template>

          <!-- Records -->
          <template v-else>
            <div class="dt-table-wrap">
              <table class="dt-table">
                <thead>
                  <tr>
                    <th>{{ t('colSpecies') }}</th>
                    <th>{{ t('colWhere') }}</th>
                    <th>{{ t('colWhen') }}</th>
                    <th>{{ t('colWho') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in recordsSorted.slice(0, limit)"
                    :key="r.id"
                  >
                    <td>
                      <component
                        :is="r.otu ? 'RouterLink' : 'span'"
                        :to="r.otu ? { name: 'otus-id-overview', params: { id: r.otu } } : undefined"
                        class="dt-name"
                        ><i v-if="r.italic">{{ r.name }}</i
                        ><template v-else>{{ r.name }}</template></component
                      >
                      <span
                        v-if="r.type"
                        class="dt-badge type"
                        :title="r.type"
                        >{{ r.type.split(' ')[0] }}</span
                      >
                      <span
                        v-if="r.basis === 'literature'"
                        class="dt-badge"
                        :title="plainRef(r.refs)"
                        >{{ t('b_literature') }}</span
                      >
                      <span class="block text-xs soi-muted">
                        {{ [r.sex && valueLabel('sex', r.sex), r.inst, r.cat].filter(Boolean).join(' · ') }}
                        <button
                          v-if="isSpecimen(r)"
                          type="button"
                          class="dt-rec-link"
                          :title="t('details')"
                          @click="openDetails(r)"
                        >
                          {{ t('recordLink') }} ⓘ
                        </button>
                        <button
                          v-if="r.raw.occurrenceID"
                          type="button"
                          class="dt-gbif-link"
                          :title="t('onGbifTitle')"
                          @click="openRecordOnGbif(r.raw.occurrenceID)"
                        >
                          GBIF ↗
                        </button>
                      </span>
                    </td>
                    <td class="text-sm">
                      {{ r.where || '—' }}
                      <span
                        v-if="r.locality"
                        class="block text-xs soi-muted dt-clip"
                        :title="r.locality"
                        >{{ r.locality }}<template v-if="r.elev !== null"> · {{ fmt(r.elev) }} m</template></span
                      >
                    </td>
                    <td class="text-sm whitespace-nowrap tabular-nums">{{ r.date || '—' }}</td>
                    <td class="text-sm">{{ r.collector || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-if="recordsSorted.length > limit"
              class="mt-5 text-center"
            >
              <button
                type="button"
                class="soi-btn soi-btn-line"
                @click="limit += 100"
              >
                {{ t('more', { n: fmt(recordsSorted.length - limit) }) }}
              </button>
            </div>
          </template>

          <!-- How to cite -->
          <div class="soi-card p-5 sm:p-6 mt-10 grid sm:grid-cols-[1fr_auto] gap-4 items-start">
            <div>
              <p class="soi-eyebrow">{{ t('citeEyebrow') }}</p>
              <p class="mt-2 text-sm leading-relaxed">{{ t('citeText') }}</p>
              <p class="mt-3 text-sm leading-relaxed dt-cite">{{ citation }}</p>
            </div>
            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="soi-btn soi-btn-ink justify-center"
                @click="copyCitation"
              >
                {{ citeCopied ? t('copied') : t('copyCite') }}
              </button>
              <a
                :href="LINKS.doi"
                target="_blank"
                rel="noopener"
                class="soi-btn soi-btn-line justify-center"
                >DOI ↗</a
              >
            </div>
          </div>
        </div>
      </div>
    </section>
    <DwcTable ref="dwcTableRef" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import AtlasMap from './components/Atlas/AtlasMap.vue'
import SeasonBars from './components/Atlas/SeasonBars.vue'
import SoiPointMap from './components/Data/SoiPointMap.vue'
import DwcTable from '~/panels/_shared/DwcTable.vue'
import GbifLogoIcon from './components/GbifCitation/components/GbifLogoIcon.vue'
import { LINKS, datasetCitation, fmtDate, openRecordOnGbif, useGbif } from './components/Gbif/useGbif.js'
import { downloadCsv, fetchOccurrences } from './components/Data/useOccurrences.js'
import { isIt, useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    eyebrow: 'Data',
    title: 'Every hoverfly record in SoI',
    lede: 'Specimens and literature records behind the atlas: filter by species, region, year or collection, see them on a map, and download them in Darwin Core.',
    sRecords: 'Records',
    sSpecies: 'Species',
    sMapped: 'With coordinates',
    sSpan: 'Years',
    searchPh: 'Species, locality, collector, collection or catalog number…',
    countOf: '{n} of {total} records',
    scope: 'Where',
    italy: 'Italy',
    everywhere: 'All countries',
    remove: 'Remove this filter',
    clearAll: 'Clear all',
    loading: 'Loading the records…',
    loadingN: 'Loading the records… {n} of {total}',
    failed: 'The records could not be loaded. Please try again later.',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',
    region: 'Region',
    season: 'Records per month',
    f_subfamily: 'Subfamily',
    f_genus: 'Genus',
    f_species: 'Species',
    f_region: 'Region',
    f_country: 'Country',
    f_inst: 'Collection',
    f_collector: 'Collector',
    f_basis: 'Kind of record',
    f_sex: 'Sex',
    b_specimen: 'Specimen',
    b_literature: 'Literature',
    s_female: 'Female',
    s_male: 'Male',
    fewer: 'Fewer',
    allN: 'All {n}',
    years: 'Year collected',
    fromYear: 'From year',
    toYear: 'To year',
    only: 'Show only',
    mapped: 'With coordinates',
    types: 'Type specimens',
    view_species: 'Species ({n})',
    view_records: 'Records ({n})',
    view_map: 'Map ({n})',
    sort: 'Sort',
    sortName: 'Name',
    sortCount: 'Most records',
    sortRegion: 'Region',
    sortNew: 'Newest',
    sortOld: 'Oldest',
    csv: 'Download CSV (Darwin Core)',
    copyLink: 'Copy link to this search',
    linkCopied: 'Link copied ✓',
    none: 'No records match. Try fewer filters or another spelling.',
    colSpecies: 'Species',
    colRecords: 'Records',
    colRegions: 'Where',
    colYears: 'Years',
    colWhere: 'Where',
    colWhen: 'When',
    colWho: 'Collector',
    seeRecords: 'See these records',
    more: 'Show more ({n} left)',
    mapLabel: 'Map of the filtered records',
    mapNote: '{n} of {total} records have coordinates. Click a cluster to zoom in, a point for the record.',
    gbifTitle: 'Published on GBIF.',
    gbifText: 'These are the records of the SoI occurrence dataset on GBIF (doi:10.15468/faryxm), read live from our TaxonWorks database; GBIF refreshes its copy automatically.',
    gbifUpdated: 'Last update on GBIF: {d}.',
    gbifOpen: 'Open on GBIF',
    gbifDataset: 'Dataset page',
    onGbif: 'View on GBIF',
    details: 'Full record',
    recordLink: 'Record',
    onGbifTitle: 'Open this record on GBIF',
    citeEyebrow: 'How to cite these data',
    citeText: 'If you use these records, please cite the SoI occurrence dataset (as GBIF does), with the date of your download:',
    copyCite: 'Copy citation',
    copied: 'Copied ✓',
    yearsVal: '{a}–{b}',
    rangeChip: 'Years {a}–{b}'
  },
  it: {
    eyebrow: 'Dati',
    title: 'Tutti i record di sirfidi in SoI',
    lede: 'Esemplari e dati di letteratura dietro l’atlante: filtra per specie, regione, anno o collezione, guardali su una mappa e scaricali in Darwin Core.',
    sRecords: 'Record',
    sSpecies: 'Specie',
    sMapped: 'Con coordinate',
    sSpan: 'Anni',
    searchPh: 'Specie, località, raccoglitore, collezione o numero di catalogo…',
    countOf: '{n} di {total} record',
    scope: 'Dove',
    italy: 'Italia',
    everywhere: 'Tutti i paesi',
    remove: 'Togli questo filtro',
    clearAll: 'Togli tutti',
    loading: 'Caricamento dei record…',
    loadingN: 'Caricamento dei record… {n} di {total}',
    failed: 'Non è stato possibile caricare i record. Riprova più tardi.',
    showFilters: 'Mostra i filtri',
    hideFilters: 'Nascondi i filtri',
    region: 'Regione',
    season: 'Record per mese',
    f_subfamily: 'Sottofamiglia',
    f_genus: 'Genere',
    f_species: 'Specie',
    f_region: 'Regione',
    f_country: 'Paese',
    f_inst: 'Collezione',
    f_collector: 'Raccoglitore',
    f_basis: 'Tipo di record',
    f_sex: 'Sesso',
    b_specimen: 'Esemplare',
    b_literature: 'Letteratura',
    s_female: 'Femmina',
    s_male: 'Maschio',
    fewer: 'Meno',
    allN: 'Tutti i {n}',
    years: 'Anno di raccolta',
    fromYear: 'Dall’anno',
    toYear: 'All’anno',
    only: 'Mostra solo',
    mapped: 'Con coordinate',
    types: 'Esemplari tipici',
    view_species: 'Specie ({n})',
    view_records: 'Record ({n})',
    view_map: 'Mappa ({n})',
    sort: 'Ordina',
    sortName: 'Nome',
    sortCount: 'Più record',
    sortRegion: 'Regione',
    sortNew: 'Più recenti',
    sortOld: 'Più vecchi',
    csv: 'Scarica CSV (Darwin Core)',
    copyLink: 'Copia il link a questa ricerca',
    linkCopied: 'Link copiato ✓',
    none: 'Nessun record corrisponde. Prova con meno filtri o un’altra grafia.',
    colSpecies: 'Specie',
    colRecords: 'Record',
    colRegions: 'Dove',
    colYears: 'Anni',
    colWhere: 'Dove',
    colWhen: 'Quando',
    colWho: 'Raccoglitore',
    seeRecords: 'Vedi questi record',
    more: 'Mostra altri ({n} rimanenti)',
    mapLabel: 'Mappa dei record filtrati',
    mapNote: '{n} record su {total} hanno coordinate. Clicca un gruppo per ingrandire, un punto per il record.',
    gbifTitle: 'Pubblicati su GBIF.',
    gbifText: 'Questi sono i record del dataset di occorrenze di SoI su GBIF (doi:10.15468/faryxm), letti in tempo reale dal nostro database TaxonWorks; GBIF aggiorna la sua copia automaticamente.',
    gbifUpdated: 'Ultimo aggiornamento su GBIF: {d}.',
    gbifOpen: 'Apri su GBIF',
    gbifDataset: 'Pagina del dataset',
    onGbif: 'Vedi su GBIF',
    details: 'Record completo',
    recordLink: 'Record',
    onGbifTitle: 'Apri questo record su GBIF',
    citeEyebrow: 'Come citare questi dati',
    citeText: 'Se usi questi record, cita il dataset di occorrenze di SoI (come fa GBIF), con la data del download:',
    copyCite: 'Copia la citazione',
    copied: 'Copiato ✓',
    yearsVal: '{a}–{b}',
    rangeChip: 'Anni {a}–{b}'
  }
})

useHead({ title: () => `${t('eyebrow')} — Syrphidae of Italy` })

const FACETS = [
  { key: 'subfamily' },
  { key: 'genus', italic: true },
  { key: 'species', italic: true },
  { key: 'region', italyOnly: true },
  { key: 'country', worldOnly: true },
  { key: 'inst' },
  { key: 'collector' },
  { key: 'basis' },
  { key: 'sex' }
]
const VIEWS = ['species', 'records', 'map']
const SORTS = ['name', 'count', 'new', 'old']

const route = useRoute()
const router = useRouter()

const all = ref([])
const loaded = ref(false)
const failed = ref(false)
const progress = reactive({ n: 0, total: 0 })

const q = ref(String(route.query.q || ''))
const sel = reactive(Object.fromEntries(FACETS.map((f) => [f.key, String(route.query[f.key] || '')])))
const italyOnly = ref(route.query.scope !== 'all')
const from = ref(route.query.from ? Number(route.query.from) : null)
const to = ref(route.query.to ? Number(route.query.to) : null)
const onlyMapped = ref(route.query.mapped === '1')
const onlyTypes = ref(route.query.types === '1')
const view = ref(VIEWS.includes(route.query.view) ? String(route.query.view) : 'species')
const sort = ref(SORTS.includes(route.query.sort) ? String(route.query.sort) : 'name')
const limit = ref(100)
const open = reactive({})
const showFilters = ref(false)
const copied = ref(false)
const citeCopied = ref(false)

const locale = computed(() => (isIt.value ? 'it-IT' : 'en-US'))
const fmt = (n) => Number(n).toLocaleString(locale.value)

onMounted(async () => {
  try {
    all.value = await fetchOccurrences((n, total) => Object.assign(progress, { n, total: total || 0 }))
  } catch {
    failed.value = true
  } finally {
    loaded.value = true
  }
})

// Italy-only or everywhere
const scoped = computed(() => (italyOnly.value ? all.value.filter((r) => r.country === 'Italy') : all.value))
const shownFacets = computed(() => FACETS.filter((f) => !(f.italyOnly && !italyOnly.value) && !(f.worldOnly && italyOnly.value) && !(f.key === 'region')))

const stats = computed(() => {
  const rs = scoped.value
  const ys = rs.map((r) => r.year).filter(Boolean)
  return [
    { key: 'r', label: t('sRecords'), value: fmt(rs.length) },
    { key: 's', label: t('sSpecies'), value: fmt(new Set(rs.map((r) => r.species).filter(Boolean)).size) },
    { key: 'm', label: t('sMapped'), value: fmt(rs.filter((r) => r.lat !== null).length) },
    { key: 'y', label: t('sSpan'), value: ys.length ? t('yearsVal', { a: Math.min(...ys), b: Math.max(...ys) }) : '—' }
  ]
})

const yearSpan = computed(() => {
  const ys = scoped.value.map((r) => r.year).filter(Boolean)
  return ys.length ? [Math.min(...ys), Math.max(...ys)] : null
})

// ---------- filtering ----------
const valuesOf = (r, key) => (key === 'collector' ? r.collectors : [r[key]])

function matches(r, except) {
  const terms = q.value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (terms.length && !terms.every((w) => r.text.includes(w))) return false
  for (const f of FACETS) {
    if (f.key === except || !sel[f.key]) continue
    if ((f.italyOnly && !italyOnly.value) || (f.worldOnly && italyOnly.value)) continue
    if (!valuesOf(r, f.key).includes(sel[f.key])) return false
  }
  if (from.value && (!r.year || r.year < from.value)) return false
  if (to.value && (!r.year || r.year > to.value)) return false
  if (onlyMapped.value && r.lat === null) return false
  if (onlyTypes.value && !r.type) return false
  return true
}

const filtered = computed(() => scoped.value.filter((r) => matches(r)))

function facetValues(key) {
  const m = new Map()
  scoped.value
    .filter((r) => matches(r, key))
    .forEach((r) => valuesOf(r, key).forEach((v) => v && m.set(v, (m.get(v) || 0) + 1)))
  return [...m.entries()].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
}

const regionCounts = computed(() => {
  const m = {}
  scoped.value.filter((r) => r.region && matches(r, 'region')).forEach((r) => (m[r.region] = (m[r.region] || 0) + 1))
  // AtlasMap expects { region: { records } } for every region
  return Object.fromEntries(
    ['Piemonte', "Valle d'Aosta", 'Liguria', 'Lombardia', 'Trentino-Alto Adige', 'Veneto', 'Friuli-Venezia Giulia', 'Emilia-Romagna', 'Marche', 'Toscana', 'Umbria', 'Lazio', 'Campania', 'Abruzzo', 'Molise', 'Puglia', 'Basilicata', 'Calabria', 'Sicilia', 'Sardegna'].map((n) => [n, { records: m[n] || 0 }])
  )
})

const monthCounts = computed(() => {
  const m = Array(12).fill(0)
  filtered.value.forEach((r) => r.month && m[r.month - 1]++)
  return m
})

function valueLabel(key, v) {
  if (key === 'basis') return t('b_' + v)
  if (key === 'sex') return ['female', 'male'].includes(v) ? t('s_' + v) : v
  return v
}

// ---------- species summary ----------
const speciesRows = computed(() => {
  const m = new Map()
  filtered.value.forEach((r) => {
    const key = r.species || r.name
    let s = m.get(key)
    if (!s) m.set(key, (s = { name: key, italic: r.italic, otu: r.otu, subfamily: r.subfamily, n: 0, regions: new Set(), countries: new Set(), first: null, last: null }))
    s.n++
    if (!s.otu && r.otu) s.otu = r.otu
    if (r.region) s.regions.add(r.region)
    if (r.country) s.countries.add(r.country)
    if (r.year) {
      s.first = s.first ? Math.min(s.first, r.year) : r.year
      s.last = s.last ? Math.max(s.last, r.year) : r.year
    }
  })
  return [...m.values()].map((s) => ({ ...s, regions: [...s.regions].sort(), countries: [...s.countries].sort() }))
})

const speciesSorted = computed(() => {
  const list = speciesRows.value.slice()
  const byName = (a, b) => a.name.localeCompare(b.name)
  if (sort.value === 'count') return list.sort((a, b) => b.n - a.n || byName(a, b))
  if (sort.value === 'new') return list.sort((a, b) => (b.last || 0) - (a.last || 0) || byName(a, b))
  if (sort.value === 'old') return list.sort((a, b) => (a.first || 9999) - (b.first || 9999) || byName(a, b))
  return list.sort(byName)
})

const recordsSorted = computed(() => {
  const list = filtered.value.slice()
  const byName = (a, b) => a.name.localeCompare(b.name) || String(a.date).localeCompare(String(b.date))
  if (sort.value === 'count') return list.sort((a, b) => (a.where ? 0 : 1) - (b.where ? 0 : 1) || a.where.localeCompare(b.where) || byName(a, b))
  if (sort.value === 'new') return list.sort((a, b) => String(b.date).localeCompare(String(a.date)) || byName(a, b))
  if (sort.value === 'old') return list.sort((a, b) => (a.date ? 0 : 1) - (b.date ? 0 : 1) || String(a.date).localeCompare(String(b.date)) || byName(a, b))
  return list.sort(byName)
})

function showRecordsOf(s) {
  if (s.name.includes(' ')) sel.species = s.name
  else sel.genus = s.name
  view.value = 'records'
  sort.value = 'new'
}

// ---------- map ----------
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const plainRef = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')
const points = computed(() =>
  filtered.value
    .filter((r) => r.lat !== null)
    .map((r) => {
      const href = r.otu ? router.resolve({ name: 'otus-id-overview', params: { id: r.otu } }).href : ''
      const name = r.italic ? `<i>${esc(r.name)}</i>` : esc(r.name)
      return {
        lat: r.lat,
        lng: r.lng,
        html: [
          `<b>${href ? `<a href="${href}">${name}</a>` : name}</b>`,
          esc([r.locality, r.where].filter(Boolean).join(', ')),
          esc([r.date, r.collector].filter(Boolean).join(' · ')),
          esc([r.inst, r.cat].filter(Boolean).join(' ')),
          [
            isSpecimen(r) ? `<a href="#" data-soi-rec="${esc(r.raw.dwc_occurrence_object_type)}:${esc(r.raw.dwc_occurrence_object_id)}">${esc(t('details'))} ⓘ</a>` : '',
            r.raw.occurrenceID ? `<a href="#" data-gbif-occ="${esc(r.raw.occurrenceID)}">${esc(t('onGbif'))} ↗</a>` : ''
          ]
            .filter(Boolean)
            .join(' · ')
        ]
          .filter(Boolean)
          .join('<br>')
      }
    })
)

// ---------- active filters & address ----------
const active = computed(() => [
  ...FACETS.filter((f) => sel[f.key] && !(f.italyOnly && !italyOnly.value) && !(f.worldOnly && italyOnly.value)).map((f) => ({
    key: f.key,
    label: `${t('f_' + f.key)}: ${valueLabel(f.key, sel[f.key])}`
  })),
  ...(q.value.trim() ? [{ key: 'q', label: `“${q.value.trim()}”` }] : []),
  ...(from.value || to.value ? [{ key: 'years', label: t('rangeChip', { a: from.value || '…', b: to.value || '…' }) }] : []),
  ...(onlyMapped.value ? [{ key: 'mapped', label: t('mapped') }] : []),
  ...(onlyTypes.value ? [{ key: 'types', label: t('types') }] : [])
])

function setFacet(key, value) {
  sel[key] = sel[key] === value ? '' : value
  // Picking a genus clears a species of another genus
  if (key === 'genus' && sel.species && !sel.species.startsWith(value + ' ')) sel.species = ''
}
function clear(key) {
  if (key in sel) sel[key] = ''
  if (key === 'q') q.value = ''
  if (key === 'years') from.value = to.value = null
  if (key === 'mapped') onlyMapped.value = false
  if (key === 'types') onlyTypes.value = false
}
function clearAll() {
  FACETS.forEach((f) => (sel[f.key] = ''))
  ;['q', 'years', 'mapped', 'types'].forEach(clear)
}

watch(
  [q, () => ({ ...sel }), italyOnly, from, to, onlyMapped, onlyTypes, view, sort],
  () => {
    limit.value = 100
    router.replace({
      query: {
        ...(q.value.trim() ? { q: q.value.trim() } : {}),
        ...Object.fromEntries(FACETS.filter((f) => sel[f.key]).map((f) => [f.key, sel[f.key]])),
        ...(italyOnly.value ? {} : { scope: 'all' }),
        ...(from.value ? { from: String(from.value) } : {}),
        ...(to.value ? { to: String(to.value) } : {}),
        ...(onlyMapped.value ? { mapped: '1' } : {}),
        ...(onlyTypes.value ? { types: '1' } : {}),
        ...(view.value !== 'species' ? { view: view.value } : {}),
        ...(sort.value !== 'name' ? { sort: sort.value } : {})
      }
    })
  },
  { deep: true }
)

// ---------- downloads & citation ----------
function download() {
  downloadCsv(recordsSorted.value, `SoI_records_${new Date().toISOString().slice(0, 10)}.csv`)
}

// The GBIF dataset citation (title not repeated), accessed through this site
const gbif = useGbif()
const citation = computed(() => datasetCitation('syrphidaeitaly.com'))

// "View on GBIF" links inside map popups
function onPopupClick(e) {
  const rec = e.target.closest?.('[data-soi-rec]')
  if (rec) {
    e.preventDefault()
    const [type, id] = rec.getAttribute('data-soi-rec').split(':')
    dwcTableRef.value?.show({ id: Number(id), type })
    return
  }
  const a = e.target.closest?.('[data-gbif-occ]')
  if (!a) return
  e.preventDefault()
  openRecordOnGbif(a.getAttribute('data-gbif-occ'))
}

// The full record, inside SoI (specimens and field observations)
const dwcTableRef = ref(null)
const isSpecimen = (r) => ['CollectionObject', 'FieldOccurrence'].includes(r.raw.dwc_occurrence_object_type) && r.raw.dwc_occurrence_object_id
function openDetails(r) {
  dwcTableRef.value?.show({ id: r.raw.dwc_occurrence_object_id, type: r.raw.dwc_occurrence_object_type })
}
onMounted(() => document.addEventListener('click', onPopupClick))
onBeforeUnmount(() => document.removeEventListener('click', onPopupClick))

async function toClipboard(text, flag) {
  try {
    await navigator.clipboard.writeText(text)
    flag.value = true
    setTimeout(() => (flag.value = false), 2000)
  } catch {
    /* clipboard blocked */
  }
}
const copyLink = () => toClipboard(window.location.href, copied)
const copyCitation = () => toClipboard(citation.value, citeCopied)
</script>

<style scoped>
.dt-seg {
  display: inline-flex;
  border: 1px solid var(--soi-ink);
  border-radius: 999px;
  overflow: hidden;
}
.dt-seg button {
  padding: 0.35rem 0.9rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--soi-ink);
  white-space: nowrap;
}
.dt-seg button + button {
  border-left: 1px solid var(--soi-rule);
}
.dt-seg button.on {
  background: var(--soi-ink);
  color: var(--soi-paper);
}
.dt-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: var(--soi-yellow);
  color: #22281c;
  font-size: 0.8rem;
  font-weight: 600;
}
.dt-toggle {
  width: 100%;
  padding: 0.55rem;
  border: 1px solid var(--soi-ink);
  border-radius: 999px;
  font-weight: 600;
  margin-bottom: 1rem;
}
.dt-legend {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--soi-yellow-deep);
  margin-bottom: 0.5rem;
}
.dt-facet ul {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.dt-facet li button {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  width: 100%;
  text-align: left;
  padding: 0.22rem 0.55rem;
  border-radius: 4px;
  font-size: 0.86rem;
  color: var(--soi-ink);
}
.dt-facet li button:hover {
  background: var(--soi-paper-2);
}
.dt-facet li button span:last-child {
  color: var(--soi-ink-soft);
  font-size: 0.78rem;
}
.dt-facet li button.on {
  background: var(--soi-ink);
  color: var(--soi-paper);
  font-weight: 600;
}
.dt-facet li button.on span:last-child {
  color: inherit;
  opacity: 0.75;
}
.dt-more {
  margin-top: 0.3rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--soi-yellow-deep);
  text-decoration: underline;
}
.dt-year {
  width: 5.5rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--soi-rule);
  border-radius: 6px;
  background: var(--soi-card);
  color: var(--soi-ink);
}
.dt-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.86rem;
  padding: 0.18rem 0;
}
.dt-check input {
  accent-color: var(--soi-olive);
}
.dt-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--soi-rule);
  border-radius: 6px;
  background: var(--soi-card);
  color: var(--soi-ink);
}
.dt-table-wrap {
  overflow-x: auto;
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  border-top: 3px solid var(--soi-ink);
  border-radius: 6px;
}
.dt-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.dt-table th {
  text-align: left;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--soi-ink-soft);
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid var(--soi-rule);
  white-space: nowrap;
}
.dt-table td {
  padding: 0.6rem 0.8rem;
  border-bottom: 1px solid var(--soi-rule);
  vertical-align: top;
}
.dt-table tbody tr:hover {
  background: var(--soi-paper-2);
}
.dt-name {
  font-weight: 600;
  color: var(--soi-ink);
}
a.dt-name:hover {
  text-decoration: underline;
  text-decoration-color: var(--soi-yellow);
  text-decoration-thickness: 2px;
}
.dt-count {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--soi-yellow-deep);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.dt-badge {
  margin-left: 0.4rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  border: 1px solid var(--soi-rule);
  color: var(--soi-ink-soft);
  white-space: nowrap;
}
.dt-badge.type {
  background: var(--soi-terra);
  border-color: var(--soi-terra);
  color: #fff;
  text-transform: none;
  letter-spacing: 0;
}
.dt-clip {
  max-width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dt-gbif {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  padding: 0.9rem 1.1rem;
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  border-left: 5px solid #4c9b45;
  border-radius: 6px;
}
.dt-gbif-mark {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background: #4c9b45;
  color: #fff;
  font-size: 1.15rem;
}
.dt-rec-link {
  margin-left: 0.35rem;
  font-weight: 700;
  color: var(--soi-ink);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.dt-gbif-link {
  margin-left: 0.35rem;
  font-weight: 700;
  color: var(--soi-yellow-deep);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.dt-cite {
  padding: 0.6rem 0.8rem;
  background: var(--soi-paper-2);
  border-left: 3px solid var(--soi-yellow);
  border-radius: 0 6px 6px 0;
  overflow-wrap: anywhere;
}
</style>
