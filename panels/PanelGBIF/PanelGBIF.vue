<template>
  <VCard v-if="taxonKey">
    <VCardHeader class="flex items-center justify-between gap-3">
      <GBIFLogo class="h-6" />
      <span class="text-xs font-semibold uppercase tracking-wider opacity-70">{{ t('header') }}</span>
    </VCardHeader>
    <VCardContent class="text-sm">
      <a
        target="_blank"
        rel="noopener"
        :href="links.species"
        class="pg-name"
        v-html="taxon.full_name_tag"
      />

      <ul
        v-if="counts"
        class="pg-counts"
      >
        <li class="pg-soi">
          <a
            :href="links.soi"
            target="_blank"
            rel="noopener"
          >
            <strong>{{ fmt(counts.soi) }}</strong>
            {{ counts.soi === 1 ? t('soi1') : t('soi') }}
          </a>
        </li>
        <li>
          <a
            :href="links.italy"
            target="_blank"
            rel="noopener"
          >
            <strong>{{ fmt(counts.italy) }}</strong> {{ t('italy') }}
          </a>
        </li>
        <li>
          <a
            :href="links.species"
            target="_blank"
            rel="noopener"
          >
            <strong>{{ fmt(counts.world) }}</strong> {{ t('world') }}
          </a>
        </li>
      </ul>
      <p
        v-else-if="loadingCounts"
        class="mt-2 opacity-70"
      >
        …
      </p>

      <p class="mt-3 text-xs opacity-75">
        {{ t('note') }}
        <a
          :href="LINKS.dataset"
          target="_blank"
          rel="noopener"
          class="underline"
          >{{ t('dataset') }}</a
        >.
      </p>
    </VCardContent>
  </VCard>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import GBIFLogo from './components/gbifLogo.vue'
import { LINKS, matchTaxon, taxonCounts, taxonLinks } from '~/pages/components/Gbif/useGbif.js'
import { isIt, useT } from '@/utils/soiLang.js'

const props = defineProps({
  taxon: {
    type: Object,
    required: true
  }
})

const t = useT({
  en: {
    header: 'Records on GBIF',
    soi: 'records published by SoI',
    soi1: 'record published by SoI',
    italy: 'records from Italy (all publishers)',
    world: 'records worldwide',
    note: 'SoI records are part of the',
    dataset: 'SoI occurrence dataset on GBIF'
  },
  it: {
    header: 'Record su GBIF',
    soi: 'record pubblicati da SoI',
    soi1: 'record pubblicato da SoI',
    italy: 'record dall’Italia (tutti i publisher)',
    world: 'record nel mondo',
    note: 'I record di SoI fanno parte del',
    dataset: 'dataset di occorrenze di SoI su GBIF'
  }
})

const taxonKey = ref(null)
const counts = ref(null)
const loadingCounts = ref(false)
const links = computed(() => taxonLinks(taxonKey.value))
const fmt = (n) => Number(n).toLocaleString(isIt.value ? 'it-IT' : 'en-US')

onMounted(async () => {
  taxonKey.value = await matchTaxon(props.taxon.expanded_name || props.taxon.name)
  if (!taxonKey.value) return
  loadingCounts.value = true
  try {
    counts.value = await taxonCounts(taxonKey.value)
  } catch {
    counts.value = null
  } finally {
    loadingCounts.value = false
  }
})
</script>

<style scoped>
.pg-name {
  font-weight: 600;
}
.pg-name:hover {
  text-decoration: underline;
}
.pg-counts {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.35rem;
}
.pg-counts a:hover {
  text-decoration: underline;
}
.pg-counts strong {
  font-variant-numeric: tabular-nums;
}
.pg-soi {
  padding-left: 0.5rem;
  border-left: 3px solid #4c9b45;
}
</style>
