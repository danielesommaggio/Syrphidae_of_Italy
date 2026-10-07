<template>
  <div
    class="gbif-citations"
    :style="{ height: `${height}px` }"
  >
    <div class="gbif-citations__header">
      <div class="gbif-citations__header-count">
        <a
          v-if="!isLoading && total != null"
          :href="searchUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="gbif-citations__tag">
            {{ total.toLocaleString() }} citations
          </span>
        </a>
      </div>
      <a
        class="gbif-citations__powered"
        :href="searchUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GbifLogoIcon class="inline" /> Powered by GBIF
      </a>
    </div>

    <div class="gbif-citations__table-container">
      <div
        ref="scrollRef"
        class="gbif-citations__table-scroll"
      >
        <div
          v-if="error"
          class="gbif-citations__error"
        >
          {{ error }}
        </div>
        <table
          v-else
          class="gbif-citations__table"
        >
          <tbody>
            <template v-if="isInitialLoading">
              <tr
                v-for="index in 20"
                :key="index"
                class="gbif-citations__row"
              >
                <td class="gbif-citations__cell">
                  <div class="gbif-citations__skeleton gbif-citations__skeleton--block" />
                </td>
              </tr>
            </template>
            <template v-else>
              <CitationRow
                v-for="item in results"
                :key="item.id"
                :item="item"
                :loading="isLoading"
              />
            </template>
          </tbody>
        </table>
      </div>
      <TableFooter
        v-model="page"
        :total="total"
        :per-page="perPage"
        :loading="isLoading"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  makeLiteratureSearchUrl,
  parseWidgetQuery,
  searchLiterature
} from '../utils/api.js'
import CitationRow from './CitationRow.vue'
import GbifLogoIcon from './GbifLogoIcon.vue'
import TableFooter from './TableFooter.vue'

const props = defineProps({
  // The GBIF widget URL, or only its query string, as the GBIF widget
  // generator gives it: "gbifTaxonKey=2435099&year=2020,2024"
  query: {
    type: String,
    default: ''
  },

  // Same filters as an object; they take precedence over `query`
  filters: {
    type: Object,
    default: () => ({})
  },

  perPage: {
    type: Number,
    default: 50
  },

  height: {
    type: Number,
    default: 500
  }
})

const results = ref([])
const total = ref(null)
const page = ref(1)
const isLoading = ref(false)
const error = ref(null)
const scrollRef = ref(null)

let requestId = 0

const searchFilters = computed(() => ({
  ...parseWidgetQuery(props.query),
  ...props.filters
}))

const searchUrl = computed(() => makeLiteratureSearchUrl(searchFilters.value))

const isInitialLoading = computed(
  () => !results.value.length && (isLoading.value || total.value == null)
)

async function loadCitations() {
  const currentRequest = ++requestId

  isLoading.value = true
  error.value = null

  try {
    const data = await searchLiterature({
      filters: searchFilters.value,
      offset: (page.value - 1) * props.perPage,
      limit: props.perPage
    })

    if (currentRequest !== requestId) return

    results.value = data.results
    total.value = data.count
  } catch (e) {
    if (currentRequest !== requestId) return

    error.value = 'Unable to load citations from GBIF.'
  } finally {
    if (currentRequest === requestId) {
      isLoading.value = false
    }
  }
}

watch(page, async () => {
  await loadCitations()
  await nextTick()
  scrollRef.value?.scrollTo({ top: 0 })
})

watch(
  () => JSON.stringify(searchFilters.value),
  () => {
    results.value = []
    total.value = null

    if (page.value === 1) {
      loadCitations()
    } else {
      page.value = 1
    }
  }
)

onMounted(loadCitations)
</script>

<style>
/* Replicates the look of https://www.gbif.org/api/widgets/literature/latest */
.gbif-citations {
  --gbif-primary-500: #4c9c2e;
  --gbif-primary-600: #448c29;

  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem;
  background-color: #f1f5f9;
  color: #020817;
}

.gbif-citations a {
  color: inherit;
  text-decoration: inherit;
}

.gbif-citations__header {
  display: flex;
  flex: none;
  align-items: center;
  margin-bottom: 0.5rem;
}

.gbif-citations__header-count {
  flex: 1 1 auto;
}

.gbif-citations__powered {
  flex: none;
}

.gbif-citations__tag {
  vertical-align: middle;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--gbif-primary-600);
  border-radius: 0.25rem;
  background-color: var(--gbif-primary-500);
  color: #fff;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 500;
}

.gbif-citations__table-container {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;
  min-height: 0;
  border: 1px solid #e2e8f0;
  background-color: #fff;
}

.gbif-citations__table-scroll {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  overflow: auto;
  background-color: #f8fafc;
}

.gbif-citations__table {
  width: 100%;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.gbif-citations__row {
  border-bottom: 1px solid #e2e8f0;
}

.gbif-citations__cell {
  position: relative;
  padding: 0.5rem;
  vertical-align: top;
  background-color: #fff;
}

.gbif-citations__authors {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--gbif-primary-500);
}

.gbif-citations__abstract {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #6b7280;
}

.gbif-citations__error {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
}

.gbif-citations__footer {
  display: flex;
  flex: none;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
  border-top: 1px solid #e2e8f0;
}

.gbif-citations__footer-side {
  display: flex;
  flex: 1 1 0%;
}

.gbif-citations__footer-side--end {
  justify-content: flex-end;
}

.gbif-citations__footer-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.gbif-citations__footer-button:hover {
  background-color: #f1f5f9;
}

.gbif-citations__footer-button:disabled {
  pointer-events: none;
  opacity: 0.5;
}

.gbif-citations__page-label {
  font-size: 0.75rem;
  line-height: 1rem;
}

.gbif-citations__skeleton {
  display: inline;
  border-radius: 0.375rem;
  background-color: rgb(15 23 42 / 0.1);
  color: transparent;
  animation: gbif-citations-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.gbif-citations__skeleton > * {
  visibility: hidden;
}

.gbif-citations__skeleton--block {
  display: block;
  width: 100%;
  height: 1.5rem;
}

@keyframes gbif-citations-pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
