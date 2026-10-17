<template>
  <svg
    v-if="hasMap"
    :viewBox="VIEWBOX"
    class="soi-area-map"
    role="img"
    :aria-label="label"
  >
    <title>{{ label }}</title>
    <path
      v-for="r in shapes"
      :key="r.name"
      :d="r.d"
      :class="{ on: present.has(r.name), absent: absent.has(r.name) }"
    />
  </svg>
</template>

<script setup>
// A small map of Italy with the regions of a record highlighted.
// `areas` is a list of { name, absent } with TaxonWorks geographic area names;
// "Italy"/"Italia" lights up the whole country, names outside Italy are ignored
// (italyAreas.js isItalian() tells the caller whether a map will be drawn).
import { computed } from 'vue'
import shapes, { VIEWBOX } from '~/pages/components/Atlas/italyRegions.js'
import { regionOf } from './italyAreas.js'

const props = defineProps({
  areas: { type: Array, default: () => [] }
})

const matched = computed(() => props.areas.map((a) => ({ ...a, region: regionOf(a.name) })).filter((a) => a.region))

const present = computed(() => {
  const set = new Set()
  matched.value
    .filter((a) => !a.absent)
    .forEach((a) => (a.region === '*' ? shapes.forEach((s) => set.add(s.name)) : set.add(a.region)))
  return set
})
const absent = computed(() => new Set(matched.value.filter((a) => a.absent && a.region !== '*').map((a) => a.region)))
const hasMap = computed(() => matched.value.length > 0)
const label = computed(() => matched.value.map((a) => a.name).join(', '))
</script>

<style scoped>
.soi-area-map {
  display: block;
  width: 3.8rem;
  height: auto;
  flex: none;
}
.soi-area-map path {
  fill: rgba(var(--color-base-content), 0.17);
  stroke: rgb(var(--color-base-foreground));
  stroke-width: 2.5;
  stroke-linejoin: round;
}
.soi-area-map path.on {
  fill: var(--soi-yellow-deep, #9a6a12);
}
.soi-area-map path.absent {
  fill: none;
  stroke: rgba(var(--color-base-content), 0.55);
  stroke-dasharray: 8 6;
}
</style>
