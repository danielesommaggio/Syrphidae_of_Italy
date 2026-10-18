<template>
  <div
    ref="el"
    class="soi-pmap"
    :style="{ height }"
    role="region"
    :aria-label="label"
  />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  // [{ lat, lng, html }]
  points: { type: Array, default: () => [] },
  height: { type: String, default: '520px' },
  label: { type: String, default: '' }
})

const el = ref(null)
let L = null
let map = null
let layer = null

function clusterIcon(cluster) {
  const n = cluster.getChildCount()
  const size = n < 10 ? 30 : n < 100 ? 36 : n < 1000 ? 44 : 52
  return L.divIcon({
    html: `<span>${n.toLocaleString('en-US')}</span>`,
    className: 'soi-cluster',
    iconSize: [size, size]
  })
}

function draw() {
  if (!map || !L) return
  if (layer) layer.remove()
  layer = L.markerClusterGroup
    ? L.markerClusterGroup({ iconCreateFunction: clusterIcon, showCoverageOnHover: false, maxClusterRadius: 45, chunkedLoading: true })
    : L.layerGroup()
  const bounds = []
  props.points.forEach((p) => {
    const m = L.circleMarker([p.lat, p.lng], { radius: 6, color: '#22281c', weight: 1.5, fillColor: '#f0b81f', fillOpacity: 0.95 })
    if (p.html) m.bindPopup(p.html)
    layer.addLayer(m)
    bounds.push([p.lat, p.lng])
  })
  layer.addTo(map)
  if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 9 })
  else if (bounds.length === 1) map.setView(bounds[0], 9)
}

onMounted(async () => {
  const mod = await import('leaflet')
  L = mod.default || mod
  window.L = window.L || L // leaflet.markercluster attaches itself to the global L
  await import('leaflet/dist/leaflet.css')
  try {
    await import('leaflet.markercluster')
    await import('leaflet.markercluster/dist/MarkerCluster.css')
  } catch {
    /* plain points without clustering */
  }
  map = L.map(el.value, { scrollWheelZoom: false }).setView([42.3, 12.5], 5)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 16
  }).addTo(map)
  draw()
})

watch(() => props.points, draw)

onBeforeUnmount(() => {
  if (map) map.remove()
})
</script>

<style scoped>
.soi-pmap {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  z-index: 0;
  border: 1px solid var(--soi-rule);
  background: var(--soi-paper-2);
}
.soi-pmap :deep(.soi-cluster) {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(240, 184, 31, 0.9);
  border: 2px solid #22281c;
  box-shadow: 0 0 0 4px rgba(240, 184, 31, 0.3);
  color: #22281c;
  font: 700 12px/1 system-ui, sans-serif;
}
.soi-pmap :deep(.leaflet-popup-content) {
  font-size: 0.82rem;
  line-height: 1.45;
}
.soi-pmap :deep(.leaflet-popup-content a) {
  color: #9a6a12;
  text-decoration: underline;
}
</style>
