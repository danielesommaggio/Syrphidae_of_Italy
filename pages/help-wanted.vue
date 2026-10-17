<template>
  <div class="soi min-h-screen">
    <SoiMasthead
      :eyebrow="t('eyebrow')"
      :title="t('title')"
      :lede="t('lede')"
    />

    <section class="container mx-auto box-border px-4 py-10 sm:py-14">
      <!-- Progress -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <button
          v-for="g in gaps"
          :key="g.key"
          type="button"
          class="soi-gap text-left"
          :class="{ on: active === g.key }"
          :aria-pressed="active === g.key"
          @click="active = g.key"
        >
          <span class="soi-eyebrow !text-[color:var(--soi-ink-soft)]">{{ g.label }}</span>
          <span class="flex items-baseline gap-2 mt-2">
            <span class="soi-serif text-4xl font-semibold tabular-nums">
              <span :class="{ 'soi-skel': g.missing === null }">{{ g.missing ?? '000' }}</span>
            </span>
            <span class="text-sm soi-muted">{{ t('ofSpecies', { n: total }) }}</span>
          </span>
          <span class="soi-progress mt-4">
            <span :style="{ width: g.done + '%' }" />
          </span>
          <span class="mt-2 block text-xs soi-muted">{{ t('complete', { p: g.done }) }}</span>
        </button>
      </div>

      <!-- List -->
      <div class="mt-10 grid lg:grid-cols-12 gap-10">
        <div class="lg:col-span-8">
          <div class="flex flex-wrap items-center gap-3 mb-5">
            <h2 class="soi-serif text-2xl font-semibold mr-auto">{{ current.label }}</h2>
            <input
              v-model="query"
              type="search"
              class="soi-filter"
              :placeholder="t('filter')"
              :aria-label="t('filter')"
            />
          </div>

          <p
            v-if="current.missing === null"
            class="soi-muted"
          >
            {{ t('loading') }}
          </p>
          <p
            v-else-if="!grouped.length"
            class="soi-card p-6 soi-muted"
          >
            {{ query ? t('noMatch') : t('allDone') }}
          </p>

          <div
            v-else
            class="space-y-6"
          >
            <section
              v-for="g in grouped"
              :key="g.genus"
            >
              <h3 class="flex items-baseline gap-2 border-b soi-rule pb-1">
                <RouterLink
                  :to="{ name: 'taxa-name', params: { name: g.genus } }"
                  class="soi-serif italic text-lg font-semibold !text-[color:var(--soi-ink)] hover:underline"
                  >{{ g.genus }}</RouterLink
                >
                <span class="text-xs soi-muted">{{ g.items.length }}</span>
              </h3>
              <ul class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                <li
                  v-for="s in g.items"
                  :key="s.id"
                >
                  <component
                    :is="s.otuId ? 'RouterLink' : 'span'"
                    :to="s.otuId ? { name: 'otus-id-overview', params: { id: s.otuId } } : undefined"
                    class="soi-sp"
                    v-html="s.html"
                  />
                </li>
              </ul>
            </section>
          </div>
        </div>

        <aside class="lg:col-span-4">
          <div class="soi-card p-6 lg:sticky lg:top-6">
            <p class="soi-eyebrow">{{ t('howEyebrow') }}</p>
            <ul class="mt-4 space-y-3 text-[0.95rem] leading-relaxed">
              <li><strong>{{ t('h1') }}</strong> {{ t('h1t') }}</li>
              <li><strong>{{ t('h2') }}</strong> {{ t('h2t') }}</li>
              <li><strong>{{ t('h3') }}</strong> {{ t('h3t') }}</li>
              <li><strong>{{ t('h4') }}</strong> {{ t('h4t') }}</li>
            </ul>
            <a
              :href="`mailto:${email}?subject=${encodeURIComponent('SoI — ' + t('subject'))}`"
              class="soi-btn soi-btn-ink mt-6"
              >{{ t('write') }}</a
            >
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { makeAPIRequest } from '@/utils/request'
import { useT } from '@/utils/soiLang.js'
import { useGenera } from './taxa/useGenera.js'
import curators from './components/Section/Data/curators.js'
import { fetchAssociations } from '~/panels/_shared/associationGraph.js'

const t = useT({
  en: {
    eyebrow: 'Help wanted',
    title: 'What the catalogue still needs',
    lede: 'Species that are still missing a photograph, an Italian record or ecological data. If you can fill a gap, we would love to hear from you.',
    photo: 'No photograph',
    record: 'No Italian record',
    ecology: 'No ecological data',
    interactions: 'No interactions',
    ofSpecies: 'of {n} species',
    complete: '{p}% of species covered',
    filter: 'Filter by name…',
    loading: 'Checking the catalogue (this can take a few seconds)…',
    noMatch: 'No species match the filter.',
    allDone: 'Nothing missing here — every species is covered!',
    howEyebrow: 'How to contribute',
    h1: 'Photographs:',
    h1t: 'live or pinned specimens, habitus or diagnostic details, with your preferred licence.',
    h2: 'Records:',
    h2t: 'dated, georeferenced specimens or reliable observations from Italy.',
    h3: 'Literature:',
    h3t: 'papers with biology, habitat or phenology we have not cited yet.',
    h4: 'Interactions:',
    h4t: 'flowers visited, larval food, prey or natural enemies, with the source.',
    write: 'Write to the curators',
    subject: 'contribution'
  },
  it: {
    eyebrow: 'Cerchiamo aiuto',
    title: 'Cosa manca ancora al catalogo',
    lede: 'Specie ancora senza fotografia, senza record italiano o senza dati ecologici. Se puoi colmare una lacuna, scrivici!',
    photo: 'Senza fotografia',
    record: 'Senza record italiano',
    ecology: 'Senza dati ecologici',
    interactions: 'Senza interazioni',
    ofSpecies: 'su {n} specie',
    complete: '{p}% delle specie coperto',
    filter: 'Filtra per nome…',
    loading: 'Verifica del catalogo in corso (può richiedere qualche secondo)…',
    noMatch: 'Nessuna specie corrisponde al filtro.',
    allDone: 'Non manca nulla — tutte le specie sono coperte!',
    howEyebrow: 'Come contribuire',
    h1: 'Fotografie:',
    h1t: 'esemplari vivi o spillati, habitus o dettagli diagnostici, con la licenza che preferisci.',
    h2: 'Record:',
    h2t: 'esemplari datati e georeferenziati o osservazioni affidabili dall’Italia.',
    h3: 'Letteratura:',
    h3t: 'articoli su biologia, habitat o fenologia non ancora citati.',
    h4: 'Interazioni:',
    h4t: 'fiori visitati, alimentazione larvale, prede o nemici naturali, con la fonte.',
    write: 'Scrivi ai curatori',
    subject: 'contributo'
  }
})

useHead({
  title: () => `${t('title')} — Syrphidae of Italy`,
  meta: [{ name: 'description', content: () => t('lede') }]
})

const email = curators.find((c) => c.email)?.email || ''
const genera = useGenera()

const otuByTaxon = ref(null) // taxon_name_id -> otu id
const withPhoto = ref(null) // Set of otu ids / names
const photoNames = ref(new Set())
const withRecord = ref(null) // Set of otu ids
const withEcology = ref(null) // Set of otu ids
const withInteractions = ref(null) // Set of otu ids with a biological association

const active = ref('photo')
const query = ref('')

const species = computed(() =>
  Object.entries(genera.speciesByGenus).flatMap(([genus, list]) =>
    list.map((s) => ({
      ...s,
      genus,
      plain: s.html.replace(/<[^>]*>/g, ''),
      otuId: otuByTaxon.value?.get(s.id) || null
    }))
  )
)
const total = computed(() => species.value.length || '…')

function missingFor(key) {
  if (!otuByTaxon.value || genera.loading) return null
  const sets = { photo: withPhoto.value, record: withRecord.value, ecology: withEcology.value, interactions: withInteractions.value }
  const set = sets[key]
  if (!set) return null
  return species.value.filter((s) => {
    if (key === 'photo' && photoNames.value.has(s.plain)) return false
    return !(s.otuId && set.has(s.otuId))
  })
}

const gaps = computed(() =>
  ['photo', 'record', 'ecology', 'interactions'].map((key) => {
    const list = missingFor(key)
    const n = species.value.length
    return {
      key,
      label: t(key),
      list,
      missing: list ? list.length : null,
      done: list && n ? Math.round(((n - list.length) / n) * 100) : 0
    }
  })
)

const current = computed(() => gaps.value.find((g) => g.key === active.value))

const grouped = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = (current.value.list || []).filter((s) => !q || s.plain.toLowerCase().includes(q))
  const map = new Map()
  list.forEach((s) => {
    if (!map.has(s.genus)) map.set(s.genus, [])
    map.get(s.genus).push(s)
  })
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([genus, items]) => ({ genus, items }))
})

onMounted(async () => {
  // Species OTUs (one call for all descendants of Syrphidae)
  makeAPIRequest
    .get('/otus', { params: { 'taxon_name_id[]': 1095229, descendants: true, per: 5000 } })
    .then(({ data }) => {
      otuByTaxon.value = new Map((data || []).map((o) => [o.taxon_name_id, o.id]))
    })
    .catch(() => (otuByTaxon.value = new Map()))

  // Photographs: depictions on OTUs, or on specimens labelled with the species name
  makeAPIRequest
    .get('/depictions', { params: { per: 2000 } })
    .then(({ data }) => {
      const rows = data || []
      withPhoto.value = new Set(rows.filter((d) => d.depiction_object_type === 'Otu').map((d) => d.depiction_object_id))
      photoNames.value = new Set(
        rows
          .filter((d) => d.figure_label)
          .map((d) => d.figure_label.replace(/\.\s*(Male|Female).*$/i, '').trim())
      )
    })
    .catch(() => (withPhoto.value = new Set()))

  // Ecological content (Biology tab topics)
  makeAPIRequest
    .get('/contents', { params: { per: 5000 } })
    .then(({ data }) => (withEcology.value = new Set((data || []).map((c) => c.otu_id))))
    .catch(() => (withEcology.value = new Set()))

  // Biological associations (hoverfly side of each association)
  fetchAssociations()
    .then((rows) => {
      withInteractions.value = new Set(
        rows.flatMap((a) => [a.subject, a.object]).filter((e) => e?.base_class === 'Otu').map((e) => e.id)
      )
    })
    .catch(() => (withInteractions.value = new Set()))

  // Italian records (slowest query)
  makeAPIRequest
    .get('/otus.json', { params: { 'dwc_occurrence_query[country]': 'Italy', per: 5000 } })
    .then(({ data }) => (withRecord.value = new Set((data || []).map((o) => o.id))))
    .catch(() => (withRecord.value = new Set()))
})
</script>

<style scoped>
.soi-gap {
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  border-radius: 6px;
  padding: 1.25rem 1.4rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.soi-gap:hover {
  border-color: var(--soi-ink-soft);
}
.soi-gap.on {
  border-color: var(--soi-ink);
  box-shadow: inset 0 4px 0 var(--soi-yellow);
}
.soi-progress {
  display: block;
  height: 8px;
  border-radius: 999px;
  background: var(--soi-paper-2);
  overflow: hidden;
}
.soi-progress span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--soi-olive);
  transition: width 0.8s ease;
}
.soi-filter {
  border: 1.5px solid var(--soi-ink);
  border-radius: 999px;
  padding: 0.4rem 1rem;
  background: var(--soi-card);
  color: var(--soi-ink);
  font-size: 0.92rem;
  outline: none;
}
.soi-sp {
  color: var(--soi-ink) !important;
  font-style: normal;
}
.soi-sp :deep(i) {
  font-style: italic;
}
a.soi-sp:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
