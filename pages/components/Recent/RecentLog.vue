<template>
  <div>
    <div
      v-if="loading && !items.length"
      class="space-y-3"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="soi-skel block h-12 w-full"
      />
    </div>

    <p
      v-else-if="error"
      class="soi-card p-6 soi-muted"
    >
      {{ t('error') }}
    </p>

    <p
      v-else-if="!items.length"
      class="soi-card p-6 soi-muted"
    >
      {{ t('empty') }}
    </p>

    <div v-else>
      <section
        v-for="group in groups"
        :key="group.key"
        class="soi-log-group"
      >
        <h2 class="soi-log-month soi-serif">
          {{ group.label }}
          <span class="text-sm font-normal soi-muted ml-2 tabular-nums">{{ group.items.length }}</span>
        </h2>
        <ol class="border-t soi-rule">
          <li
            v-for="item in group.items"
            :key="item.id"
            class="grid grid-cols-[3.25rem_1fr] sm:grid-cols-[4.5rem_1fr_auto] gap-x-4 gap-y-1 items-baseline py-3.5 border-b soi-rule"
          >
            <span class="text-sm tabular-nums soi-muted">{{ dayLabel(item) }}</span>
            <div class="min-w-0">
              <component
                :is="item.to ? 'RouterLink' : 'span'"
                :to="item.to"
                class="soi-log-title"
                :class="{ 'hover:underline underline-offset-4': item.to }"
                v-html="item.html"
              />
            </div>
            <span
              v-if="item.tag"
              class="col-start-2 sm:col-start-auto text-xs font-semibold uppercase tracking-[0.12em] soi-muted"
              >{{ tagLabel(item.tag) }}</span
            >
          </li>
        </ol>
      </section>

      <div
        v-if="hasMore"
        class="mt-8 flex justify-center"
      >
        <button
          type="button"
          class="soi-btn soi-btn-line"
          :disabled="loading"
          @click="load(page + 1)"
        >
          {{ loading ? t('loading') : t('older') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { makeAPIRequest } from '@/utils/request'
import { lang, useT } from '@/utils/soiLang.js'

const props = defineProps({
  // 'taxa' | 'sources'
  kind: {
    type: String,
    required: true
  },
  per: {
    type: Number,
    default: 40
  }
})

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
}
const months = () => MONTHS[lang.value] || MONTHS.en

const t = useT({
  en: { error: 'Couldn’t load the list from TaxonWorks right now. Please try again in a moment.', empty: 'Nothing has been added yet.', loading: 'Loading…', older: 'Show older additions', undated: 'Undated', species: 'species', genus: 'genus', subspecies: 'subspecies', subgenus: 'subgenus' },
  it: { error: 'Impossibile caricare l’elenco da TaxonWorks. Riprova tra poco.', empty: 'Ancora nessuna aggiunta.', loading: 'Caricamento…', older: 'Mostra aggiunte precedenti', undated: 'Senza data', species: 'specie', genus: 'genere', subspecies: 'sottospecie', subgenus: 'sottogenere' }
})

function tagLabel(tag) {
  return /^\d+$/.test(tag || '') ? tag : t(tag)
}

function dayLabel(item) {
  if (item.m === null) return ''
  return `${String(item.d).padStart(2, '0')} ${months()[item.m].slice(0, 3)}`
}

const items = ref([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)
const error = ref(false)

const hasMore = computed(() => items.value.length < total.value)

const groups = computed(() => {
  const map = new Map()
  for (const it of items.value) {
    if (!map.has(it.monthKey)) {
      const label = it.m === null ? t('undated') : `${months()[it.m]} ${it.y}`
      map.set(it.monthKey, { key: it.monthKey, label, items: [] })
    }
    map.get(it.monthKey).items.push(it)
  }
  return [...map.values()]
})

function dateParts(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { monthKey: 'undated', m: null, y: null, d: null }
  return { monthKey: `${d.getFullYear()}-${d.getMonth()}`, m: d.getMonth(), y: d.getFullYear(), d: d.getDate() }
}

function rankLabel(rank = '') {
  const r = String(rank).split('::').pop()
  return r ? r.toLowerCase() : ''
}

async function fetchTaxa(p) {
  const { data, headers } = await makeAPIRequest.get('/taxon_names', {
    params: {
      validity: true,
      recent: true,
      taxon_name_type: 'Protonym',
      recent_target: 'created_at',
      'extend[]': 'otus',
      per: props.per,
      page: p
    }
  })

  const rows = Array.isArray(data) ? data : []
  const missing = rows.filter((t) => !t.otus?.length).map((t) => t.id)
  let otuByTn = new Map()

  if (missing.length) {
    try {
      const { data: otus } = await makeAPIRequest.get('/otus', { params: { taxon_name_id: missing } })
      otuByTn = new Map((otus || []).map((o) => [o.taxon_name_id, o.id]))
    } catch {
      // links simply stay off
    }
  }

  return {
    total: Number(headers['pagination-total']) || rows.length,
    rows: rows.map((t) => {
      const otuId = t.otus?.[0]?.id || otuByTn.get(t.id)
      return {
        id: t.id,
        created: t.created_at,
        html: [t.cached_html || t.name, t.cached_author_year].filter(Boolean).join(' '),
        to: otuId ? { name: 'otus-id-overview', params: { id: otuId } } : null,
        tag: rankLabel(t.rank_string)
      }
    })
  }
}

async function fetchSources(p) {
  const { data, headers } = await makeAPIRequest.get('/sources', {
    params: {
      in_project: true,
      recent: true,
      recent_target: 'created_at',
      per: props.per,
      page: p
    }
  })

  const rows = Array.isArray(data) ? data : []
  return {
    total: Number(headers['pagination-total']) || rows.length,
    rows: rows.map((s) => ({
      id: s.id,
      created: s.created_at,
      html: s.cached || s.name || `Source ${s.id}`,
      to: null,
      tag: s.year ? String(s.year) : ''
    }))
  }
}

async function load(p = 1) {
  loading.value = true
  error.value = false
  try {
    const res = props.kind === 'sources' ? await fetchSources(p) : await fetchTaxa(p)
    const rows = res.rows.map((r) => ({ ...r, ...dateParts(r.created) }))
    items.value = p === 1 ? rows : [...items.value, ...rows]
    total.value = res.total
    page.value = p
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => load(1))
</script>

<style scoped>
.soi-log-group + .soi-log-group {
  margin-top: 2.5rem;
}
.soi-log-month {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.soi-log-title {
  color: var(--soi-ink);
  font-size: 1.02rem;
  line-height: 1.5;
}
.soi-log-title :deep(i) {
  font-style: italic;
}
</style>
