<template>
  <header class="border-b border-base-muted pb-4 mb-6">
    <h1 class="text-2xl font-semibold [&_i]:italic" :style="{ color: AMBER.name }" v-html="titleHtml" />

    <p v-if="meta.taxonomicScope" class="mt-1 text-base-content [&_i]:italic">
      <span class="text-base-soft">Scope: </span><RouterLink
        v-if="meta.otuId"
        :to="{ name: 'otus-id', params: { id: meta.otuId } }"
        target="_blank"
        rel="noopener"
        class="hover:underline"
        :style="{ color: AMBER.name }"
      ><span v-if="meta.taxonomicScopeHtml" v-html="meta.taxonomicScopeHtml" /><template v-else><span v-html="scopeHtml" /></template></RouterLink><span
        v-else-if="meta.taxonomicScopeHtml"
        v-html="meta.taxonomicScopeHtml"
      /><template v-else><span v-html="scopeHtml" /></template>
    </p>

    <p v-if="primaryCitation" class="mt-2 text-sm text-base-content [&_i]:italic">
      <span class="text-base-soft">Primary source: </span><span v-html="sanitizeAndLinkifyHtml(primaryCitation)" />
    </p>

    <p v-if="meta.description" class="mt-2 text-base-content">{{ meta.description }}</p>

    <p v-if="meta.attribution" class="mt-1 text-sm text-base-soft">{{ attributionText }}</p>

    <div class="mt-3 flex flex-wrap gap-2 text-xs text-base-soft">
      <span v-if="meta.coupletsCount" class="border border-base-muted rounded px-2 py-0.5">
        {{ meta.coupletsCount }}
      </span>
      <span v-if="meta.otusCount" class="border border-base-muted rounded px-2 py-0.5">
        {{ meta.otusCount }} taxa
      </span>
      <span v-if="meta.updatedInWords" class="border border-base-muted rounded px-2 py-0.5">
        updated {{ meta.updatedInWords }} ago
      </span>

      <button
        v-if="completeness || completenessLoading"
        type="button"
        :disabled="!completeness"
        class="border rounded px-2 py-0.5 transition-colors"
        :class="!completeness
          ? 'border-warning text-warning bg-warning/10 cursor-default'
          : completeness.isComplete
            ? 'border-success text-success bg-success/10 hover:bg-success/20 cursor-pointer'
            : 'border-danger text-danger bg-danger/10 hover:bg-danger/20 cursor-pointer'"
        @click="completeness && (showCompleteness = 'taxonomy')"
        @keydown.enter="completeness && (showCompleteness = 'taxonomy')"
        @keydown.space.prevent="completeness && (showCompleteness = 'taxonomy')"
      >Taxonomy: {{ !completeness
        ? 'loading…'
        : completeness.isComplete
          ? `complete (${completeness.expectedCount})`
          : `${completeness.coveredCount} / ${completeness.expectedCount}` }}</button>

      <GeographyPicker
        class="key-print-hide"
        :model-value="geoSelection"
        :groupings="geoGroupings"
        :territories="geoTerritories"
        :loading="geoLoading"
        @update:model-value="$emit('update:geoSelection', $event)"
        @open="$emit('geoOpen')"
      />

      <button
        v-if="completeness && completeness.geographic"
        type="button"
        :disabled="geoLoading"
        class="border rounded px-2 py-0.5 transition-colors"
        :class="geoLoading
          ? 'border-warning text-warning bg-warning/10 cursor-default'
          : completeness.geographic.isComplete
            ? 'border-success text-success bg-success/10 hover:bg-success/20 cursor-pointer'
            : 'border-danger text-danger bg-danger/10 hover:bg-danger/20 cursor-pointer'"
        @click="!geoLoading && (showCompleteness = 'geography')"
        @keydown.enter="!geoLoading && (showCompleteness = 'geography')"
        @keydown.space.prevent="!geoLoading && (showCompleteness = 'geography')"
      >{{ completeness.geographic.label }}: {{ geoLoading
        ? 'loading…'
        : completeness.geographic.isComplete
          ? `complete (${completeness.geographic.expectedCount})`
          : `${completeness.geographic.keyedCount} / ${completeness.geographic.expectedCount}` }}</button>

      <button
        v-if="references.length > 1 || (references.length === 1 && !references[0].isPrimary)"
        type="button"
        class="border border-base-muted rounded px-2 py-0.5 cursor-pointer transition-colors bg-base-muted/40 hover:bg-base-muted/70 hover:text-base-content"
        @click="showReferences = true"
      >References cited ({{ references.length }})</button>
    </div>

    <VModal v-if="showCompleteness && completeness" @close="showCompleteness = null">
      <template #header><div class="text-sm font-medium">{{
        showCompleteness === 'geography'
          ? `Completeness in ${completeness.geographic?.label || 'the selected area'}`
          : 'Completeness'
      }}</div></template>
      <div class="px-4 pb-4">
        <CompletenessReport :report="completeness" :mode="showCompleteness" />
      </div>
    </VModal>

    <VModal v-if="showReferences" @close="showReferences = false">
      <template #header><div class="text-sm font-medium">References cited</div></template>
      <ul class="px-4 pb-4 text-sm leading-relaxed space-y-2 [&_i]:italic">
        <li v-for="(r, i) in references" :key="i">
          <span v-if="r.isPrimary" class="text-base-soft">[primary] </span><span v-html="sanitizeAndLinkifyHtml(r.full)" />
        </li>
      </ul>
    </VModal>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { sanitizeAndLinkifyHtml } from '@/utils'
import CompletenessReport from './CompletenessReport.vue'
import GeographyPicker from './GeographyPicker.vue'
import taxaListRaw from '/pages/taxa/constants/taxa.js'

const props = defineProps({
  meta: { type: Object, required: true },
  completeness: { type: Object, default: null },
  completenessLoading: { type: Boolean, default: false },
  references: { type: Array, default: () => [] },
  primaryCitation: { type: String, default: null },
  geoGroupings: { type: Array, default: () => [] },
  geoTerritories: { type: Array, default: () => [] },
  geoLoading: { type: Boolean, default: false },
  geoSelection: {
    type: Object,
    default: () => ({ groupings: [], territories: [] })
  }
})
defineEmits(['update:geoSelection', 'geoOpen'])

// Amber palette — matches the Keys list page.
const AMBER = { name: '#854F0B' }

// null | 'taxonomy' | 'geography' — which completeness modal is open
const showCompleteness = ref(null)
const showReferences = ref(false)

// --- Italicize genus names in plain-text titles/scope -------------------------
// Only genera (from the taxa list) get italicized; families like "Syrphidae"
// stay roman. Same rule as the Keys list page.
const genusNames = (Array.isArray(taxaListRaw) ? taxaListRaw : [])
  .map((t) => String(t.taxonName || '').replace(/<[^>]*>/g, '').trim())
  .filter(Boolean)

const genusRegex = (() => {
  if (!genusNames.length) return null
  const escaped = genusNames
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'g')
})()

function italicizeGenera(text) {
  const escaped = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  if (!genusRegex) return escaped
  return escaped.replace(genusRegex, '<i>$1</i>')
}

// Title with genus names italicized (meta.title is plain text like "Doros (EN)").
const titleHtml = computed(() => italicizeGenera(props.meta.title))

// Plain-text scope fallback with genera italicized. (When taxonomicScopeHtml is
// present it's already marked up upstream, so this only feeds the text branch.)
const scopeHtml = computed(() => italicizeGenera(props.meta.taxonomicScope))

// attribution shape from TaxonWorks attribution_to_json is loosely specified; render a
// best-effort string and never throw.
const attributionText = computed(() => {
  const a = props.meta.attribution
  if (!a) return ''
  if (typeof a === 'string') return a
  return a.label || a.text || ''
})
</script>