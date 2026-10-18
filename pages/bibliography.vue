<template>
  <div class="soi min-h-screen">
    <SoiMasthead
      :eyebrow="t('eyebrow')"
      :title="t('title')"
      :lede="t('lede')"
    />

    <section class="container mx-auto box-border px-4 py-10 sm:py-14">
      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="s in stats"
          :key="s.key"
          class="soi-card p-5"
        >
          <p class="soi-eyebrow">{{ s.label }}</p>
          <p class="soi-serif mt-1 text-3xl font-semibold tabular-nums">
            <span :class="{ 'soi-skel': !loaded }">{{ loaded ? s.value : '000' }}</span>
          </p>
        </div>
      </div>

      <!-- Works per decade -->
      <div
        v-if="loaded && entries.length"
        class="soi-card p-5 sm:p-6 mt-6"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2 class="soi-serif text-xl font-semibold">{{ t('perDecade') }}</h2>
          <p class="text-xs soi-muted">{{ decade === null ? t('decadeHelp') : t('decadeOn', { d: decade }) }}</p>
        </div>
        <DecadeBars
          :counts="decadeCounts"
          :from="span[0]"
          :to="span[1]"
          :selected="decade"
          :label="t('perDecade')"
          :unit="worksLabel"
          @select="(d) => (decade = decade === d ? null : d)"
        />
      </div>

      <!-- Search and filters -->
      <div class="mt-8">
        <form
          class="soi-search"
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
            >{{ t('countOf', { n: fmt(filtered.length), total: fmt(entries.length) }) }}</span
          >
        </form>

        <div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <div
            class="bb-seg"
            role="group"
            :aria-label="t('kind')"
          >
            <button
              v-for="k in KINDS"
              :key="k"
              type="button"
              :class="{ on: kind === k }"
              :aria-pressed="kind === k"
              @click="kind = k"
            >
              {{ t('kind_' + k) }}
            </button>
          </div>

          <label class="flex items-center gap-2">
            {{ t('language') }}
            <select
              v-model="language"
              class="bb-select"
            >
              <option value="">{{ t('anyLanguage') }}</option>
              <option
                v-for="l in languages"
                :key="l.name"
                :value="l.name"
              >
                {{ langName(l.name) }} ({{ l.n }})
              </option>
            </select>
          </label>

          <label class="flex items-center gap-2">
            <input
              v-model="online"
              type="checkbox"
              class="bb-check"
            />
            {{ t('onlineOnly') }}
          </label>

          <label class="flex items-center gap-2 sm:ml-auto">
            {{ t('sort') }}
            <select
              v-model="sort"
              class="bb-select"
            >
              <option value="author">{{ t('sortAuthor') }}</option>
              <option value="new">{{ t('sortNew') }}</option>
              <option value="old">{{ t('sortOld') }}</option>
            </select>
          </label>
        </div>

        <div
          v-if="active.length"
          class="mt-4 flex flex-wrap items-center gap-2"
        >
          <button
            v-for="a in active"
            :key="a.key"
            type="button"
            class="bb-pill"
            :title="t('remove')"
            @click="clear(a.key)"
          >
            {{ a.label }} <span aria-hidden="true">×</span>
          </button>
          <button
            type="button"
            class="soi-link text-sm"
            @click="clearAll"
          >
            {{ t('clearAll') }}
          </button>
        </div>
      </div>

      <!-- Results -->
      <div class="mt-8 grid lg:grid-cols-12 gap-8">
        <div class="lg:col-span-9 min-w-0">
          <p
            v-if="!loaded"
            class="soi-muted"
          >
            {{ t('loading') }}
          </p>
          <p
            v-else-if="failed"
            class="soi-card p-6 soi-muted"
          >
            {{ t('failed') }}
          </p>
          <p
            v-else-if="!filtered.length"
            class="soi-card p-6 soi-muted"
          >
            {{ t('none') }}
          </p>

          <template v-else>
            <!-- A–Z jump bar -->
            <nav
              v-if="sort === 'author' && groups.length > 4"
              class="bb-az"
              :aria-label="t('jump')"
            >
              <button
                v-for="g in groups"
                :key="g.key"
                type="button"
                @click="jump(g.key)"
              >
                {{ g.key }}
              </button>
            </nav>

            <section
              v-for="g in shownGroups"
              :id="`bb-${g.key}`"
              :key="g.key"
              class="mb-8"
            >
              <h2 class="bb-group soi-serif">
                {{ g.label }}
                <span class="soi-muted text-sm font-normal tabular-nums">{{ g.items.length }}</span>
              </h2>
              <ol class="bb-list">
                <li
                  v-for="e in g.items"
                  :key="e.id"
                  class="bb-item"
                >
                  <p
                    class="bb-cite"
                    v-html="e.html"
                  />
                  <div class="bb-actions">
                    <span
                      v-if="e.language"
                      class="bb-tag"
                      >{{ langName(e.language) }}</span
                    >
                    <a
                      v-if="e.doi"
                      :href="`https://doi.org/${e.doi}`"
                      target="_blank"
                      rel="noopener"
                      class="bb-btn"
                      >DOI ↗</a
                    >
                    <a
                      v-if="e.url"
                      :href="e.url"
                      target="_blank"
                      rel="noopener"
                      class="bb-btn"
                      >{{ e.bhl ? 'BHL ↗' : t('online') + ' ↗' }}</a
                    >
                    <button
                      type="button"
                      class="bb-btn"
                      :aria-expanded="!!names[e.id]"
                      @click="toggleNames(e)"
                    >
                      {{ names[e.id] ? t('hideNames') : t('showNames') }}
                    </button>
                    <button
                      type="button"
                      class="bb-btn"
                      @click="copy(e)"
                    >
                      {{ copiedId === e.id ? t('copied') : t('copy') }}
                    </button>
                  </div>

                  <!-- Names cited in this work -->
                  <div
                    v-if="names[e.id]"
                    class="bb-names"
                  >
                    <p
                      v-if="names[e.id].loading"
                      class="soi-muted text-sm"
                    >
                      {{ t('loadingNames') }}
                    </p>
                    <p
                      v-else-if="names[e.id].error"
                      class="soi-muted text-sm"
                    >
                      {{ t('namesFailed') }}
                    </p>
                    <template v-else>
                      <p
                        v-if="!names[e.id].names.length"
                        class="soi-muted text-sm"
                      >
                        {{ t('noNames') }}
                      </p>
                      <template v-else>
                        <p class="text-xs soi-muted mb-2">
                          {{ t('namesIntro', { n: names[e.id].names.length }) }}
                          <template v-if="names[e.id].names.some((n) => n.original)">
                            · <span class="bb-orig">★</span> {{ t('origLegend') }}</template
                          >
                        </p>
                        <ul class="flex flex-wrap gap-1.5">
                          <li
                            v-for="n in names[e.id].names.slice(0, names[e.id].all ? 999 : 40)"
                            :key="n.id"
                          >
                            <component
                              :is="n.otuId ? 'RouterLink' : 'span'"
                              :to="n.otuId ? { name: 'otus-id-overview', params: { id: n.otuId } } : undefined"
                              class="bb-name"
                              :class="{ syn: !n.valid, link: n.otuId }"
                              :title="[n.rank, n.valid ? '' : t('synonym')].filter(Boolean).join(' · ')"
                            >
                              <span
                                v-if="n.original"
                                class="bb-orig"
                                >★</span
                              >
                              <i v-if="n.italic">{{ n.name }}</i
                              ><template v-else>{{ n.name }}</template>
                              <span class="soi-muted">{{ n.author }}</span>
                            </component>
                          </li>
                        </ul>
                        <button
                          v-if="names[e.id].names.length > 40 && !names[e.id].all"
                          type="button"
                          class="soi-link text-xs mt-2"
                          @click="names[e.id].all = true"
                        >
                          {{ t('allNames', { n: names[e.id].names.length }) }}
                        </button>
                      </template>
                      <p
                        v-if="otherText(names[e.id].other)"
                        class="text-xs soi-muted mt-2"
                      >
                        {{ otherText(names[e.id].other) }}
                      </p>
                    </template>
                  </div>
                </li>
              </ol>
            </section>

            <div
              v-if="shownCount < filtered.length"
              class="text-center"
            >
              <button
                type="button"
                class="soi-btn soi-btn-line"
                @click="limit += 150"
              >
                {{ t('more', { n: fmt(filtered.length - shownCount) }) }}
              </button>
            </div>
          </template>
        </div>

        <!-- Side -->
        <aside class="lg:col-span-3 space-y-5">
          <div class="soi-card p-5">
            <p class="soi-eyebrow">{{ t('export') }}</p>
            <p class="text-sm soi-muted mt-2">{{ t('exportText', { n: fmt(filtered.length) }) }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="x in ['CSV', 'BibTeX', 'RIS']"
                :key="x"
                type="button"
                class="bb-btn"
                :disabled="!filtered.length"
                @click="doExport(x)"
              >
                {{ x }}
              </button>
            </div>
            <button
              type="button"
              class="soi-link text-sm mt-4 block"
              @click="copyLink"
            >
              {{ linkCopied ? t('linkCopied') : t('copyLink') }}
            </button>
          </div>

          <div class="soi-card p-5">
            <p class="soi-eyebrow">{{ t('missingEyebrow') }}</p>
            <p class="text-sm mt-2 leading-relaxed">{{ t('missingText') }}</p>
            <RouterLink
              to="/help-wanted"
              class="soi-link text-sm mt-3 inline-block"
              >{{ t('missingLink') }}</RouterLink
            >
          </div>

          <div class="soi-card p-5">
            <p class="soi-eyebrow">{{ t('advEyebrow') }}</p>
            <p class="text-sm mt-2 leading-relaxed soi-muted">{{ t('advText') }}</p>
            <RouterLink
              to="/resources/tw/filter/bibliography"
              class="soi-link text-sm mt-3 inline-block"
              >{{ t('advLink') }}</RouterLink
            >
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import DecadeBars from './components/Bibliography/DecadeBars.vue'
import { LANG_IT, exportBibtex, exportCsv, exportRis, fetchCitedNames, fetchSources } from './components/Bibliography/useSources.js'
import { isIt, useT } from '@/utils/soiLang.js'

const t = useT({
  en: {
    eyebrow: 'Bibliography',
    title: 'The literature on Italian hoverflies',
    lede: 'Every work used to build SoI — from Linnaeus to the latest papers. Search, filter, open the original, see which names each work treats, and export the list.',
    works: 'Works',
    span: 'Years covered',
    langs: 'Languages',
    onlineStat: 'Online (DOI or link)',
    perDecade: 'Works per decade',
    decadeHelp: 'Click a bar to show only that decade.',
    decadeOn: 'Showing the {d}s — click the bar again to show all.',
    searchPh: 'Author, title, journal, year or DOI…',
    countOf: '{n} of {total}',
    kind: 'Type of work',
    kind_all: 'All',
    kind_article: 'Articles',
    kind_book: 'Books',
    kind_chapter: 'Chapters',
    language: 'Language',
    anyLanguage: 'Any',
    onlineOnly: 'Available online',
    sort: 'Sort',
    sortAuthor: 'Author A–Z',
    sortNew: 'Newest first',
    sortOld: 'Oldest first',
    remove: 'Remove this filter',
    clearAll: 'Clear all',
    loading: 'Loading the bibliography…',
    failed: 'The bibliography could not be loaded. Please try again later.',
    none: 'No works match. Try fewer filters or another spelling.',
    jump: 'Jump to letter',
    online: 'Online',
    showNames: 'Names in SoI',
    hideNames: 'Hide names',
    copy: 'Copy',
    copied: 'Copied ✓',
    loadingNames: 'Looking up the names cited in this work…',
    namesFailed: 'The names could not be loaded.',
    noNames: 'No names in SoI are linked to this work yet.',
    namesIntro: '{n} names in SoI cite this work',
    origLegend: 'described here',
    synonym: 'not valid',
    allNames: 'Show all {n}',
    more: 'Show more ({n} left)',
    export: 'Export',
    exportText: 'Download the {n} works shown, for your reference manager or spreadsheet.',
    copyLink: 'Copy a link to this search',
    linkCopied: 'Link copied ✓',
    missingEyebrow: 'Something missing?',
    missingText: 'Know a paper on Italian hoverflies that is not here, or have a PDF we lack? We would be grateful to hear from you.',
    missingLink: 'How to help →',
    advEyebrow: 'Advanced search',
    advText: 'Need to search by serial, author identity or other TaxonWorks fields?',
    advLink: 'Open the TaxonWorks filter →',
    decadeChip: '{d}s',
    onlineChip: 'Available online',
    other_TaxonNameRelationship: '{n} nomenclatural acts',
    other_TaxonNameClassification: '{n} name statuses',
    other_AssertedDistribution: '{n} distribution records',
    other_BiologicalAssociation: '{n} biological associations',
    other_TypeMaterial: '{n} type specimens',
    other_CollectionObject: '{n} specimens',
    other_Otu: '{n} taxon pages',
    other_Content: '{n} descriptions',
    otherPrefix: 'Also cited for: ',
    work1: '1 work',
    workN: '{n} works'
  },
  it: {
    eyebrow: 'Bibliografia',
    title: 'La letteratura sui sirfidi italiani',
    lede: 'Tutti i lavori usati per costruire SoI — da Linneo agli articoli più recenti. Cerca, filtra, apri l’originale, scopri quali nomi tratta ogni lavoro ed esporta l’elenco.',
    works: 'Lavori',
    span: 'Anni coperti',
    langs: 'Lingue',
    onlineStat: 'Online (DOI o link)',
    perDecade: 'Lavori per decennio',
    decadeHelp: 'Clicca una barra per vedere solo quel decennio.',
    decadeOn: 'Anni {d} — clicca di nuovo la barra per vedere tutto.',
    searchPh: 'Autore, titolo, rivista, anno o DOI…',
    countOf: '{n} di {total}',
    kind: 'Tipo di lavoro',
    kind_all: 'Tutti',
    kind_article: 'Articoli',
    kind_book: 'Libri',
    kind_chapter: 'Capitoli',
    language: 'Lingua',
    anyLanguage: 'Tutte',
    onlineOnly: 'Disponibili online',
    sort: 'Ordina',
    sortAuthor: 'Autore A–Z',
    sortNew: 'Più recenti',
    sortOld: 'Più antichi',
    remove: 'Togli questo filtro',
    clearAll: 'Togli tutti',
    loading: 'Caricamento della bibliografia…',
    failed: 'Non è stato possibile caricare la bibliografia. Riprova più tardi.',
    none: 'Nessun lavoro corrisponde. Prova con meno filtri o un’altra grafia.',
    jump: 'Vai alla lettera',
    online: 'Online',
    showNames: 'Nomi in SoI',
    hideNames: 'Nascondi i nomi',
    copy: 'Copia',
    copied: 'Copiato ✓',
    loadingNames: 'Cerco i nomi citati in questo lavoro…',
    namesFailed: 'Non è stato possibile caricare i nomi.',
    noNames: 'Nessun nome in SoI è ancora collegato a questo lavoro.',
    namesIntro: '{n} nomi in SoI citano questo lavoro',
    origLegend: 'descritto qui',
    synonym: 'non valido',
    allNames: 'Mostra tutti i {n}',
    more: 'Mostra altri ({n} rimanenti)',
    export: 'Esporta',
    exportText: 'Scarica i {n} lavori mostrati, per il tuo gestore di bibliografia o un foglio di calcolo.',
    copyLink: 'Copia il link a questa ricerca',
    linkCopied: 'Link copiato ✓',
    missingEyebrow: 'Manca qualcosa?',
    missingText: 'Conosci un lavoro sui sirfidi italiani che non è qui, o hai un PDF che ci manca? Ci farebbe piacere saperlo.',
    missingLink: 'Come aiutarci →',
    advEyebrow: 'Ricerca avanzata',
    advText: 'Devi cercare per rivista, identità dell’autore o altri campi di TaxonWorks?',
    advLink: 'Apri il filtro di TaxonWorks →',
    decadeChip: 'Anni {d}',
    onlineChip: 'Disponibili online',
    other_TaxonNameRelationship: '{n} atti nomenclaturali',
    other_TaxonNameClassification: '{n} stati nomenclaturali',
    other_AssertedDistribution: '{n} dati di distribuzione',
    other_BiologicalAssociation: '{n} associazioni biologiche',
    other_TypeMaterial: '{n} esemplari tipici',
    other_CollectionObject: '{n} esemplari',
    other_Otu: '{n} pagine di taxa',
    other_Content: '{n} descrizioni',
    otherPrefix: 'Citato anche per: ',
    work1: '1 lavoro',
    workN: '{n} lavori'
  }
})

useHead({ title: () => `${t('eyebrow')} — Syrphidae of Italy` })

const KINDS = ['all', 'article', 'book', 'chapter']
const PAGE = 150

const route = useRoute()
const router = useRouter()

const entries = ref([])
const loaded = ref(false)
const failed = ref(false)
const q = ref(String(route.query.q || ''))
const language = ref(String(route.query.lang || ''))
const kind = ref(KINDS.includes(route.query.kind) ? String(route.query.kind) : 'all')
const online = ref(route.query.online === '1')
const decade = ref(route.query.decade ? Number(route.query.decade) : null)
const sort = ref(['new', 'old'].includes(route.query.sort) ? String(route.query.sort) : 'author')
const limit = ref(PAGE)
const names = reactive({})
const copiedId = ref(null)
const linkCopied = ref(false)

const fmt = (n) => Number(n).toLocaleString(isIt.value ? 'it-IT' : 'en-US')
const langName = (l) => (isIt.value ? LANG_IT[l] || l : l)
const worksLabel = (n) => (n === 1 ? t('work1') : t('workN', { n: fmt(n) }))

onMounted(async () => {
  try {
    entries.value = await fetchSources()
  } catch {
    failed.value = true
  } finally {
    loaded.value = true
  }
})

// ---------- stats ----------
const span = computed(() => {
  const ys = entries.value.map((e) => e.decade).filter(Boolean)
  return ys.length ? [Math.min(...ys), Math.max(...ys)] : [1750, 2020]
})
const stats = computed(() => {
  const years = entries.value.map((e) => e.year).filter(Boolean)
  return [
    { key: 'works', label: t('works'), value: fmt(entries.value.length) },
    { key: 'span', label: t('span'), value: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '—' },
    { key: 'langs', label: t('langs'), value: new Set(entries.value.map((e) => e.language).filter(Boolean)).size },
    { key: 'online', label: t('onlineStat'), value: fmt(entries.value.filter((e) => e.doi || e.url).length) }
  ]
})

// ---------- filtering ----------
const fold = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

function matches(e, except) {
  const terms = fold(q.value).trim().split(/\s+/).filter(Boolean)
  if (terms.length && !terms.every((w) => e.search.includes(w))) return false
  if (except !== 'lang' && language.value && e.language !== language.value) return false
  if (except !== 'kind' && kind.value !== 'all' && e.kind !== kind.value) return false
  if (except !== 'online' && online.value && !(e.doi || e.url)) return false
  if (except !== 'decade' && decade.value !== null && e.decade !== decade.value) return false
  return true
}

const filtered = computed(() => entries.value.filter((e) => matches(e)))

const decadeCounts = computed(() => {
  const m = {}
  entries.value.filter((e) => e.decade && matches(e, 'decade')).forEach((e) => (m[e.decade] = (m[e.decade] || 0) + 1))
  return m
})

const languages = computed(() => {
  const m = new Map()
  entries.value.filter((e) => e.language && matches(e, 'lang')).forEach((e) => m.set(e.language, (m.get(e.language) || 0) + 1))
  const list = [...m.entries()].map(([name, n]) => ({ name, n }))
  if (language.value && !m.has(language.value)) list.push({ name: language.value, n: 0 })
  return list.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
})

// ---------- sorting and grouping ----------
const sorted = computed(() => {
  const list = filtered.value.slice()
  const byAuthor = (a, b) => a.authorKey.localeCompare(b.authorKey) || (a.year || 0) - (b.year || 0)
  if (sort.value === 'new') return list.sort((a, b) => (b.year || 0) - (a.year || 0) || byAuthor(a, b))
  if (sort.value === 'old') return list.sort((a, b) => (a.year || 9999) - (b.year || 9999) || byAuthor(a, b))
  return list.sort(byAuthor)
})

function groupOf(e) {
  if (sort.value === 'author') return { key: /[A-Z]/.test(e.letter) ? e.letter : '#', label: /[A-Z]/.test(e.letter) ? e.letter : '#' }
  if (!e.decade) return { key: 'nd', label: isIt.value ? 'Senza data' : 'No date' }
  return { key: String(e.decade), label: isIt.value ? `Anni ${e.decade}` : `${e.decade}s` }
}

const groups = computed(() => {
  const out = []
  let cur = null
  sorted.value.forEach((e) => {
    const g = groupOf(e)
    if (!cur || cur.key !== g.key) out.push((cur = { ...g, items: [] }))
    cur.items.push(e)
  })
  return out
})

// Render in pages, keeping the groups
const shownGroups = computed(() => {
  let left = limit.value
  const out = []
  for (const g of groups.value) {
    if (left <= 0) break
    out.push(g.items.length <= left ? g : { ...g, items: g.items.slice(0, left) })
    left -= g.items.length
  }
  return out
})
const shownCount = computed(() => shownGroups.value.reduce((n, g) => n + g.items.length, 0))

function jump(key) {
  const i = groups.value.findIndex((g) => g.key === key)
  const before = groups.value.slice(0, i + 1).reduce((n, g) => n + g.items.length, 0)
  if (before > limit.value) limit.value = before
  requestAnimationFrame(() => document.getElementById(`bb-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

// ---------- active filters ----------
const active = computed(() => [
  ...(q.value.trim() ? [{ key: 'q', label: `“${q.value.trim()}”` }] : []),
  ...(decade.value !== null ? [{ key: 'decade', label: t('decadeChip', { d: decade.value }) }] : []),
  ...(language.value ? [{ key: 'lang', label: langName(language.value) }] : []),
  ...(kind.value !== 'all' ? [{ key: 'kind', label: t('kind_' + kind.value) }] : []),
  ...(online.value ? [{ key: 'online', label: t('onlineChip') }] : [])
])

function clear(key) {
  if (key === 'q') q.value = ''
  if (key === 'decade') decade.value = null
  if (key === 'lang') language.value = ''
  if (key === 'kind') kind.value = 'all'
  if (key === 'online') online.value = false
}
function clearAll() {
  ;['q', 'decade', 'lang', 'kind', 'online'].forEach(clear)
}

watch([q, language, kind, online, decade, sort], () => {
  limit.value = PAGE
  router.replace({
    query: {
      ...(q.value.trim() ? { q: q.value.trim() } : {}),
      ...(language.value ? { lang: language.value } : {}),
      ...(kind.value !== 'all' ? { kind: kind.value } : {}),
      ...(online.value ? { online: '1' } : {}),
      ...(decade.value !== null ? { decade: String(decade.value) } : {}),
      ...(sort.value !== 'author' ? { sort: sort.value } : {})
    }
  })
})

// ---------- names cited in a work ----------
async function toggleNames(e) {
  if (names[e.id]) {
    delete names[e.id]
    return
  }
  names[e.id] = { loading: true }
  try {
    const res = await fetchCitedNames(e.id)
    if (names[e.id]) names[e.id] = { ...res, all: false }
  } catch {
    if (names[e.id]) names[e.id] = { error: true }
  }
}

function otherText(other) {
  const parts = Object.entries(other || {})
    .filter(([type]) => t('other_' + type) !== 'other_' + type)
    .map(([type, n]) => t('other_' + type, { n: fmt(n) }))
  return parts.length ? t('otherPrefix') + parts.join(', ') : ''
}

// ---------- copy / export ----------
async function copy(e) {
  try {
    await navigator.clipboard.writeText(e.doi ? `${e.text} https://doi.org/${e.doi}` : e.text)
    copiedId.value = e.id
    setTimeout(() => copiedId.value === e.id && (copiedId.value = null), 1800)
  } catch {
    /* clipboard blocked */
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    linkCopied.value = true
    setTimeout(() => (linkCopied.value = false), 2000)
  } catch {
    /* clipboard blocked */
  }
}

function doExport(kindName) {
  const list = sorted.value
  if (kindName === 'CSV') exportCsv(list)
  else if (kindName === 'BibTeX') exportBibtex(list)
  else exportRis(list)
}
</script>

<style scoped>
.bb-seg {
  display: inline-flex;
  border: 1px solid var(--soi-ink);
  border-radius: 999px;
  overflow: hidden;
}
.bb-seg button {
  padding: 0.35rem 0.85rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--soi-ink);
}
.bb-seg button + button {
  border-left: 1px solid var(--soi-rule);
}
.bb-seg button.on {
  background: var(--soi-ink);
  color: var(--soi-paper);
}
.bb-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--soi-rule);
  border-radius: 6px;
  background: var(--soi-card);
  color: var(--soi-ink);
  max-width: 14rem;
}
.bb-check {
  width: 1rem;
  height: 1rem;
  accent-color: var(--soi-olive);
}
.bb-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: var(--soi-ink);
  color: var(--soi-paper);
  font-size: 0.8rem;
  font-weight: 600;
}
.bb-az {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  background: var(--soi-paper);
  border-bottom: 1px solid var(--soi-rule);
}
.bb-az button {
  min-width: 1.9rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--soi-ink);
}
.bb-az button:hover {
  background: var(--soi-yellow);
  color: #22281c;
}
.bb-group {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  font-size: 1.6rem;
  font-weight: 600;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--soi-ink);
  scroll-margin-top: 4rem;
}
.bb-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.bb-item {
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--soi-rule);
}
.bb-cite {
  padding-left: 1.5rem;
  text-indent: -1.5rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
}
.bb-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
}
.bb-tag {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--soi-ink-soft);
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--soi-rule);
  border-radius: 4px;
}
.bb-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.65rem;
  border: 1px solid var(--soi-rule);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--soi-ink);
  background: var(--soi-card);
  transition: border-color 0.15s, background 0.15s;
}
.bb-btn:hover:not(:disabled) {
  border-color: var(--soi-ink);
  background: var(--soi-paper-2);
}
.bb-btn:disabled {
  opacity: 0.5;
}
.bb-names {
  margin: 0.7rem 0 0 1.5rem;
  padding: 0.8rem 1rem;
  background: var(--soi-paper-2);
  border-left: 3px solid var(--soi-yellow);
  border-radius: 0 6px 6px 0;
}
.bb-name {
  display: inline-flex;
  gap: 0.3rem;
  align-items: baseline;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: var(--soi-card);
  border: 1px solid var(--soi-rule);
  font-size: 0.82rem;
}
.bb-name .soi-muted {
  font-size: 0.75rem;
}
.bb-name.link:hover {
  border-color: var(--soi-ink);
}
.bb-name.syn {
  border-style: dashed;
}
.bb-orig {
  color: var(--soi-yellow-deep);
}
</style>
