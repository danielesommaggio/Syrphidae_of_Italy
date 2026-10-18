<template>
  <div class="rl">
    <ul class="rl-list">
      <li
        v-for="r in shown"
        :key="r.id"
      >
        <!-- specimens and field observations: the full record, inside SoI -->
        <button
          v-if="isSpecimen(r)"
          type="button"
          class="rl-main"
          :title="t('details')"
          @click="openDetails(r)"
        >
          <span class="rl-date">{{ r.eventDate || r.verbatimEventDate || t('noDate') }}</span>
          <span>{{ where(r) }}</span>
          <span class="rl-info">ⓘ</span>
        </button>
        <!-- literature records: the reference, on the Bibliography page -->
        <span
          v-else
          class="rl-main plain"
        >
          <span class="rl-date">{{ t('literature') }}</span>
          <span>{{ where(r) }}</span>
          <RouterLink
            v-if="r.associatedReferences"
            :to="{ path: '/bibliography', query: { q: refQuery(r.associatedReferences) } }"
            class="rl-ref"
            v-html="refHtml(r.associatedReferences)"
          />
        </span>
        <span class="rl-muted">
          {{ [elevText(r), r.sex && r.sex.toLowerCase(), r.recordedBy, [r.institutionCode, r.catalogNumber].filter(Boolean).join(' ')].filter(Boolean).join(' · ') }}
        </span>
        <button
          v-if="r.occurrenceID"
          type="button"
          class="rl-gbif"
          :title="t('onGbif')"
          @click="openRecordOnGbif(r.occurrenceID)"
        >
          GBIF ↗
        </button>
      </li>
    </ul>
    <button
      v-if="records.length > limit"
      type="button"
      class="rl-more"
      @click="limit += 25"
    >
      {{ t('more', { n: records.length - limit }) }}
    </button>

    <DwcTable ref="dwcTableRef" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useT } from '@/utils/soiLang.js'
import DwcTable from './DwcTable.vue'
import { openRecordOnGbif } from '~/pages/components/Gbif/useGbif.js'

// A short list of SoI occurrence records (DwC rows from /otus/:id/inventory/dwc.json or
// /dwc_occurrences). Each specimen or field observation opens its full record inside SoI
// (DwcTable); literature records link to their reference on the Bibliography page;
// GBIF ↗ opens the same record on GBIF.
const props = defineProps({
  records: { type: Array, default: () => [] }
})

const t = useT({
  en: {
    details: 'See the full record',
    noDate: 'no date',
    literature: 'Literature',
    onGbif: 'Open this record on GBIF',
    more: 'Show more ({n} left)'
  },
  it: {
    details: 'Vedi il record completo',
    noDate: 'senza data',
    literature: 'Letteratura',
    onGbif: 'Apri questo record su GBIF',
    more: 'Mostra altri ({n} rimanenti)'
  }
})

const limit = ref(25)
const shown = computed(() => props.records.slice(0, limit.value))
const dwcTableRef = ref(null)

const isSpecimen = (r) => ['CollectionObject', 'FieldOccurrence'].includes(r.dwc_occurrence_object_type) && r.dwc_occurrence_object_id
function openDetails(r) {
  dwcTableRef.value?.show({ id: r.dwc_occurrence_object_id, type: r.dwc_occurrence_object_type })
}

const where = (r) => [r.verbatimLocality || r.locality, r.stateProvince, r.country].filter(Boolean).join(', ') || '—'
function elevText(r) {
  const lo = Number(r.minimumElevationInMeters)
  const hi = Number(r.maximumElevationInMeters)
  if (Number.isFinite(lo) && lo > 0 && Number.isFinite(hi) && hi > lo) return `${lo}–${hi} m`
  if (Number.isFinite(lo) && lo > 0) return `${lo} m`
  return r.verbatimElevation || ''
}
const refHtml = (s) => String(s).replace(/<(?!\/?i>)[^>]*>/gi, '').replace(/\s*\[in [^\]]+\]\s*$/, '')
// "Bartsch, H., … (2009) …" → "Bartsch 2009", to find the work on the Bibliography page
function refQuery(s) {
  const plain = String(s).replace(/<[^>]+>/g, '')
  const author = plain.match(/^\s*([^\s,(]+)/)?.[1] || ''
  const year = plain.match(/\((\d{4})/)?.[1] || plain.match(/\b(1[7-9]\d\d|20\d\d)\b/)?.[1] || ''
  return `${author} ${year}`.trim()
}
</script>

<style scoped>
.rl-list {
  display: grid;
  gap: 0.35rem;
}
.rl-list li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.15rem 0.6rem;
}
.rl-main {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.15rem 0.6rem;
  text-align: left;
  color: inherit;
}
button.rl-main:hover span:not(.rl-info) {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.rl-date {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.rl-info {
  font-size: 0.85rem;
  color: var(--soi-yellow-deep, #9a6a12);
}
.rl-ref {
  text-decoration: underline;
  text-underline-offset: 2px;
}
.rl-muted {
  color: var(--soi-ink-soft, #5b5e4c);
}
.rl-gbif {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--soi-ink-soft, #5b5e4c);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.rl-more {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
