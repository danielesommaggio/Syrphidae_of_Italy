<template>
  <div class="soi-atlas-map relative">
    <svg
      :viewBox="VIEWBOX"
      class="w-full h-auto block"
      role="img"
      :aria-label="t('mapLabel')"
      @mouseleave="hover = null"
    >
      <g>
        <path
          v-for="r in regions"
          :key="r.name"
          :d="r.d"
          class="soi-region"
          :class="{ on: selected === r.name, hot: hover?.name === r.name }"
          :style="{ fill: fillFor(r.name) }"
          tabindex="0"
          role="button"
          :aria-label="`${r.name}: ${countLabel(r.name)}`"
          :aria-pressed="selected === r.name"
          @mousemove="onMove($event, r)"
          @click="$emit('select', r.name)"
          @keydown.enter.prevent="$emit('select', r.name)"
          @keydown.space.prevent="$emit('select', r.name)"
        />
      </g>
    </svg>

    <div
      v-if="hover"
      class="soi-tip"
      :style="{ left: hover.x + 'px', top: hover.y + 'px' }"
    >
      <strong>{{ hover.name }}</strong>
      <span>{{ countLabel(hover.name) }}</span>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs soi-muted">
      <span class="font-semibold text-[color:var(--soi-ink)]">{{ t('legend') }}</span>
      <span
        v-for="(b, i) in BINS"
        :key="i"
        class="inline-flex items-center gap-1.5"
      >
        <span
          class="soi-swatch"
          :style="{ background: rampColor(i) }"
        />
        {{ b.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import regionShapes, { VIEWBOX } from './italyRegions.js'
import { useT } from '@/utils/soiLang.js'

const props = defineProps({
  counts: { type: Object, default: () => ({}) },
  selected: { type: String, default: null },
  loading: { type: Boolean, default: false }
})
defineEmits(['select'])

const t = useT({
  en: { mapLabel: 'Map of Italy coloured by number of records per region', legend: 'Records', none: 'no records', rec: '{n} records', one: '1 record', loading: 'loading…' },
  it: { mapLabel: 'Mappa d’Italia colorata per numero di record per regione', legend: 'Record', none: 'nessun record', rec: '{n} record', one: '1 record', loading: 'caricamento…' }
})

const regions = regionShapes

const BINS = [
  { min: 0, max: 0, label: '0' },
  { min: 1, max: 9, label: '1–9' },
  { min: 10, max: 49, label: '10–49' },
  { min: 50, max: 199, label: '50–199' },
  { min: 200, max: 999, label: '200–999' },
  { min: 1000, max: Infinity, label: '1000+' }
]

function binOf(n) {
  return BINS.findIndex((b) => n >= b.min && n <= b.max)
}

function rampColor(i) {
  return `var(--soi-ramp-${i})`
}

function fillFor(name) {
  const n = props.counts[name]?.records
  if (n === undefined) return 'var(--soi-ramp-0)'
  return rampColor(binOf(n))
}

function countLabel(name) {
  const n = props.counts[name]?.records
  if (n === undefined) return t('loading')
  if (!n) return t('none')
  return n === 1 ? t('one') : t('rec', { n: n.toLocaleString('en-US') })
}

const hover = ref(null)
function onMove(e, r) {
  const box = e.currentTarget.ownerSVGElement.parentElement.getBoundingClientRect()
  hover.value = { name: r.name, x: e.clientX - box.left + 14, y: e.clientY - box.top + 14 }
}
</script>

<style scoped>
.soi-atlas-map {
  --soi-ramp-0: #ece6d6;
  --soi-ramp-1: #f6e6b0;
  --soi-ramp-2: #efcd6a;
  --soi-ramp-3: #dba92a;
  --soi-ramp-4: #ad7d14;
  --soi-ramp-5: #6e4f0c;
}
.soi-region {
  stroke: var(--soi-paper);
  stroke-width: 1.4;
  stroke-linejoin: round;
  cursor: pointer;
  transition: fill 0.4s;
  outline: none;
}
.soi-region.hot,
.soi-region:focus-visible {
  stroke: var(--soi-ink);
  stroke-width: 2;
}
.soi-region.on {
  stroke: var(--soi-ink);
  stroke-width: 2.6;
}
.soi-tip {
  position: absolute;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0.4rem 0.65rem;
  background: var(--soi-ink);
  color: var(--soi-paper);
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 5;
}
.soi-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--soi-rule);
}
</style>
