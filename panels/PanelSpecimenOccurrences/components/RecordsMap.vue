<template>
  <div class="px-2">
    <div
      v-if="!points.length"
      class="text-sm opacity-50 py-4"
    >
      No georeferenced records for the current filters.
    </div>
    <template v-else>
      <div
        ref="el"
        class="w-full rounded-md overflow-hidden"
        style="height: 360px; z-index: 0"
        role="img"
        :aria-label="`Map of ${points.length} georeferenced records`"
      />
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
        <span
          v-for="k in legend"
          :key="k.key"
          class="inline-flex items-center gap-1.5"
        >
          <span
            class="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-black/40"
            :style="{ background: k.color }"
          />
          {{ k.label }} <span class="opacity-60">{{ k.n }}</span>
        </span>
        <span
          v-if="notMapped"
          class="opacity-50 ml-auto"
          >{{ notMapped }} without coordinates</span
        >
      </div>
    </template>
  </div>
</template>

<script setup>
// Small Leaflet map of the records on this tab, one dot per record coloured by
// kind (type / specimen / field occurrence). Clicking a dot opens the record.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { KIND_COLORS } from '../config.js'
import { makeTileFromConfiguration } from '@/components/Map/utils/makeTileFromConfiguration'

const props = defineProps({
  // [{ lat, lng, kind: 'type'|'specimen'|'field', label, detail }]
  points: { type: Array, default: () => [] },
  notMapped: { type: Number, default: 0 }
})
const emit = defineEmits(['show-detail'])

const LABELS = { type: 'Type specimens', specimen: 'Specimens', field: 'Field occurrences' }
const legend = computed(() =>
  Object.keys(LABELS)
    .map((key) => ({ key, label: LABELS[key], color: cssColor(KIND_COLORS[key]), n: props.points.filter((p) => p.kind === key).length }))
    .filter((k) => k.n)
)

const el = ref(null)
let L = null
let map = null
let layer = null

// Leaflet needs a real colour string; resolve CSS variables through the DOM
function cssColor(c) {
  if (typeof document === 'undefined' || !c.includes('var(')) return c
  const probe = document.createElement('span')
  probe.style.color = c
  document.body.appendChild(probe)
  const out = getComputedStyle(probe).color
  probe.remove()
  return out
}

function draw() {
  if (!map || !L) return
  if (layer) layer.remove()
  layer = L.featureGroup()
  // types drawn last, on top
  const order = { field: 0, specimen: 1, type: 2 }
  ;[...props.points]
    .sort((a, b) => order[a.kind] - order[b.kind])
    .forEach((p) => {
      const m = L.circleMarker([p.lat, p.lng], {
        radius: p.kind === 'type' ? 7 : 5.5,
        color: '#1a1c16',
        weight: 1,
        fillColor: cssColor(KIND_COLORS[p.kind]),
        fillOpacity: 0.9
      })
      m.bindTooltip(p.label)
      if (p.detail) m.on('click', () => emit('show-detail', p.detail))
      m.addTo(layer)
    })
  layer.addTo(map)
  const b = layer.getBounds()
  if (b.isValid()) map.fitBounds(b, { padding: [24, 24], maxZoom: 9 })
}

async function init() {
  if (map || !el.value) return
  L = (await import('leaflet')).default
  map = L.map(el.value, { scrollWheelZoom: false }).setView([42.5, 12.5], 5)
  // same base map as the site's other maps (config/maps.yml)
  const [tile] = Object.values(makeTileFromConfiguration(L, { maxZoom: 17, className: 'map-tiles' }))
  tile.addTo(map)
  draw()
}

onMounted(init)
watch(
  () => props.points,
  async () => {
    await nextTick()
    if (!map) init()
    else draw()
  }
)
onBeforeUnmount(() => map && map.remove())

</script>
