<template>
  <div class="soi min-h-screen">
    <SoiMasthead
      :eyebrow="t('eyebrow')"
      :title="t('title')"
      :lede="t('lede')"
    />

    <section class="container mx-auto box-border px-4 py-10 sm:py-14 grid lg:grid-cols-12 gap-10">
      <!-- Map -->
      <div class="lg:col-span-7">
        <div class="soi-card p-4 sm:p-6">
          <AtlasMap
            :counts="atlas.regions"
            :selected="selected"
            @select="select"
          />
        </div>
        <p class="mt-3 text-sm soi-muted">{{ t('mapNote') }}</p>
      </div>

      <!-- Region panel -->
      <aside class="lg:col-span-5">
        <div class="soi-card p-6 lg:sticky lg:top-6">
          <template v-if="!selected">
            <p class="soi-eyebrow">{{ t('regions') }}</p>
            <h2 class="soi-serif mt-2 text-2xl font-semibold">{{ t('pick') }}</h2>
            <p class="mt-2 soi-muted">{{ t('pickHelp') }}</p>

            <ol class="mt-5 border-t soi-rule">
              <li
                v-for="r in ranking"
                :key="r.name"
                class="border-b soi-rule"
              >
                <button
                  type="button"
                  class="w-full grid grid-cols-[minmax(0,9.5rem)_1fr_3.5rem] gap-3 items-center py-2 text-left hover:bg-[color:var(--soi-paper-2)]"
                  @click="select(r.name)"
                >
                  <span class="truncate">{{ r.name }}</span>
                  <span class="soi-rowtrack">
                    <span
                      class="soi-rowbar"
                      :style="{ width: r.share + '%' }"
                    />
                  </span>
                  <span class="tabular-nums text-sm soi-muted text-right">{{ r.records === null ? '…' : r.records.toLocaleString('en-US') }}</span>
                </button>
              </li>
            </ol>
          </template>

          <template v-else>
            <button
              type="button"
              class="soi-link text-sm font-semibold"
              @click="selected = null"
            >
              ← {{ t('allRegions') }}
            </button>
            <h2 class="soi-serif mt-3 text-3xl font-semibold">{{ selected }}</h2>
            <dl class="mt-4 flex gap-8">
              <div>
                <dt class="text-xs font-bold uppercase tracking-[0.14em] soi-muted">{{ t('records') }}</dt>
                <dd class="soi-serif text-3xl font-semibold tabular-nums">{{ (atlas.regions[selected]?.records ?? 0).toLocaleString('en-US') }}</dd>
              </div>
              <div>
                <dt class="text-xs font-bold uppercase tracking-[0.14em] soi-muted">{{ t('species') }}</dt>
                <dd class="soi-serif text-3xl font-semibold tabular-nums">
                  <span v-if="regionSpecies?.list">{{ regionSpecies.list.length }}</span>
                  <span
                    v-else
                    class="soi-skel"
                    >000</span
                  >
                </dd>
              </div>
            </dl>

            <div class="mt-5 border-t soi-rule pt-4">
              <p
                v-if="!atlas.regions[selected]?.records"
                class="soi-muted"
              >
                {{ t('noRecords') }}
              </p>
              <p
                v-else-if="regionSpecies?.loading"
                class="soi-muted text-sm"
              >
                {{ t('loadingSpecies') }}
              </p>
              <p
                v-else-if="regionSpecies?.error"
                class="soi-muted text-sm"
              >
                {{ t('error') }}
              </p>
              <ul
                v-else-if="regionSpecies?.list"
                class="soi-species-list max-h-[26rem] overflow-y-auto pr-2 -mr-2"
              >
                <li
                  v-for="s in regionSpecies.list"
                  :key="s.id"
                >
                  <RouterLink
                    :to="{ name: 'otus-id-overview', params: { id: s.id } }"
                    class="block py-1.5 border-b soi-rule !text-[color:var(--soi-ink)] hover:underline underline-offset-2"
                    v-html="s.html"
                  />
                </li>
              </ul>
            </div>
          </template>
        </div>
      </aside>
    </section>

    <!-- Season -->
    <section class="border-y soi-rule bg-[color:var(--soi-paper-2)]">
      <div class="container mx-auto box-border px-4 py-12 sm:py-16 grid lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-4">
          <p class="soi-eyebrow">{{ t('seasonEyebrow') }}</p>
          <h2 class="soi-serif mt-3 text-3xl font-semibold leading-tight">{{ t('seasonTitle') }}</h2>
          <p class="mt-3 soi-muted leading-relaxed">{{ t('seasonText', { peak: peakMonth }) }}</p>
        </div>
        <div class="lg:col-span-8 soi-card p-5 sm:p-7">
          <SeasonBars
            :values="atlas.months"
            :height="180"
          />
        </div>
      </div>
    </section>

    <!-- Red List -->
    <section class="container mx-auto box-border px-4 py-12 sm:py-16">
      <div class="grid lg:grid-cols-12 gap-10">
        <div class="lg:col-span-4">
          <p class="soi-eyebrow">{{ t('rlEyebrow') }}</p>
          <h2 class="soi-serif mt-3 text-3xl font-semibold leading-tight">{{ t('rlTitle') }}</h2>
          <p class="mt-3 soi-muted leading-relaxed">{{ t('rlText') }}</p>
        </div>
        <div class="lg:col-span-8">
          <p
            v-if="atlas.loadingRedList"
            class="soi-muted"
          >
            …
          </p>
          <p
            v-else-if="!atlas.redList.length"
            class="soi-card p-6 soi-muted"
          >
            {{ t('rlNone') }}
          </p>
          <div
            v-else
            class="space-y-6"
          >
            <div
              v-for="group in redListGroups"
              :key="group.category"
            >
              <h3 class="flex items-center gap-3">
                <RedListBadge :category="group.category" />
                <span class="text-sm soi-muted">{{ group.items.length }}</span>
              </h3>
              <ul class="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                <li
                  v-for="s in group.items"
                  :key="s.otuId"
                >
                  <RouterLink
                    :to="{ name: 'otus-id-overview', params: { id: s.otuId } }"
                    class="soi-link"
                    v-html="s.html"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useHead } from '@unhead/vue'
import AtlasMap from './components/Atlas/AtlasMap.vue'
import SeasonBars from './components/Atlas/SeasonBars.vue'
import RedListBadge from './components/Atlas/RedListBadge.vue'
import { RED_LIST_ORDER, loadRegionSpecies, useAtlas } from './components/Atlas/useAtlas.js'
import { lang, useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    eyebrow: 'Atlas',
    title: 'Hoverflies across Italy',
    lede: 'Where and when the specimens in SoI were collected — by region and by month.',
    mapNote: 'Shading counts specimen and literature records with a known Italian region. Click a region to list its species.',
    regions: 'Regions',
    pick: 'Choose a region',
    pickHelp: 'Ranked by number of records. Pick one here or on the map.',
    allRegions: 'All regions',
    records: 'Records',
    species: 'Species',
    noRecords: 'No records from this region yet — a gap waiting to be filled.',
    loadingSpecies: 'Loading the species list (this can take a few seconds)…',
    error: 'Could not load the species list. Please try again.',
    seasonEyebrow: 'Flight season',
    seasonTitle: 'When hoverflies are on the wing',
    seasonText: 'Records per month across Italy, all species combined. Activity peaks in {peak}.',
    rlEyebrow: 'Conservation',
    rlTitle: 'European Red List',
    rlText: 'Species with an assessment in the European Red List of hoverflies, as recorded in SoI.',
    rlNone: 'No Red List assessments recorded yet.'
  },
  it: {
    eyebrow: 'Atlante',
    title: 'I sirfidi in Italia',
    lede: 'Dove e quando sono stati raccolti gli esemplari presenti in SoI — per regione e per mese.',
    mapNote: 'Il colore indica il numero di record (esemplari e letteratura) con regione italiana nota. Clicca una regione per vederne le specie.',
    regions: 'Regioni',
    pick: 'Scegli una regione',
    pickHelp: 'Ordinate per numero di record. Selezionane una qui o sulla mappa.',
    allRegions: 'Tutte le regioni',
    records: 'Record',
    species: 'Specie',
    noRecords: 'Nessun record per questa regione — una lacuna da colmare.',
    loadingSpecies: 'Caricamento dell’elenco delle specie (può richiedere qualche secondo)…',
    error: 'Impossibile caricare l’elenco. Riprova.',
    seasonEyebrow: 'Periodo di volo',
    seasonTitle: 'Quando volano i sirfidi',
    seasonText: 'Record per mese in tutta Italia, tutte le specie insieme. Il picco di attività è in {peak}.',
    rlEyebrow: 'Conservazione',
    rlTitle: 'Lista Rossa europea',
    rlText: 'Specie valutate nella Lista Rossa europea dei sirfidi, come registrato in SoI.',
    rlNone: 'Nessuna valutazione registrata.'
  }
})

useHead({
  title: () => `${t('title')} — Syrphidae of Italy`,
  meta: [{ name: 'description', content: () => t('lede') }]
})

const atlas = useAtlas()
const selected = ref(null)

function select(name) {
  selected.value = name
  loadRegionSpecies(name)
}

const regionSpecies = computed(() => (selected.value ? atlas.species[selected.value] : null))

const ranking = computed(() => {
  const rows = Object.keys(atlas.regions).length
    ? Object.entries(atlas.regions).map(([name, r]) => ({ name, records: r.records }))
    : []
  const max = Math.max(1, ...rows.map((r) => r.records || 0))
  return rows
    .sort((a, b) => b.records - a.records || a.name.localeCompare(b.name))
    .map((r) => ({ ...r, share: Math.max(r.records ? 3 : 0, (r.records / max) * 100) }))
})

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
}
const peakMonth = computed(() => {
  const v = atlas.months.map((x) => x || 0)
  const i = v.indexOf(Math.max(...v))
  return (MONTHS[lang.value] || MONTHS.en)[i]
})

const redListGroups = computed(() =>
  RED_LIST_ORDER.map((category) => ({
    category,
    items: atlas.redList.filter((s) => s.category === category)
  })).filter((g) => g.items.length)
)
</script>

<style scoped>
.soi-rowtrack {
  display: block;
  height: 6px;
}
.soi-rowbar {
  display: block;
  height: 6px;
  border-radius: 3px;
  background: var(--soi-yellow);
}
.soi-species-list :deep(i) {
  font-style: italic;
}
</style>
