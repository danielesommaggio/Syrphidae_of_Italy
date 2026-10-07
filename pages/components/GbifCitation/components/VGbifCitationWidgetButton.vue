<template>
  <a
    class="gbif-citations-button"
    :href="searchUrl"
    target="_blank"
    rel="noopener noreferrer"
  >
    <GbifLogoIcon class="gbif-citations-button__logo" />
    <span
      v-if="total == null"
      class="gbif-citations-button__spinner"
    />
    <span v-else>{{ total.toLocaleString() }} citations</span>
  </a>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  makeLiteratureSearchUrl,
  parseWidgetQuery,
  searchLiterature
} from '../utils/api.js'
import GbifLogoIcon from './GbifLogoIcon.vue'

const props = defineProps({
  // The GBIF button widget URL, or only its query string
  query: {
    type: String,
    default: ''
  },

  filters: {
    type: Object,
    default: () => ({})
  }
})

const total = ref(null)

const searchFilters = computed(() => ({
  ...parseWidgetQuery(props.query),
  ...props.filters
}))

const searchUrl = computed(() => makeLiteratureSearchUrl(searchFilters.value))

async function loadCount() {
  total.value = null

  const data = await searchLiterature({
    filters: searchFilters.value,
    limit: 0
  }).catch(() => null)

  total.value = data?.count ?? null
}

watch(() => JSON.stringify(searchFilters.value), loadCount)

onMounted(loadCount)
</script>

<style>
/* Replicates https://www.gbif.org/api/widgets/literature/button */
.gbif-citations-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #448c29;
  background-color: #4c9c2e;
  color: #fff;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: center;
  text-decoration: none;
}

.gbif-citations-button__logo {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-inline-end: 0.25rem;
}

.gbif-citations-button__spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 9999px;
  animation: gbif-citations-button-spin 0.75s linear infinite;
}

@keyframes gbif-citations-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
